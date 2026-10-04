import { FormEvent, useState } from "react";
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

type Role = "student" | "teacher" | "admin";

const institutionNames: Record<string, string> = {
  "nit-sikkim": "National Institute of Technology Sikkim",
  "demo-institution": "ELYSIAN Demo University",
};

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

  const institutionName =
    institutionNames[institutionId ?? ""] ?? "Your Institution";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    /*
      Prototype authentication.
      Later: React -> FastAPI -> Authentication ->
      Institution-specific database
    */

    const destinations: Record<Role, string> = {
      student: "/student",
      teacher: "/teacher",
      admin: "/admin",
    };

    navigate(destinations[role]);
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

          <form className="auth-form" onSubmit={handleSubmit}>
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
                      "Password recovery will be available after backend authentication is connected.",
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
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
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

            <button className="auth-submit" type="submit">
              Sign in
              <ArrowRight size={18} />
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
