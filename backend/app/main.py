"""ELYSIAN API entry point.

Run from the backend folder:
    uvicorn app.main:app --reload --port 8000
Then open http://localhost:8000/docs
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import DEFAULT_SECRET, settings
from .database import Base, engine
from .routers import admin, auth, public, student, teacher


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if settings.secret_key == DEFAULT_SECRET:
        print(
            "WARNING: using the default SECRET_KEY. "
            "Set a real one in backend/.env before deploying."
        )

    Base.metadata.create_all(bind=engine)
    settings.upload_dir.mkdir(parents=True, exist_ok=True)

    yield


app = FastAPI(title="ELYSIAN API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(teacher.router)
app.include_router(student.router)
