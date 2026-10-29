import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  Hash,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";

import ElysianMark from "./ElysianMark";
import { api, messageOf, type Institution } from "./api";
import { scheduleOptions } from "./mockData";

/* Student registration: the request is saved as "pending" until the
   institution administrator approves it. */

type Form = {
  name: string;
  email: string;
  password: string;
  institutionId: string;
  course: string;
  batch: string;
  rollNo: string;
};

export default function StudentRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState<Form>({
    name: "",
    email: "",
    password: "",
    institutionId: "",
    course: scheduleOptions.courses[0],
    batch: scheduleOptions.batches[2],
    rollNo: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>(
    {},
  );
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api
      .institutions()
      .then((list) => {
        setInstitutions(list);

        if (list.length > 0) {
          setForm((current) =>
            current.institutionId
              ? current
              : { ...current, institutionId: String(list[0].id) },
          );
        }
      })
      .catch((err: unknown) => setServerError(messageOf(err)));
  }, []);

  const update = (key: keyof Form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError("");

    const next: Partial<Record<keyof Form, string>> = {};

    if (form.name.trim().length < 2) next.name = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (!form.rollNo.trim()) next.rollNo = "Please enter your roll number.";

    setErrors(next);

    if (Object.keys(next).length > 0) return;

    if (!form.institutionId) {
      setServerError("Please choose your institution.");
      return;
    }

    setSubmitting(true);

    try {
      await api.registerStudent({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        institution_id: Number(form.institutionId),
        course: form.course,
        batch: form.batch,
        roll_no: form.rollNo.trim(),
      });

      setSubmitted(true);
    } catch (err) {
      setServerError(messageOf(err));
    } finally {
      setSubmitting(false);
    }
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
            onClick={() => navigate("/login/student")}
          >
            <ArrowLeft size={16} />
            Back to login
          </button>

          <div className="entry-role">
            <GraduationCap size={16} />
            Student
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
                Your student account has been sent to your institution
                administrator for approval. You will be able to sign in
                once it is approved.
              </p>

              <button
                type="button"
                className="auth-submit"
                onClick={() => navigate("/login/student")}
              >
                Back to login
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="auth-brand">
                <div className="auth-icon">
                  <GraduationCap size={24} strokeWidth={1.8} />
                </div>

                <span className="entry-eyebrow">STUDENT · NEW ACCOUNT</span>

                <h1>Create student account</h1>

                <p>
                  Register with your institution details. An administrator
                  will review your request.
                </p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className="auth-grid">
                  <label className="auth-field full">
                    <span>Full name</span>
                    <div className="auth-input">
                      <User size={18} />
                      <input
                        value={form.name}
                        onChange={(event) => update("name", event.target.value)}
                        placeholder="Your full name"
                        autoComplete="name"
                      />
                    </div>
                    {errors.name && (
                      <small className="auth-field-error">{errors.name}</small>
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
                        placeholder="student@college.edu"
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
                        value={form.institutionId}
                        onChange={(event) =>
                          update("institutionId", event.target.value)
                        }
                      >
                        {institutions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="auth-field">
                    <span>Course</span>
                    <div className="auth-input">
                      <GraduationCap size={18} />
                      <select
                        value={form.course}
                        onChange={(event) =>
                          update("course", event.target.value)
                        }
                      >
                        {scheduleOptions.courses.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="auth-field">
                    <span>Batch</span>
                    <div className="auth-input">
                      <GraduationCap size={18} />
                      <select
                        value={form.batch}
                        onChange={(event) =>
                          update("batch", event.target.value)
                        }
                      >
                        {scheduleOptions.batches.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="auth-field full">
                    <span>Roll number</span>
                    <div className="auth-input">
                      <Hash size={18} />
                      <input
                        value={form.rollNo}
                        onChange={(event) =>
                          update("rollNo", event.target.value)
                        }
                        placeholder="24CS108"
                      />
                    </div>
                    {errors.rollNo && (
                      <small className="auth-field-error">
                        {errors.rollNo}
                      </small>
                    )}
                  </label>
                </div>

                {serverError && (
                  <div className="auth-error">{serverError}</div>
                )}

                <button
                  className="auth-submit"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Submitting…" : "Create account"}
                  {!submitting && <ArrowRight size={18} />}
                </button>
              </form>

              <div className="auth-register">
                <span>Already have an account?</span>

                <button
                  type="button"
                  onClick={() => navigate("/login/student")}
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
