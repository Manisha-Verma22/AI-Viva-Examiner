"""Request and response shapes (Pydantic v2)"""

import datetime as dt
import re
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_serializer, field_validator

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

Role = Literal["student", "teacher", "admin"]


class _WithEmail(BaseModel):
    email: str = Field(max_length=200)

    @field_validator("email", mode="before")
    @classmethod
    def _clean_email(cls, value):
        # Trim spaces and lowercase BEFORE checking the format
        if isinstance(value, str):
            return value.strip().lower()

        return value

    @field_validator("email")
    @classmethod
    def _check_email(cls, value: str) -> str:
        if not re.match(EMAIL_PATTERN, value):
            raise ValueError("Enter a valid email address.")

        return value


# ----------------------------- Auth -----------------------------


class TeacherRegister(_WithEmail):
    name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)
    institution_id: int
    department: str = Field(min_length=2, max_length=120)
    teacher_code: str = Field(min_length=1, max_length=40)


class StudentRegister(_WithEmail):
    name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)
    institution_id: int
    course: str = Field(min_length=2, max_length=120)
    batch: str = Field(min_length=4, max_length=40)
    roll_no: str = Field(min_length=1, max_length=40)


class LoginRequest(_WithEmail):
    password: str = Field(min_length=1, max_length=128)
    institution_id: int
    role: Role


class UserOut(BaseModel):
    id: int
    role: Role
    status: str
    name: str
    email: str
    institution_id: int
    institution_name: str
    institution_short: str
    department: Optional[str] = None
    course: Optional[str] = None
    batch: Optional[str] = None
    roll_no: Optional[str] = None
    teacher_code: Optional[str] = None


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MessageOut(BaseModel):
    message: str


class InstitutionOut(BaseModel):
    id: int
    name: str
    short_name: str
    code: str
    location: str


class InstitutionSettings(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    code: str = Field(min_length=2, max_length=20)
    contact_email: str = Field(max_length=200)
    location: str = Field(max_length=200)
    timezone: str = Field(max_length=60)


# ----------------------------- Vivas -----------------------------


class VivaIn(BaseModel):
    subject: str = Field(min_length=2, max_length=120)
    department: str = Field(min_length=2, max_length=120)
    course: str = Field(min_length=2, max_length=120)
    semester: str = Field(min_length=2, max_length=40)
    batch: str = Field(min_length=4, max_length=40)
    date: dt.date
    time: dt.time
    duration_minutes: int = Field(ge=5, le=180)
    material_id: Optional[int] = None


class VivaOut(BaseModel):
    id: int
    subject: str
    department: str
    course: str
    semester: str
    batch: str
    date: dt.date
    time: dt.time
    duration_minutes: int
    status: str  # Upcoming | Scheduled | Completed | Cancelled
    students: int
    teacher_name: str
    material_name: Optional[str] = None

    @field_serializer("time")
    def _format_time(self, value: dt.time) -> str:
        return value.strftime("%H:%M")


# ----------------------------- People -----------------------------


class StudentOut(BaseModel):
    id: int
    name: str
    email: str
    roll_no: Optional[str]
    course: Optional[str]
    batch: Optional[str]
    vivas: int
    avg_score: int


class TeacherOut(BaseModel):
    id: int
    name: str
    email: str
    department: Optional[str]
    teacher_code: Optional[str]
    vivas: int


class PendingPerson(BaseModel):
    id: int
    name: str
    email: str
    detail: str  # department or course
    extra: str  # teacher id or batch


class ApprovalsOut(BaseModel):
    teachers: list[PendingPerson]
    students: list[PendingPerson]


class SummaryOut(BaseModel):
    students: int
    teachers: int
    vivas: int
    pending_approvals: int


# ----------------------------- Results & records -----------------------------


class ResultOut(BaseModel):
    id: int
    student_name: str
    subject: str
    date: dt.date
    duration: str  # mm:ss
    score: int


class MetricOut(BaseModel):
    label: str
    value: int


class QuestionOut(BaseModel):
    question: str
    answer: str
    score: int
    max_score: int


class RecordOut(BaseModel):
    id: int
    student_name: str
    subject: str
    date: dt.date
    duration: str
    overall: int
    metrics: list[MetricOut]
    questions: list[QuestionOut]


# ----------------------------- Materials -----------------------------


class MaterialOut(BaseModel):
    id: int
    name: str
    subject: str
    size_bytes: int
    uploaded_at: dt.datetime


# ----------------------------- Admin overview lists -----------------------------


class DepartmentRow(BaseModel):
    name: str
    teachers: int
    vivas: int


class CourseRow(BaseModel):
    name: str
    students: int
    vivas: int


class SubjectRow(BaseModel):
    name: str
    department: str
    semester: str
    vivas: int


class BatchRow(BaseModel):
    name: str
    students: int
    vivas: int
