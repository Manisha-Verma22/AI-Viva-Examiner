"""Registration, login and 'who am I'"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Institution, User
from ..schemas import (
    LoginRequest,
    MessageOut,
    StudentRegister,
    TeacherRegister,
    TokenOut,
    UserOut,
)
from ..security import create_access_token, hash_password, verify_password
from ..services import user_out

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _ensure_institution(db: Session, institution_id: int) -> Institution:
    institution = db.get(Institution, institution_id)

    if institution is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Institution not found.")

    return institution


def _ensure_email_free(db: Session, institution_id: int, email: str) -> None:
    existing = db.scalar(
        select(User.id).where(
            User.institution_id == institution_id, User.email == email
        )
    )

    if existing is not None:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "An account with this email already exists at this institution.",
        )


@router.post(
    "/register/teacher",
    response_model=MessageOut,
    status_code=status.HTTP_201_CREATED,
)
def register_teacher(payload: TeacherRegister, db: Session = Depends(get_db)):
    _ensure_institution(db, payload.institution_id)
    _ensure_email_free(db, payload.institution_id, payload.email)

    db.add(
        User(
            institution_id=payload.institution_id,
            role="teacher",
            status="pending",
            name=payload.name.strip(),
            email=payload.email,
            password_hash=hash_password(payload.password),
            department=payload.department.strip(),
            teacher_code=payload.teacher_code.strip(),
        )
    )
    db.commit()

    return MessageOut(
        message="Registration submitted. Your institution administrator will review it."
    )


@router.post(
    "/register/student",
    response_model=MessageOut,
    status_code=status.HTTP_201_CREATED,
)
def register_student(payload: StudentRegister, db: Session = Depends(get_db)):
    _ensure_institution(db, payload.institution_id)
    _ensure_email_free(db, payload.institution_id, payload.email)

    db.add(
        User(
            institution_id=payload.institution_id,
            role="student",
            status="pending",
            name=payload.name.strip(),
            email=payload.email,
            password_hash=hash_password(payload.password),
            course=payload.course.strip(),
            batch=payload.batch.strip(),
            roll_no=payload.roll_no.strip(),
        )
    )
    db.commit()

    return MessageOut(
        message="Registration submitted. Your institution administrator will review it."
    )


@router.post("/login", response_model=TokenOut)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(
        select(User).where(
            User.institution_id == payload.institution_id,
            User.email == payload.email,
            User.role == payload.role,
        )
    )

    # Same message for "no such user" and "wrong password" on purpose
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, "Incorrect email or password."
        )

    if user.status == "pending":
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Your account is waiting for approval from your institution administrator.",
        )

    if user.status != "active":
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Your registration was not approved. Please contact your institution.",
        )

    token = create_access_token(user.id, user.role, user.institution_id)

    return TokenOut(access_token=token, user=user_out(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user_out(user)
