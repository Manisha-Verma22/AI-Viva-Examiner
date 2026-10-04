import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react";

import ElysianMark from "./ElysianMark";

type Role = "student" | "teacher" | "admin";

type Institution = {
  id: string;
  name: string;
  location: string;
};

const institutions: Institution[] = [
  {
    id: "nit-sikkim",
    name: "National Institute of Technology Sikkim",
    location: "Ravangla, Sikkim",
  },
  {
    id: "demo-institution",
    name: "ELYSIAN Demo University",
    location: "India",
  },
];

const roleData = {
  student: {
    title: "Student Login",
    subtitle:
      "Select your institution to continue to your student account.",
    icon: GraduationCap,
    label: "Student",
  },
  teacher: {
    title: "Teacher Login",
    subtitle:
      "Select your institution to access your teaching workspace.",
    icon: Users,
    label: "Teacher",
  },
  admin: {
    title: "Administrator Login",
    subtitle:
      "Select your institution to manage your institution's ELYSIAN platform.",
    icon: ShieldCheck,
    label: "Administrator",
  },
};

export default function InstitutionSelect({
  role,
}: {
  role: Role;
}) {
  const navigate = useNavigate();
  const data = roleData[role];
  const Icon = data.icon;

  return (
    <main className="entry-page">
      <header className="entry-header">
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
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="entry-role">
            <Icon size={16} />
            {data.label}
          </div>
        </div>
      </header>

      <section className="entry-main">
        <div className="entry-container">
          <div className="entry-heading">
            <div className="entry-icon">
              <Icon size={24} strokeWidth={1.8} />
            </div>

            <span className="entry-eyebrow">
              ELYSIAN · SECURE ACCESS
            </span>

            <h1>{data.title}</h1>

            <p>{data.subtitle}</p>
          </div>

          <div className="institution-panel">
            <div className="institution-panel-header">
              <div>
                <h2>Select your institution</h2>
                <p>
                  Choose the institution associated with your
                  ELYSIAN account.
                </p>
              </div>

              <Building2 size={22} />
            </div>

            <div className="institution-list">
              {institutions.map((institution) => (
                <button
                  key={institution.id}
                  type="button"
                  className="institution-option"
                  onClick={() =>
                    navigate(`/auth/${role}/${institution.id}`)
                  }
                >
                  <div className="institution-option-icon">
                    <Building2 size={20} strokeWidth={1.8} />
                  </div>

                  <div className="institution-option-info">
                    <h3>{institution.name}</h3>
                    <p>{institution.location}</p>
                  </div>

                  <div className="institution-option-arrow">
                    <ArrowRight size={18} />
                  </div>
                </button>
              ))}
            </div>

            <div className="institution-code">
              <div className="institution-code-icon">?</div>

              <div>
                <strong>Don't see your institution?</strong>
                <p>
                  Ask your institution administrator for the
                  official ELYSIAN institution code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="entry-footer">
        <span>ELYSIAN © 2026</span>

        <span>
          <ShieldCheck size={14} />
          Your institution data is securely isolated.
        </span>
      </footer>
    </main>
  );
}
