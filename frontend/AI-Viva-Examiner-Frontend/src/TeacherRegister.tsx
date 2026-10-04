import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Hash,
  LockKeyhole,
  Mail,
  User,
  Users,
} from "lucide-react";

import ElysianMark from "./ElysianMark";

/* ---------------------------------------------------------
   Teacher registration (mock). On submit the request is
   "sent to the institution administrator for approval".
--------------------------------------------------------- */

const institutions = [
  "National Institute of Technology Sikkim",
  "ELYSIAN Demo University",
];

const departments = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Mechanical Engineering",
];

type Form = {
  name: string;
  email: string;
  password: string;
  institution: string;
  department: string;
  teacherId: string;
};

export default function TeacherRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState<Form>({
    name: "",
    email: "",
    password: "",
    institution: institutions[0],
    department: departments[0],
    teacherId: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>(
    {},
  );
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof Form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const next: Partial<Record<keyof Form, string>> = {};

    if (form.name.trim().length < 2) {
      next.name = "Please enter your full name.";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = "Enter a valid email address.";
    }

    if (form.password.length < 8) {
      next.password = "Use at least 8 characters.";
    }

    if (!form.teacherId.trim()) {
      next.teacherId = "Please enter your teacher ID.";
    }

    setErrors(next);

    if (Object.keys(next).length > 0) return;

    /*
      Prototype only. Later this will call the API, which stores
      the request in the institution's database as "pending".
    */
    setSubmitted(true);
  };

  return (
    <main className="auth-page">
      <header className="auth-header">
        <button
          type="button"
          className="entry-brand"
          onClick={() => navigate("/")}
          aria-label="ELYSIAN home"
        >
          <ElysianMark size={46} />
          <span className="entry-brand-name">
            ELYSIAN<span>.</span>
          </span>
        </button>

        <div className="entry-nav">
          <button
            type="button"
            className="entry-back"
            onClick={() => navigate("/login/teacher")}
          >
            <ArrowLeft size={16} />
            Back to login
          </button>

          <div className="entry-role">
            <Users size={16} />
            Teacher
          </div>
        </div>
      </header>

      <section className="auth-main">
        <div className="auth-container wide">
          {submitted ? (
            <div className="auth-form submitted">
              <div className="submitted-icon">
                <CheckCircle2 size={34} strokeWidth={1.7} />
              </div>

              <h1>Registration submitted</h1>

              <p>
                Your teacher account has been sent to your institution
                administrator for approval. You will be able to sign in
                once it is approved.
              </p>

              <button
                type="button"
                className="auth-submit"
                onClick={() => navigate("/login/teacher")}
              >
                Back to login
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="auth-brand">
                <div className="auth-icon">
                  <Users size={24} strokeWidth={1.8} />
                </div>

                <span className="entry-eyebrow">
                  TEACHER · NEW ACCOUNT
                </span>

                <h1>Create teacher account</h1>

                <p>
                  Register with your institution details. An
                  administrator will review your request.
                </p>
              </div>

              <form
                className="auth-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="auth-grid">
                  <label className="auth-field full">
                    <span>Full name</span>
                    <div className="auth-input">
                      <User size={18} />
                      <input
                        value={form.name}
                        onChange={(event) =>
                          update("name", event.target.value)
                        }
                        placeholder="Dr. Ankit Sharma"
                        autoComplete="name"
                      />
                    </div>
                    {errors.name && (
                      <small className="auth-field-error">
                        {errors.name}
                      </small>
                    )}
                  </label>

                  <label className="auth-field">
                    <span>Email address</span>
                    <div className="auth-input">
                      <Mail size={18} />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          update("email", event.target.value)
                        }
                        placeholder="teacher@college.edu"
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && (
                      <small className="auth-field-error">
                        {errors.email}
                      </small>
                    )}
                  </label>

                  <label className="auth-field">
                    <span>Password</span>
                    <div className="auth-input">
                      <LockKeyhole size={18} />
                      <input
                        type="password"
                        value={form.password}
                        onChange={(event) =>
                          update("password", event.target.value)
                        }
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                      />
                    </div>
                    {errors.password && (
                      <small className="auth-field-error">
                        {errors.password}
                      </small>
                    )}
                  </label>

                  <label className="auth-field full">
                    <span>Institution</span>
                    <div className="auth-input">
                      <Building2 size={18} />
                      <select
                        value={form.institution}
                        onChange={(event) =>
                          update("institution", event.target.value)
                        }
                      >
                        {institutions.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="auth-field">
                    <span>Department</span>
                    <div className="auth-input">
                      <Building2 size={18} />
                      <select
                        value={form.department}
                        onChange={(event) =>
                          update("department", event.target.value)
                        }
                      >
                        {departments.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="auth-field">
                    <span>Teacher ID</span>
                    <div className="auth-input">
                      <Hash size={18} />
                      <input
                        value={form.teacherId}
                        onChange={(event) =>
                          update("teacherId", event.target.value)
                        }
                        placeholder="NITS-T-1042"
                      />
                    </div>
                    {errors.teacherId && (
                      <small className="auth-field-error">
                        {errors.teacherId}
                      </small>
                    )}
                  </label>
                </div>

                <button className="auth-submit" type="submit">
                  Create account
                  <ArrowRight size={18} />
                </button>
              </form>

              <div className="auth-register">
                <span>Already have an account?</span>

                <button
                  type="button"
                  onClick={() => navigate("/login/teacher")}
                >
                  Sign in
                  <ArrowRight size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="entry-footer">
        <span>ELYSIAN © 2026</span>
        <span>Secure institutional access</span>
      </footer>
    </main>
  );
}
