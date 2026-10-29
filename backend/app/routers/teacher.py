"""Teacher endpoints: vivas, students, results, records and study material"""

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..deps import require_role
from ..models import Material, User, Viva, VivaResult
from ..schemas import (
    MaterialOut,
    MessageOut,
    RecordOut,
    ResultOut,
    StudentOut,
    VivaIn,
    VivaOut,
)
from ..services import (
    record_out,
    result_out,
    student_row,
    student_stats,
    viva_out,
)

router = APIRouter(prefix="/api/teacher", tags=["teacher"])

teacher_only = require_role("teacher")


# ----------------------------- Vivas -----------------------------


def _own_viva(db: Session, teacher: User, viva_id: int) -> Viva:
    viva = db.get(Viva, viva_id)

    if (
        viva is None
        or viva.institution_id != teacher.institution_id
        or viva.teacher_id != teacher.id
    ):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Viva not found.")

    return viva


def _check_material(db: Session, teacher: User, material_id: int | None) -> None:
    if material_id is None:
        return

    material = db.get(Material, material_id)

    if material is None or material.teacher_id != teacher.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unknown study material.")


@router.get("/vivas", response_model=list[VivaOut])
def list_vivas(teacher: User = Depends(teacher_only), db: Session = Depends(get_db)):
    rows = db.scalars(
        select(Viva)
        .where(
            Viva.institution_id == teacher.institution_id,
            Viva.teacher_id == teacher.id,
            Viva.status != "cancelled",
        )
        .order_by(Viva.viva_date, Viva.start_time)
    ).all()

    return [viva_out(db, row) for row in rows]


@router.post("/vivas", response_model=VivaOut, status_code=status.HTTP_201_CREATED)
def create_viva(
    payload: VivaIn,
    teacher: User = Depends(teacher_only),
    db: Session = Depends(get_db),
):
    _check_material(db, teacher, payload.material_id)

    viva = Viva(
        institution_id=teacher.institution_id,
        teacher_id=teacher.id,
        subject=payload.subject.strip(),
        department=payload.department,
        course=payload.course,
        semester=payload.semester,
        batch=payload.batch,
        viva_date=payload.date,
        start_time=payload.time,
        duration_minutes=payload.duration_minutes,
        material_id=payload.material_id,
        status="scheduled",
    )
    db.add(viva)
    db.commit()
    db.refresh(viva)

    return viva_out(db, viva)


@router.put("/vivas/{viva_id}", response_model=VivaOut)
def update_viva(
    viva_id: int,
    payload: VivaIn,
    teacher: User = Depends(teacher_only),
    db: Session = Depends(get_db),
):
    viva = _own_viva(db, teacher, viva_id)

    if viva.status == "completed":
        raise HTTPException(
            status.HTTP_409_CONFLICT, "A completed viva cannot be edited."
        )

    _check_material(db, teacher, payload.material_id)

    viva.subject = payload.subject.strip()
    viva.department = payload.department
    viva.course = payload.course
    viva.semester = payload.semester
    viva.batch = payload.batch
    viva.viva_date = payload.date
    viva.start_time = payload.time
    viva.duration_minutes = payload.duration_minutes

    if payload.material_id is not None:
        viva.material_id = payload.material_id

    db.commit()
    db.refresh(viva)

    return viva_out(db, viva)


@router.delete("/vivas/{viva_id}", response_model=MessageOut)
def cancel_viva(
    viva_id: int,
    teacher: User = Depends(teacher_only),
    db: Session = Depends(get_db),
):
    viva = _own_viva(db, teacher, viva_id)

    if viva.status == "completed":
        raise HTTPException(
            status.HTTP_409_CONFLICT, "A completed viva cannot be cancelled."
        )

    viva.status = "cancelled"
    db.commit()

    return MessageOut(message="Viva cancelled.")


# ----------------------------- Students -----------------------------


