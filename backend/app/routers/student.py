"""Student endpoints"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_role
from ..models import User, Viva, VivaResult
from ..schemas import ResultOut, VivaOut
from ..services import result_out, viva_out

router = APIRouter(prefix="/api/student", tags=["student"])

student_only = require_role("student")


@router.get("/vivas", response_model=list[VivaOut])
def my_vivas(student: User = Depends(student_only), db: Session = Depends(get_db)):
    """Upcoming vivas scheduled for this student's batch."""
    rows = db.scalars(
        select(Viva)
        .where(
            Viva.institution_id == student.institution_id,
            Viva.batch == student.batch,
            Viva.status == "scheduled",
        )
        .order_by(Viva.viva_date, Viva.start_time)
    ).all()

    return [viva_out(db, row) for row in rows]


@router.get("/results", response_model=list[ResultOut])
def my_results(student: User = Depends(student_only), db: Session = Depends(get_db)):
    rows = db.scalars(
        select(VivaResult)
        .where(
            VivaResult.institution_id == student.institution_id,
            VivaResult.student_id == student.id,
        )
        .order_by(VivaResult.completed_at.desc())
    ).all()

    return [result_out(row) for row in rows]
