"""Application settings, read from environment variables or backend/.env"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _load_env_file() -> None:
    env_path = BASE_DIR / ".env"

    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()

        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_env_file()

DEFAULT_SECRET = "dev-only-secret-change-me-before-deploying"


class Settings:
    secret_key: str = os.getenv("SECRET_KEY", DEFAULT_SECRET)
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./elysian.db")
    access_token_minutes: int = int(os.getenv("ACCESS_TOKEN_MINUTES", "480"))
    cors_origins: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]
    upload_dir: Path = BASE_DIR / "uploads"
    max_upload_bytes: int = 10 * 1024 * 1024
    allowed_upload_extensions: set[str] = {".pdf", ".doc", ".docx", ".txt"}


settings = Settings()