@router.get("/students", response_model=list[StudentOut])
def list_students(
    batch: str | None = None,
    teacher: User = Depends(teacher_only),
    db: Session = Depends(get_db),
):
    stats = student_stats(db, teacher.institution_id)

    query = select(User).where(
        User.institution_id == teacher.institution_id,
        User.role == "student",
        User.status == "active",
    )

    if batch:
        query = query.where(User.batch == batch)

    rows = db.scalars(query.order_by(User.name)).all()

    return [student_row(row, stats) for row in rows]


# ----------------------------- Results & records -----------------------------


def _own_results_query(teacher: User):
    return (
        select(VivaResult)
        .join(Viva, VivaResult.viva_id == Viva.id)
        .where(
            VivaResult.institution_id == teacher.institution_id,
            Viva.teacher_id == teacher.id,
        )
    )


@router.get("/results", response_model=list[ResultOut])
def list_results(
    teacher: User = Depends(teacher_only), db: Session = Depends(get_db)
):
    rows = db.scalars(
        _own_results_query(teacher).order_by(VivaResult.completed_at.desc())
    ).all()

    return [result_out(row) for row in rows]


@router.get("/records/{result_id}", response_model=RecordOut)
def get_record(
    result_id: int,
    teacher: User = Depends(teacher_only),
    db: Session = Depends(get_db),
):
    result = db.scalar(_own_results_query(teacher).where(VivaResult.id == result_id))

    if result is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Record not found.")

    return record_out(result)


# ----------------------------- Study material -----------------------------


def _material_out(material: Material) -> MaterialOut:
    return MaterialOut(
        id=material.id,
        name=material.original_name,
        subject=material.subject,
        size_bytes=material.size_bytes,
        uploaded_at=material.uploaded_at,
    )


@router.get("/materials", response_model=list[MaterialOut])
def list_materials(
    teacher: User = Depends(teacher_only), db: Session = Depends(get_db)
):
    rows = db.scalars(
        select(Material)
        .where(
            Material.institution_id == teacher.institution_id,
            Material.teacher_id == teacher.id,
        )
        .order_by(Material.uploaded_at.desc())
    ).all()

    return [_material_out(row) for row in rows]


@router.post(
    "/materials", response_model=MaterialOut, status_code=status.HTTP_201_CREATED
)
async def upload_material(
    subject: str = Form(..., min_length=2, max_length=120),
    file: UploadFile = File(...),
    teacher: User = Depends(teacher_only),
    db: Session = Depends(get_db),
):
    original = Path(file.filename or "").name
    extension = Path(original).suffix.lower()

    if extension not in settings.allowed_upload_extensions:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Please upload a PDF, DOC, DOCX or TXT file.",
        )

    folder = settings.upload_dir / str(teacher.institution_id)
    folder.mkdir(parents=True, exist_ok=True)

    stored_name = f"{uuid.uuid4().hex}{extension}"
    target = folder / stored_name
    size = 0
    too_big = False

    with open(target, "wb") as output:
        while True:
            chunk = await file.read(1024 * 1024)

            if not chunk:
                break

            size += len(chunk)

            if size > settings.max_upload_bytes:
                too_big = True
                break

            output.write(chunk)

    if too_big:
        target.unlink(missing_ok=True)
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            "File must be smaller than 10 MB.",
        )

    material = Material(
        institution_id=teacher.institution_id,
        teacher_id=teacher.id,
        subject=subject.strip(),
        original_name=original[:255] or stored_name,
        stored_name=stored_name,
        size_bytes=size,
    )
    db.add(material)
    db.commit()
    db.refresh(material)

    return _material_out(material)


@router.delete("/materials/{material_id}", response_model=MessageOut)
def delete_material(
    material_id: int,
    teacher: User = Depends(teacher_only),
    db: Session = Depends(get_db),
):
    material = db.get(Material, material_id)

    if material is None or material.teacher_id != teacher.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Material not found.")

    in_use = db.scalar(select(Viva.id).where(Viva.material_id == material.id))

    if in_use is not None:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "This material is attached to a viva and cannot be removed.",
        )

    path = settings.upload_dir / str(material.institution_id) / material.stored_name
    path.unlink(missing_ok=True)

    db.delete(material)
    db.commit()

    return MessageOut(message="Study material removed.")
