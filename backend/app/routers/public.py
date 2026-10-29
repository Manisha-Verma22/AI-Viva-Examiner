"""Endpoints that need no login"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Institution
from ..schemas import InstitutionOut

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/institutions", response_model=list[InstitutionOut])
def list_institutions(db: Session = Depends(get_db)):
    rows = db.scalars(select(Institution).order_by(Institution.name)).all()

    return [
        InstitutionOut(
            id=row.id,
            name=row.name,
            short_name=row.short_name,
            code=row.code,
            location=row.location,
        )
        for row in rows
    ]
