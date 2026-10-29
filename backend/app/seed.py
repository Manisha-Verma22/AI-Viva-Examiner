"""Fill the database with demo data matching the frontend mock data.

Usage (from the backend folder):
    python -m app.seed            # only if the database is empty
    python -m app.seed --reset    # wipe everything and start again
"""

import datetime as dt
import sys

from sqlalchemy import select

from .database import Base, SessionLocal, engine
from .models import (
    Institution,
    QuestionRecord,
    User,
    Viva,
    VivaResult,
)
from .security import hash_password

ADMIN_PASSWORD = "Admin@12345"
TEACHER_PASSWORD = "Teacher@12345"
STUDENT_PASSWORD = "Student@12345"
PENDING_PASSWORD = "Pending@12345"

QUESTIONS = {
    "Data Structures": [
        (
            "What is the difference between a stack and a queue, and when would you choose each?",
            "A stack is last-in first-out, so I would use it for undo or expression evaluation. A queue is first-in first-out, which suits scheduling and breadth-first search.",
        ),
        (
            "Explain how a balanced binary search tree improves lookup time.",
            "Balancing keeps the height close to log n, so search, insert and delete stay O(log n) instead of O(n) in a skewed tree.",
        ),
    ],
    "DBMS": [
        (
            "What does normalisation achieve in a relational database?",
            "It reduces redundancy by splitting tables so each fact is stored once, which avoids update anomalies.",
        ),
        (
            "How does indexing speed up queries?",
            "It keeps keys in a sorted structure so the database does not have to scan the whole table.",
        ),
    ],
    "Computer Networks": [
        (
            "What is the difference between TCP and UDP?",
            "TCP is connection oriented and reliable with ordering and retransmission. UDP is connectionless and faster but offers no delivery guarantee.",
        ),
        (
            "Explain what happens when you type a URL into a browser.",
            "The browser resolves the domain with DNS, opens a TCP connection, performs a TLS handshake, sends an HTTP request and renders the response.",
        ),
    ],
}


def clamp(value: int) -> int:
    return max(0, min(100, value))


