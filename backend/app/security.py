"""Password hashing and login tokens.

Passwords use PBKDF2-SHA256 from the Python standard library (no extra
packages). Tokens are signed JWTs.
"""

import base64
import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone

import jwt

from .config import settings

_ITERATIONS = 390_000
_ALGORITHM = "HS256"


def _b64(raw: bytes) -> str:
    return base64.b64encode(raw).decode("ascii")


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, _ITERATIONS
    )

    return f"pbkdf2_sha256${_ITERATIONS}${_b64(salt)}${_b64(digest)}"


def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, iterations, salt_b64, digest_b64 = stored.split("$")

        if scheme != "pbkdf2_sha256":
            return False

        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(digest_b64)
        actual = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), salt, int(iterations)
        )

        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def create_access_token(user_id: int, role: str, institution_id: int) -> str:
    expires = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_minutes
    )

    payload = {
        "sub": str(user_id),
        "role": role,
        "inst": institution_id,
        "exp": expires,
    }

    return jwt.encode(payload, settings.secret_key, algorithm=_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Raises jwt.PyJWTError when the token is invalid or expired."""
    return jwt.decode(token, settings.secret_key, algorithms=[_ALGORITHM])
