# ELYSIAN backend (FastAPI)

REST API for the ELYSIAN AI Viva Examiner: login with roles (student, teacher,
institution admin), teacher/admin approvals, vivas, students, results, viva
records and study-material upload.

## Run it (Windows PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env          # then edit SECRET_KEY
python -m app.seed              # demo data (use --reset to start over)
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs for the interactive API page.

## Demo accounts (institution id 1 = NIT Sikkim)

| Role    | Email                  | Password       |
|---------|------------------------|----------------|
| admin   | admin@nitsikkim.edu    | Admin@12345    |
| teacher | teacher@nitsikkim.edu  | Teacher@12345  |
| student | student@nitsikkim.edu  | Student@12345  |

## Try it in /docs

1. `POST /api/auth/login` with
   `{"email": "teacher@nitsikkim.edu", "password": "Teacher@12345", "institution_id": 1, "role": "teacher"}`
2. Copy `access_token` from the response.
3. Click the **Authorize** button (top right) and paste the token.
4. Call `GET /api/teacher/vivas`, `POST /api/teacher/vivas`, and so on.

## How institutions stay separate

Every table that belongs to an institution has an `institution_id`, and every
query filters on the signed-in user's institution. Asking for another
institution's record behaves exactly like "not found". Later, each
institution can be moved to its own database without changing the API.

## Layout

```
app/
  main.py        app, CORS, routers
  config.py      settings from .env
  database.py    engine and sessions
  models.py      tables
  schemas.py     request / response shapes
  security.py    password hashing, tokens
  deps.py        current user + role guards
  services.py    shared helpers
  seed.py        demo data
  routers/       public, auth, admin, teacher, student
```

## Security notes

- Never commit `.env`. Set a long random `SECRET_KEY`.
- Passwords are hashed (PBKDF2-SHA256); plain passwords are never stored.
- Login uses the same error for "no such user" and "wrong password".
- Role guards: students cannot call teacher endpoints, and so on.
- Before real use: HTTPS, rate limiting on login, password reset by email.
