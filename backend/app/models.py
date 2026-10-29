"""Database tables.

Multi-tenant design: every row that belongs to an institution carries an
institution_id, and every query filters on it. Later each institution can be
moved to its own database without changing the API.
"""

import datetime as dt
from typing import Optional

from sqlalchemy import (
    JSON,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Institution(Base):
    __tablename__ = "institutions"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    short_name: Mapped[str] = mapped_column(String(60))
    code: Mapped[str] = mapped_column(String(20), unique=True)
    location: Mapped[str] = mapped_column(String(200), default="")
    contact_email: Mapped[str] = mapped_column(String(200), default="")
    timezone: Mapped[str] = mapped_column(String(60), default="Asia/Kolkata")
    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime, server_default=func.now()
    )


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("institution_id", "email", name="uq_user_institution_email"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    institution_id: Mapped[int] = mapped_column(
        ForeignKey("institutions.id"), index=True
    )
    role: Mapped[str] = mapped_column(String(20), index=True)  # student|teacher|admin
    status: Mapped[str] = mapped_column(
        String(20), default="pending"
    )  # pending|active|rejected
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(200))
    password_hash: Mapped[str] = mapped_column(String(300))

    # Role specific (all optional)
    department: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    course: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    batch: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    roll_no: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    teacher_code: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)

    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime, server_default=func.now()
    )

    institution: Mapped[Institution] = relationship()


class Material(Base):
    __tablename__ = "materials"

    id: Mapped[int] = mapped_column(primary_key=True)
    institution_id: Mapped[int] = mapped_column(
        ForeignKey("institutions.id"), index=True
    )
    teacher_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    subject: Mapped[str] = mapped_column(String(120))
    original_name: Mapped[str] = mapped_column(String(255))
    stored_name: Mapped[str] = mapped_column(String(255))
    size_bytes: Mapped[int] = mapped_column(Integer)
    uploaded_at: Mapped[dt.datetime] = mapped_column(
        DateTime, server_default=func.now()
    )


class Viva(Base):
    __tablename__ = "vivas"

    id: Mapped[int] = mapped_column(primary_key=True)
    institution_id: Mapped[int] = mapped_column(
        ForeignKey("institutions.id"), index=True
    )
    teacher_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    subject: Mapped[str] = mapped_column(String(120))
    department: Mapped[str] = mapped_column(String(120))
    course: Mapped[str] = mapped_column(String(120))
    semester: Mapped[str] = mapped_column(String(40))
    batch: Mapped[str] = mapped_column(String(40), index=True)
    viva_date: Mapped[dt.date] = mapped_column(Date)
    start_time: Mapped[dt.time] = mapped_column(Time)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=20)
    status: Mapped[str] = mapped_column(
        String(20), default="scheduled"
    )  # scheduled|completed|cancelled
    material_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("materials.id"), nullable=True
    )
    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime, server_default=func.now()
    )

    teacher: Mapped[User] = relationship(foreign_keys=[teacher_id])
    material: Mapped[Optional[Material]] = relationship()


class VivaResult(Base):
    __tablename__ = "viva_results"

    id: Mapped[int] = mapped_column(primary_key=True)
    institution_id: Mapped[int] = mapped_column(
        ForeignKey("institutions.id"), index=True
    )
    viva_id: Mapped[int] = mapped_column(ForeignKey("vivas.id"), index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    overall_score: Mapped[int] = mapped_column(Integer)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    metrics: Mapped[dict] = mapped_column(JSON, default=dict)
    completed_at: Mapped[dt.datetime] = mapped_column(DateTime)

    viva: Mapped[Viva] = relationship()
    student: Mapped[User] = relationship()
    questions: Mapped[list["QuestionRecord"]] = relationship(
        back_populates="result", cascade="all, delete-orphan"
    )


class QuestionRecord(Base):
    __tablename__ = "question_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    result_id: Mapped[int] = mapped_column(ForeignKey("viva_results.id"), index=True)
    position: Mapped[int] = mapped_column(Integer, default=0)
    question: Mapped[str] = mapped_column(String(1000))
    answer: Mapped[str] = mapped_column(String(4000))
    score: Mapped[int] = mapped_column(Integer)
    max_score: Mapped[int] = mapped_column(Integer, default=10)

    result: Mapped[VivaResult] = relationship(back_populates="questions")
