import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import ElysianMark from "./ElysianMark";
import {
  api,
  ApiError,
  dashboardPath,
  saveSession,
  type Role,
} from "./api";

const roleData = {
  student: {
    title: "Welcome back",
    subtitle:
      "Sign in to access your upcoming vivas and academic performance.",
    label: "Student",
    placeholder: "student@example.com",
    icon: GraduationCap,
  },
  teacher: {
    title: "Welcome back",
    subtitle:
      "Sign in to manage your vivas and evaluate student performance.",
    label: "Teacher",
    placeholder: "teacher@example.com",
    icon: Users,
  },
  admin: {
    title: "Administrator access",
    subtitle:
      "Sign in to manage your institution's ELYSIAN platform.",
    label: "Administrator",
    placeholder: "admin@example.com",
    icon: ShieldCheck,
  },
};

export default function Auth({ role }: { role: Role }) {
  const navigate = useNavigate();
  const { institutionId } = useParams();

  const data = roleData[role];
  const Icon = data.icon;

  const institutionNumber = Number(institutionId);

  const [institutionName, setInstitutionName] = useState("Your Institution");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* Show the real institution name */
  useEffect(() => {
    if (!Number.isInteger(institutionNumber)) {
      navigate(`/login/${role}`, { replace: true });
      return;
    }

    api
      .institutions()
      .then((list) => {
        const match = list.find((item) => item.id === institutionNumber);

        if (match) setInstitutionName(match.name);
      })
      .catch(() => {
        /* the name is only cosmetic; login still works */
      });
  }, [institutionNumber, navigate, role]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await api.login({
        email: email.trim(),
        password,
        institution_id: institutionNumber,
        role,
      });

      saveSession(result.access_token, result.user);
      navigate(dashboardPath(role), { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
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
            onClick={() => navigate(`/login/${role}`)}
          >
            <ArrowLeft size={16} />
            Change institution
          </button>

          <div className="entry-role">
            <Icon size={16} />
            {data.label}
          </div>
        </div>
      </header>

      <section className="auth-main">
        <div className="auth-container">
          <div className="auth-brand">
            <div className="auth-icon">
              <Icon size={24} strokeWidth={1.8} />
            </div>

            <span className="entry-eyebrow">
              {data.label.toUpperCase()} · SECURE ACCESS
            </span>

            <h1>{data.title}</h1>

            <p>{data.subtitle}</p>
          </div>

          <div className="auth-institution">
            <div className="auth-institution-icon">
              <ShieldCheck size={18} strokeWidth={1.8} />
            </div>

            <div>
              <span>Institution</span>
              <strong>{institutionName}</strong>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/login/${role}`)}
            >
              Change
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="auth-field">
              <span>Email address</span>

              <div className="auth-input">
                <Mail size={18} />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={data.placeholder}
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="auth-field">
              <div className="auth-field-label">
                <span>Password</span>

                <button
                  type="button"
                  onClick={() =>
                    setError(
                      "Password reset by email will be added soon. Please contact your institution administrator.",
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>

              <div className="auth-input">
                <LockKeyhole size={18} />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </label>

            {error && <div className="auth-error">{error}</div>}

            <button
              className="auth-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Signing in…" : "Sign in"}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          {role !== "admin" && (
            <div className="auth-register">
              <span>Don't have an ELYSIAN account?</span>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    role === "teacher" ? "/register/teacher" : "/register",
                  )
                }
              >
                Create account
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="entry-footer">
        <span>ELYSIAN © 2026</span>

        <span>
          <ShieldCheck size={14} />
          Secure institutional access
        </span>
      </footer>
    </main>
  );
}
