"""Institution administrator endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_role
from ..models import Institution, User, Viva, VivaResult
from ..schemas import (
    ApprovalsOut,
    BatchRow,
    CourseRow,
    DepartmentRow,
    InstitutionSettings,
    MessageOut,
    PendingPerson,
    ResultOut,
    StudentOut,
    SubjectRow,
    SummaryOut,
    TeacherOut,
    VivaOut,
)
from ..services import result_out, student_row, student_stats, viva_out

router = APIRouter(prefix="/api/admin", tags=["admin"])

admin_only = require_role("admin")


def _count_users(db: Session, institution_id: int, role: str, state: str) -> int:
    return (
        db.scalar(
            select(func.count(User.id)).where(
                User.institution_id == institution_id,
                User.role == role,
                User.status == state,
            )
        )
        or 0
    )


@router.get("/summary", response_model=SummaryOut)
def summary(admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    inst = admin.institution_id

    vivas = (
        db.scalar(
            select(func.count(Viva.id)).where(
                Viva.institution_id == inst, Viva.status != "cancelled"
            )
        )
        or 0
    )

    return SummaryOut(
        students=_count_users(db, inst, "student", "active"),
        teachers=_count_users(db, inst, "teacher", "active"),
        vivas=vivas,
        pending_approvals=_count_users(db, inst, "teacher", "pending")
        + _count_users(db, inst, "student", "pending"),
    )


# ----------------------------- Approvals -----------------------------


def _pending(db: Session, institution_id: int, role: str) -> list[User]:
    return list(
        db.scalars(
            select(User)
            .where(
                User.institution_id == institution_id,
                User.role == role,
                User.status == "pending",
            )
            .order_by(User.created_at)
        ).all()
    )


@router.get("/approvals", response_model=ApprovalsOut)
def approvals(admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    inst = admin.institution_id

    return ApprovalsOut(
        teachers=[
            PendingPerson(
                id=person.id,
                name=person.name,
                email=person.email,
                detail=person.department or "",
                extra=f"Teacher ID {person.teacher_code or '-'}",
            )
            for person in _pending(db, inst, "teacher")
        ],
        students=[
            PendingPerson(
                id=person.id,
                name=person.name,
                email=person.email,
                detail=person.course or "",
                extra=f"Batch {person.batch or '-'}",
            )
            for person in _pending(db, inst, "student")
        ],
    )


def _pending_target(db: Session, admin: User, user_id: int) -> User:
    target = db.get(User, user_id)

    # Another institution's user looks exactly like "not found"
    if (
        target is None
        or target.institution_id != admin.institution_id
        or target.role not in ("teacher", "student")
    ):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Request not found.")

    if target.status != "pending":
        raise HTTPException(
            status.HTTP_409_CONFLICT, "This request was already handled."
        )

    return target


@router.post("/users/{user_id}/approve", response_model=MessageOut)
def approve(
    user_id: int,
    admin: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    target = _pending_target(db, admin, user_id)
    target.status = "active"
    db.commit()

    return MessageOut(message=f"{target.name} was approved.")


@router.post("/users/{user_id}/reject", response_model=MessageOut)
def reject(
    user_id: int,
    admin: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    target = _pending_target(db, admin, user_id)
    target.status = "rejected"
    db.commit()

    return MessageOut(message=f"{target.name}'s request was rejected.")


# ----------------------------- Lists -----------------------------


@router.get("/teachers", response_model=list[TeacherOut])
def teachers(admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    inst = admin.institution_id

    counts = dict(
        db.execute(
            select(Viva.teacher_id, func.count(Viva.id))
            .where(Viva.institution_id == inst, Viva.status != "cancelled")
            .group_by(Viva.teacher_id)
        ).all()
    )

    rows = db.scalars(
        select(User)
        .where(
            User.institution_id == inst,
            User.role == "teacher",
            User.status == "active",
        )
        .order_by(User.name)
    ).all()

    return [
        TeacherOut(
            id=row.id,
            name=row.name,
            email=row.email,
            department=row.department,
            teacher_code=row.teacher_code,
            vivas=counts.get(row.id, 0),
        )
        for row in rows
    ]


@router.get("/students", response_model=list[StudentOut])
def students(admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    inst = admin.institution_id
    stats = student_stats(db, inst)

    rows = db.scalars(
        select(User)
        .where(
            User.institution_id == inst,
            User.role == "student",
            User.status == "active",
        )
        .order_by(User.name)
    ).all()

    return [student_row(row, stats) for row in rows]


@router.get("/vivas", response_model=list[VivaOut])
def vivas(admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    rows = db.scalars(
        select(Viva)
        .where(
            Viva.institution_id == admin.institution_id,
            Viva.status != "cancelled",
        )
        .order_by(Viva.viva_date, Viva.start_time)
    ).all()

    return [viva_out(db, row) for row in rows]


@router.get("/results", response_model=list[ResultOut])
def results(admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    rows = db.scalars(
        select(VivaResult)
        .where(VivaResult.institution_id == admin.institution_id)
        .order_by(VivaResult.completed_at.desc())
    ).all()

    return [result_out(row) for row in rows]


# ----------------------------- Institution settings -----------------------------


def _settings_out(institution: Institution) -> InstitutionSettings:
    return InstitutionSettings(
        name=institution.name,
        code=institution.code,
        contact_email=institution.contact_email,
        location=institution.location,
        timezone=institution.timezone,
    )


@router.get("/institution", response_model=InstitutionSettings)
def get_institution(
    admin: User = Depends(admin_only), db: Session = Depends(get_db)
):
    return _settings_out(db.get(Institution, admin.institution_id))  # type: ignore[arg-type]


@router.put("/institution", response_model=InstitutionSettings)
def update_institution(
    payload: InstitutionSettings,
    admin: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    institution = db.get(Institution, admin.institution_id)

    if institution is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Institution not found.")

    code = payload.code.strip().upper()

    clash = db.scalar(
        select(Institution.id).where(
            Institution.code == code, Institution.id != institution.id
        )
    )

    if clash is not None:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "That institution code is already in use."
        )

    institution.name = payload.name.strip()
    institution.code = code
    institution.contact_email = payload.contact_email.strip()
    institution.location = payload.location.strip()
    institution.timezone = payload.timezone.strip()
    db.commit()

    return _settings_out(institution)


# ----------------------------- Overview lists (derived from real data) -----------------------------


def _active_vivas(inst: int):
    return (Viva.institution_id == inst, Viva.status != "cancelled")


@router.get("/departments", response_model=list[DepartmentRow])
def departments(admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    inst = admin.institution_id

    teachers = dict(
        db.execute(
            select(User.department, func.count(User.id))
            .where(
                User.institution_id == inst,
                User.role == "teacher",
                User.status == "active",
                User.department.is_not(None),
            )
            .group_by(User.department)
        ).all()
    )
    vivas = dict(
        db.execute(
            select(Viva.department, func.count(Viva.id))
            .where(*_active_vivas(inst))
            .group_by(Viva.department)
        ).all()
    )

    return [
        DepartmentRow(name=name, teachers=teachers.get(name, 0), vivas=vivas.get(name, 0))
        for name in sorted(set(teachers) | set(vivas))
    ]


@router.get("/courses", response_model=list[CourseRow])
def courses(admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    inst = admin.institution_id

    students = dict(
        db.execute(
            select(User.course, func.count(User.id))
            .where(
                User.institution_id == inst,
                User.role == "student",
                User.status == "active",
                User.course.is_not(None),
            )
            .group_by(User.course)
        ).all()
    )
    vivas = dict(
        db.execute(
            select(Viva.course, func.count(Viva.id))
            .where(*_active_vivas(inst))
            .group_by(Viva.course)
        ).all()
    )

    return [
        CourseRow(name=name, students=students.get(name, 0), vivas=vivas.get(name, 0))
        for name in sorted(set(students) | set(vivas))
    ]


@router.get("/subjects", response_model=list[SubjectRow])
def subjects(admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    rows = db.execute(
        select(Viva.subject, Viva.department, Viva.semester, func.count(Viva.id))
        .where(*_active_vivas(admin.institution_id))
        .group_by(Viva.subject, Viva.department, Viva.semester)
        .order_by(Viva.subject)
    ).all()

    return [
        SubjectRow(name=name, department=department, semester=semester, vivas=count)
        for name, department, semester, count in rows
    ]


@router.get("/batches", response_model=list[BatchRow])
def batches(admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    inst = admin.institution_id

    students = dict(
        db.execute(
            select(User.batch, func.count(User.id))
            .where(
                User.institution_id == inst,
                User.role == "student",
                User.status == "active",
                User.batch.is_not(None),
            )
            .group_by(User.batch)
        ).all()
    )
    vivas = dict(
        db.execute(
            select(Viva.batch, func.count(Viva.id))
            .where(*_active_vivas(inst))
            .group_by(Viva.batch)
        ).all()
    )

    return [
        BatchRow(name=name, students=students.get(name, 0), vivas=vivas.get(name, 0))
        for name in sorted(set(students) | set(vivas))
    ]