def main() -> None:
    reset = "--reset" in sys.argv

    if reset:
        Base.metadata.drop_all(bind=engine)

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        if db.scalar(select(Institution.id)) is not None:
            print("The database already has data. Use --reset to start again.")
            return

        admin_hash = hash_password(ADMIN_PASSWORD)
        teacher_hash = hash_password(TEACHER_PASSWORD)
        student_hash = hash_password(STUDENT_PASSWORD)
        pending_hash = hash_password(PENDING_PASSWORD)

        # ------------------------- Institutions -------------------------
        nits = Institution(
            name="National Institute of Technology Sikkim",
            short_name="NIT Sikkim",
            code="NITS",
            location="Ravangla, Sikkim",
            contact_email="admin@nitsikkim.edu",
        )
        demo = Institution(
            name="ELYSIAN Demo University",
            short_name="ELYSIAN Demo",
            code="DEMO",
            location="India",
            contact_email="admin@demo.edu",
        )
        db.add_all([nits, demo])
        db.flush()

        def add_user(**fields) -> User:
            user = User(**fields)
            db.add(user)
            return user

        # ------------------------- NIT Sikkim staff -------------------------
        add_user(
            institution_id=nits.id, role="admin", status="active",
            name="Dr. Meera Pradhan", email="admin@nitsikkim.edu",
            password_hash=admin_hash,
        )
        teacher = add_user(
            institution_id=nits.id, role="teacher", status="active",
            name="Dr. Ankit Sharma", email="teacher@nitsikkim.edu",
            password_hash=teacher_hash,
            department="Computer Science & Engineering",
            teacher_code="NITS-T-1042",
        )
        add_user(
            institution_id=nits.id, role="teacher", status="active",
            name="Dr. Sunita Rai", email="sunita@nitsikkim.edu",
            password_hash=teacher_hash,
            department="Information Technology", teacher_code="NITS-T-1057",
        )
        add_user(
            institution_id=nits.id, role="teacher", status="active",
            name="Prof. Lakpa Sherpa", email="lakpa@nitsikkim.edu",
            password_hash=teacher_hash,
            department="Electronics & Communication", teacher_code="NITS-T-1063",
        )

        # ------------------------- NIT Sikkim students -------------------------
        students_spec = [
            ("Manisha Verma", "student@nitsikkim.edu", "24CS108", "2024–2028"),
            ("Aarav Sharma", "aarav@nitsikkim.edu", "24CS101", "2024–2028"),
            ("Priya Nair", "priya@nitsikkim.edu", "24CS102", "2024–2028"),
            ("Rohan Gupta", "rohan@nitsikkim.edu", "24CS103", "2024–2028"),
            ("Ananya Das", "ananya@nitsikkim.edu", "24CS104", "2024–2028"),
            ("Karan Singh", "karan@nitsikkim.edu", "24CS105", "2024–2028"),
            ("Sneha Rai", "sneha@nitsikkim.edu", "24CS106", "2024–2028"),
            ("Tenzin Bhutia", "tenzin@nitsikkim.edu", "23CS207", "2023–2027"),
            ("Vikram Rathore", "vikram@nitsikkim.edu", "23CS208", "2023–2027"),
            ("Isha Thapa", "isha@nitsikkim.edu", "23CS209", "2023–2027"),
            ("Neha Pradhan", "neha@nitsikkim.edu", "23CS210", "2023–2027"),
        ]

        students: dict[str, User] = {}

        for name, email, roll, batch in students_spec:
            students[email] = add_user(
                institution_id=nits.id, role="student", status="active",
                name=name, email=email, password_hash=student_hash,
                course="B.Tech CSE", batch=batch, roll_no=roll,
            )

        # ------------------------- Pending requests -------------------------
        add_user(
            institution_id=nits.id, role="teacher", status="pending",
            name="Dr. Rahul Mehta", email="rahul@nitsikkim.edu",
            password_hash=pending_hash,
            department="Computer Science", teacher_code="NITS-T-2108",
        )
        add_user(
            institution_id=nits.id, role="teacher", status="pending",
            name="Priya Sharma", email="priya.sharma@nitsikkim.edu",
            password_hash=pending_hash,
            department="Information Technology", teacher_code="NITS-T-2111",
        )
        add_user(
            institution_id=nits.id, role="student", status="pending",
            name="Dev Chhetri", email="dev@nitsikkim.edu",
            password_hash=pending_hash,
            course="B.Tech ECE", batch="2025–2029", roll_no="25EC031",
        )
        add_user(
            institution_id=nits.id, role="student", status="pending",
            name="Pooja Subba", email="pooja@nitsikkim.edu",
            password_hash=pending_hash,
            course="B.Tech IT", batch="2024–2028", roll_no="24IT044",
        )

        # ------------------------- Demo University -------------------------
        add_user(
            institution_id=demo.id, role="admin", status="active",
            name="Demo Admin", email="admin@demo.edu", password_hash=admin_hash,
        )

        db.flush()

        # ------------------------- Vivas -------------------------
        today = dt.date.today()
        cse = "Computer Science & Engineering"

        def add_viva(subject, semester, batch, days, hour, minutes, status):
            viva = Viva(
                institution_id=nits.id, teacher_id=teacher.id,
                subject=subject, department=cse, course="B.Tech CSE",
                semester=semester, batch=batch,
                viva_date=today + dt.timedelta(days=days),
                start_time=dt.time(hour, 0), duration_minutes=minutes,
                status=status,
            )
            db.add(viva)
            return viva

        # Upcoming
        add_viva("Data Structures", "4th Semester", "2024–2028", 0, 15, 20, "scheduled")
        add_viva("DBMS", "4th Semester", "2024–2028", 2, 11, 20, "scheduled")
        add_viva("Operating Systems", "6th Semester", "2023–2027", 4, 14, 30, "scheduled")

        # Completed, with results
        completed = [
            (
                add_viva("Data Structures", "4th Semester", "2024–2028", -14, 15, 20, "completed"),
                [("student@nitsikkim.edu", 78), ("aarav@nitsikkim.edu", 88),
                 ("priya@nitsikkim.edu", 81), ("sneha@nitsikkim.edu", 91),
                 ("karan@nitsikkim.edu", 77)],
            ),
            (
                add_viva("DBMS", "4th Semester", "2024–2028", -10, 11, 20, "completed"),
                [("student@nitsikkim.edu", 80), ("aarav@nitsikkim.edu", 85),
                 ("rohan@nitsikkim.edu", 72), ("ananya@nitsikkim.edu", 64)],
            ),
            (
                add_viva("Computer Networks", "6th Semester", "2023–2027", -7, 10, 20, "completed"),
                [("tenzin@nitsikkim.edu", 69), ("vikram@nitsikkim.edu", 83),
                 ("isha@nitsikkim.edu", 74), ("neha@nitsikkim.edu", 61)],
            ),
        ]

        db.flush()

        for viva, rows in completed:
            pairs = QUESTIONS[viva.subject]

            for email, score in rows:
                duration = 14 * 60 + (score * 7) % 300
                finished = dt.datetime.combine(viva.viva_date, viva.start_time) + dt.timedelta(
                    seconds=duration
                )

                result = VivaResult(
                    institution_id=nits.id, viva_id=viva.id,
                    student_id=students[email].id,
                    overall_score=score, duration_seconds=duration,
                    metrics={
                        "Knowledge": clamp(score + 2),
                        "Depth": clamp(score - 4),
                        "Communication": clamp(score + 3),
                        "Problem Solving": clamp(score - 1),
                    },
                    completed_at=finished,
                )

                for position, (question, answer) in enumerate(pairs):
                    shift = 3 if position == 0 else -4
                    result.questions.append(
                        QuestionRecord(
                            position=position, question=question, answer=answer,
                            score=max(0, min(10, round(score / 10 + shift / 10))),
                            max_score=10,
                        )
                    )

                db.add(result)

        db.commit()

        print("Demo data created.\n")
        print("Sign in with (institution NITS):")
        print(f"  admin    admin@nitsikkim.edu    {ADMIN_PASSWORD}")
        print(f"  teacher  teacher@nitsikkim.edu  {TEACHER_PASSWORD}")
        print(f"  student  student@nitsikkim.edu  {STUDENT_PASSWORD}")
        print("Institution IDs: NIT Sikkim = 1, ELYSIAN Demo University = 2")
    finally:
        db.close()


if __name__ == "__main__":
    main()
