import { FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  Mail,
  Phone,
  UserRound,
  Users,
} from "lucide-react";

type Role = "student" | "teacher";

const institutionNames: Record<string, string> = {
  "nit-sikkim": "National Institute of Technology Sikkim",
  "demo-university": "ELYSIAN Demo University",
  "demo-college": "ELYSIAN Institute of Technology",
};

export default function Register() {
  const navigate = useNavigate();

  const { role, institutionId } = useParams<{
    role: Role;
    institutionId: string;
  }>();

  const currentRole: Role =
    role === "teacher" ? "teacher" : "student";

  const institutionName =
    institutionNames[institutionId ?? ""] ??
    "Selected Institution";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identity, setIdentity] = useState("");
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [batch, setBatch] = useState("");
  const [institutionCode, setInstitutionCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !institutionCode.trim() ||
      !identity.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    const pendingRegistration = {
      role: currentRole,
      institutionId,
      name,
      email,
      phone,
      identity,
      department,
      course,
      semester,
      batch,
      institutionCode,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "elysianPendingRegistration",
      JSON.stringify(pendingRegistration),
    );

    setError("");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="auth-page">
        <header className="auth-header">
          <div className="auth-logo">
            ELYSIAN<span>.</span>
          </div>
        </header>

        <section className="auth-container registration-success">
          <div className="success-large-icon">
            <CheckCircle2 size={34} />
          </div>

          <div className="auth-eyebrow">
            REGISTRATION SUBMITTED
          </div>

          <h1>You're almost there</h1>

          <p className="auth-subtitle">
            Your {currentRole} registration has been submitted
            to the institution administrator for approval.
          </p>

          <div className="pending-card">
            <Building2 size={20} />

            <div>
              <span>Institution</span>
              <strong>{institutionName}</strong>
            </div>
          </div>

          <div className="pending-steps">
            <div className="pending-step complete">
              <span>1</span>
              <div>
                <strong>Registration submitted</strong>
                <small>Your details have been received.</small>
              </div>
            </div>

            <div className="pending-line" />

            <div className="pending-step">
              <span>2</span>
              <div>
                <strong>Admin review</strong>
                <small>
                  Your institution administrator will review
                  your request.
                </small>
              </div>
            </div>

            <div className="pending-line" />

            <div className="pending-step">
              <span>3</span>
              <div>
                <strong>Account activation</strong>
                <small>
                  You can sign in after approval.
                </small>
              </div>
            </div>
          </div>

          <button
            className="auth-primary"
            onClick={() =>
              navigate(`/login/${currentRole}/${institutionId}`)
            }
          >
            Back to sign in
            <ArrowRight size={17} />
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <header className="auth-header">
        <button
          className="back"
          onClick={() =>
            navigate(`/login/${currentRole}`)
          }
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="auth-logo">
          ELYSIAN<span>.</span>
        </div>

        <div className="auth-header-spacer" />
      </header>

      <section className="auth-container registration-container">
        <div className="auth-role-icon">
          {currentRole === "student" ? (
            <GraduationCap size={22} />
          ) : (
            <Users size={22} />
          )}
        </div>

        <div className="auth-eyebrow">
          {currentRole === "student"
            ? "STUDENT REGISTRATION"
            : "TEACHER REGISTRATION"}
        </div>

        <h1>Create your account</h1>

        <p className="auth-subtitle">
          Register with your institution. Your account will
          require administrator approval before activation.
        </p>

        <div className="auth-institution">
          <Building2 size={17} />

          <div>
            <span>Institution</span>
            <strong>{institutionName}</strong>
          </div>
        </div>

        <form className="auth-form registration-form" onSubmit={submit}>
          <div className="form-grid">
            <label>
              Full name
              <div className="auth-input">
                <UserRound size={18} />
                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Your full name"
                />
              </div>
            </label>

            <label>
              Email address
              <div className="auth-input">
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                />
              </div>
            </label>

            <label>
              Phone number
              <div className="auth-input">
                <Phone size={18} />
                <input
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </label>

            <label>
              {currentRole === "student"
                ? "Student ID / Roll Number"
                : "Employee ID"}
              <div className="auth-input">
                <UserRound size={18} />
                <input
                  value={identity}
                  onChange={(event) =>
                    setIdentity(event.target.value)
                  }
                  placeholder={
                    currentRole === "student"
                      ? "Your roll number"
                      : "Your employee ID"
                  }
                />
              </div>
            </label>
          </div>

          <div className="registration-divider">
            Academic information
          </div>

          <div className="form-grid">
            <label>
              Department
              <input
                className="plain-auth-input"
                value={department}
                onChange={(event) =>
                  setDepartment(event.target.value)
                }
                placeholder="Computer Science"
              />
            </label>

            <label>
              Course
              <input
                className="plain-auth-input"
                value={course}
                onChange={(event) =>
                  setCourse(event.target.value)
                }
                placeholder="B.Tech CSE"
              />
            </label>

            <label>
              Semester
              <input
                className="plain-auth-input"
                value={semester}
                onChange={(event) =>
                  setSemester(event.target.value)
                }
                placeholder="4th Semester"
              />
            </label>

            <label>
              Batch
              <input
                className="plain-auth-input"
                value={batch}
                onChange={(event) =>
                  setBatch(event.target.value)
                }
                placeholder="2024–2028"
              />
            </label>
          </div>

          <div className="registration-divider">
            Institution verification
          </div>

          <label>
            Institution code
            <input
              className="plain-auth-input"
              value={institutionCode}
              onChange={(event) =>
                setInstitutionCode(event.target.value)
              }
              placeholder="Enter the code provided by your institution"
            />
          </label>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button className="auth-primary" type="submit">
            Submit registration
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="auth-secure">
          <span />
          Your account remains pending until institution approval
        </div>
      </section>
    </main>
  );
}