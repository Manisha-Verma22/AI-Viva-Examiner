import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

export default function InstitutionRegister() {
  const navigate = useNavigate();

  const [institutionName, setInstitutionName] = useState("");
  const [institutionType, setInstitutionType] = useState("University");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !institutionName.trim() ||
      !location.trim() ||
      !adminName.trim() ||
      !adminEmail.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    const request = {
      institutionName,
      institutionType,
      location,
      website,
      adminName,
      adminEmail,
      adminPhone,
      status: "pending_verification",
      submittedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "elysianInstitutionRequest",
      JSON.stringify(request),
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
            VERIFICATION PENDING
          </div>

          <h1>Request received</h1>

          <p className="auth-subtitle">
            Your institution registration request has been
            submitted to the ELYSIAN platform owner.
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
                <strong>Request submitted</strong>
                <small>
                  Institution details have been received.
                </small>
              </div>
            </div>

            <div className="pending-line" />

            <div className="pending-step">
              <span>2</span>
              <div>
                <strong>ELYSIAN verification</strong>
                <small>
                  The platform owner will review the institution.
                </small>
              </div>
            </div>

            <div className="pending-line" />

            <div className="pending-step">
              <span>3</span>
              <div>
                <strong>Institution activation</strong>
                <small>
                  After approval, the institution environment
                  can be created.
                </small>
              </div>
            </div>
          </div>

          <button
            className="auth-primary"
            onClick={() => navigate("/")}
          >
            Return to ELYSIAN
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
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="auth-logo">
          ELYSIAN<span>.</span>
        </div>

        <div className="auth-header-spacer" />
      </header>

      <section className="auth-container institution-registration">
        <div className="auth-role-icon">
          <Building2 size={22} />
        </div>

        <div className="auth-eyebrow">
          INSTITUTION ONBOARDING
        </div>

        <h1>Register your institution</h1>

        <p className="auth-subtitle">
          Bring your college, university, or school to ELYSIAN.
          Institution registration requires verification before
          access is activated.
        </p>

        <form className="auth-form" onSubmit={submit}>
          <div className="registration-divider">
            Institution details
          </div>

          <label>
            Institution name
            <div className="auth-input">
              <Building2 size={18} />
              <input
                value={institutionName}
                onChange={(event) =>
                  setInstitutionName(event.target.value)
                }
                placeholder="National Institute of Technology..."
              />
            </div>
          </label>

          <div className="form-grid">
            <label>
              Institution type
              <select
                className="plain-auth-input"
                value={institutionType}
                onChange={(event) =>
                  setInstitutionType(event.target.value)
                }
              >
                <option>University</option>
                <option>College</option>
                <option>School</option>
                <option>Institute</option>
              </select>
            </label>

            <label>
              Location
              <div className="auth-input">
                <MapPin size={18} />
                <input
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="City, State"
                />
              </div>
            </label>
          </div>

          <label>
            Website
            <input
              className="plain-auth-input"
              value={website}
              onChange={(event) =>
                setWebsite(event.target.value)
              }
              placeholder="https://yourinstitution.edu"
            />
          </label>

          <div className="registration-divider">
            Institution administrator
          </div>

          <div className="form-grid">
            <label>
              Administrator name
              <div className="auth-input">
                <UserRound size={18} />
                <input
                  value={adminName}
                  onChange={(event) =>
                    setAdminName(event.target.value)
                  }
                  placeholder="Principal / Head / Administrator"
                />
              </div>
            </label>

            <label>
              Administrator email
              <div className="auth-input">
                <Mail size={18} />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(event) =>
                    setAdminEmail(event.target.value)
                  }
                  placeholder="admin@institution.edu"
                />
              </div>
            </label>

            <label>
              Administrator phone
              <div className="auth-input">
                <Phone size={18} />
                <input
                  value={adminPhone}
                  onChange={(event) =>
                    setAdminPhone(event.target.value)
                  }
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </label>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="registration-notice">
            <strong>What happens next?</strong>
            <p>
              ELYSIAN will verify the submitted institution
              information. Once approved, an isolated institution
              environment can be created and the administrator can
              access it.
            </p>
          </div>

          <button className="auth-primary" type="submit">
            Submit for verification
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="auth-secure">
          <span />
          Secure institution onboarding
        </div>
      </section>
    </main>
  );
}