import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react";

import ElysianMark from "./ElysianMark";

const roles = [
  {
    key: "student",
    title: "Student",
    description:
      "Access your upcoming vivas, assessments, and performance.",
    icon: GraduationCap,
    path: "/login/student",
  },
  {
    key: "teacher",
    title: "Teacher",
    description:
      "Create vivas, manage questions, and assess student performance.",
    icon: Users,
    path: "/login/teacher",
  },
  {
    key: "admin",
    title: "Administrator",
    description:
      "Manage your institution, users, and viva activities.",
    icon: ShieldCheck,
    path: "/login/admin",
  },
];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <main className="welcome-page">
      <header className="welcome-header">
        <button
          type="button"
          className="welcome-brand"
          onClick={() => navigate("/")}
          aria-label="ELYSIAN home"
        >
          <ElysianMark size={52} />
          <span className="welcome-brand-name">
            ELYSIAN<span>.</span>
          </span>
        </button>

        <button
          type="button"
          className="welcome-register"
          onClick={() => navigate("/register/institution")}
        >
          <Building2 size={17} />
          Register Institution
          <ArrowRight size={16} />
        </button>
      </header>

      <section className="welcome-content">
        <div className="welcome-hero">
          <h1>
            Welcome<span>!</span>
          </h1>

          <p className="welcome-subtitle">
            A smarter way to conduct, manage, and experience
            academic assessments.
          </p>
        </div>

        <div className="welcome-section-title">
          <h2>Continue as</h2>
          <p>Select your role to get started</p>
        </div>

        <div className="welcome-role-grid">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <button
                key={role.key}
                type="button"
                className="welcome-role-card"
                onClick={() => navigate(role.path)}
              >
                <div className="welcome-role-icon">
                  <Icon size={26} strokeWidth={1.8} />
                </div>

                <div className="welcome-role-text">
                  <h3>{role.title}</h3>
                  <p>{role.description}</p>
                </div>

                <div className="welcome-role-arrow">
                  <ArrowRight size={19} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="welcome-register-card">
          <div className="welcome-register-icon">
            <Building2 size={22} strokeWidth={1.8} />
          </div>

          <div className="welcome-register-text">
            <h3>New to ELYSIAN?</h3>
            <p>
              Register your college or university to get started
              with ELYSIAN.
            </p>
          </div>

          <button
            type="button"
            className="welcome-register-action"
            onClick={() => navigate("/register/institution")}
          >
            Register now
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <footer className="welcome-footer">
        <span>ELYSIAN © 2026</span>

        <span>
          <i className="welcome-secure-dot" />
          Secure academic assessment environment
        </span>
      </footer>
    </main>
  );
}
