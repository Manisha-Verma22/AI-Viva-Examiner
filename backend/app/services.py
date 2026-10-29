"""Small helpers shared by several routers"""

import datetime as dt

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .models import User, Viva, VivaResult
from .schemas import (
    MetricOut,
    QuestionOut,
    RecordOut,
    ResultOut,
    StudentOut,
    UserOut,
    VivaOut,
)


def user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        role=user.role,  # type: ignore[arg-type]
        status=user.status,
        name=user.name,
        email=user.email,
        institution_id=user.institution_id,
        institution_name=user.institution.name,
        institution_short=user.institution.short_name,
        department=user.department,
        course=user.course,
        batch=user.batch,
        roll_no=user.roll_no,
        teacher_code=user.teacher_code,
    )


def student_count(db: Session, institution_id: int, batch: str) -> int:
    return (
        db.scalar(
            select(func.count(User.id)).where(
                User.institution_id == institution_id,
                User.role == "student",
                User.status == "active",
                User.batch == batch,
            )
        )
        or 0
    )


def display_status(viva: Viva) -> str:
    if viva.status == "completed":
        return "Completed"

    if viva.status == "cancelled":
        return "Cancelled"

    return "Upcoming" if viva.viva_date == dt.date.today() else "Scheduled"


def viva_out(db: Session, viva: Viva) -> VivaOut:
    return VivaOut(
        id=viva.id,
        subject=viva.subject,
        department=viva.department,
        course=viva.course,
        semester=viva.semester,
        batch=viva.batch,
        date=viva.viva_date,
        time=viva.start_time,
        duration_minutes=viva.duration_minutes,
        status=display_status(viva),
        students=student_count(db, viva.institution_id, viva.batch),
        teacher_name=viva.teacher.name,
        material_name=viva.material.original_name if viva.material else None,
    )


def format_duration(seconds: int) -> str:
    return f"{seconds // 60:02d}:{seconds % 60:02d}"


def result_out(result: VivaResult) -> ResultOut:
    return ResultOut(
        id=result.id,
        student_name=result.student.name,
        subject=result.viva.subject,
        date=result.completed_at.date(),
        duration=format_duration(result.duration_seconds),
        score=result.overall_score,
    )


def student_stats(db: Session, institution_id: int) -> dict[int, tuple[int, int]]:
    """student_id -> (number of vivas taken, average score)"""
    rows = db.execute(
        select(
            VivaResult.student_id,
            func.count(VivaResult.id),
            func.avg(VivaResult.overall_score),
        )
        .where(VivaResult.institution_id == institution_id)
        .group_by(VivaResult.student_id)
    ).all()

    return {
        student_id: (count, round(average or 0))
        for student_id, count, average in rows
    }


def student_row(user: User, stats: dict[int, tuple[int, int]]) -> StudentOut:
    vivas, average = stats.get(user.id, (0, 0))

    return StudentOut(
        id=user.id,
        name=user.name,
        email=user.email,
        roll_no=user.roll_no,
        course=user.course,
        batch=user.batch,
        vivas=vivas,
        avg_score=average,
    )


def record_out(result: VivaResult) -> RecordOut:
    ordered = sorted(result.questions, key=lambda item: item.position)

    return RecordOut(
        id=result.id,
        student_name=result.student.name,
        subject=result.viva.subject,
        date=result.completed_at.date(),
        duration=format_duration(result.duration_seconds),
        overall=result.overall_score,
        metrics=[
            MetricOut(label=label, value=int(value))
            for label, value in (result.metrics or {}).items()
        ],
        questions=[
            QuestionOut(
                question=item.question,
                answer=item.answer,
                score=item.score,
                max_score=item.max_score,
            )
            for item in ordered
        ],
    )
