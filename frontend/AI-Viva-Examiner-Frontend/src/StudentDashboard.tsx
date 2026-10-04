import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  Clock3,
  GraduationCap,
  History as HistoryIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Sparkles,
  Trash2,
  Trophy,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import ElysianMark from "./ElysianMark";

/* ---------------------------------------------------------
   Demo data - replace with real data from the backend later
--------------------------------------------------------- */

const student = {
  name: "Manisha",
  email: "student@example.com",
  institution: "National Institute of Technology Sikkim",
  institutionShort: "NIT Sikkim",
  department: "Computer Science and Engineering",
  departmentShort: "CSE",
};

type Viva = {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  status: "ready" | "upcoming";
};

const vivas: Viva[] = [
  {
    id: "dbms-u3",
    title: "DBMS — Unit 3 Viva",
    subject: "Database Management Systems",
    date: "October 5, 2026",
    time: "10:00 AM",
    duration: "15 minutes",
    status: "ready",
  },
  {
    id: "os-u2",
    title: "Operating Systems — Unit 2",
    subject: "Operating Systems",
    date: "October 8, 2026",
    time: "11:30 AM",
    duration: "15 minutes",
    status: "upcoming",
  },
];

type Result = {
  id: string;
  title: string;
  date: string;
  score: number;
  reviewed: boolean;
};

const results: Result[] = [
  {
    id: "dbms-u2",
    title: "DBMS — Unit 2 Viva",
    date: "September 21, 2026",
    score: 82,
    reviewed: true,
  },
  {
    id: "ds-u4",
    title: "Data Structures — Unit 4",
    date: "September 12, 2026",
    score: 74,
    reviewed: true,
  },
  {
    id: "cn-u1",
    title: "Computer Networks — Unit 1",
    date: "September 3, 2026",
    score: 78,
    reviewed: false,
  },
];

const reviewRequests = [
  {
    id: "rr-1",
    title: "Data Structures — Unit 4",
    note: "Re-evaluation requested for Question 3.",
    date: "Requested on September 14, 2026",
    status: "Pending",
  },
];

type Tab =
  | "dashboard"
  | "vivas"
  | "performance"
  | "history"
  | "reviews"
  | "profile";

const navItems: {
  key: Exclude<Tab, "profile">;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "vivas", label: "My Vivas", icon: BookOpen },
  { key: "performance", label: "Performance", icon: BarChart3 },
  { key: "history", label: "History", icon: HistoryIcon },
  { key: "reviews", label: "Review Requests", icon: MessageSquare },
];

const titles: Record<Tab, string> = {
  dashboard: "Dashboard",
  vivas: "My Vivas",
  performance: "Performance",
  history: "History",
  reviews: "Review Requests",
  profile: "My Profile",
};

const PHOTO_KEY = "elysian.student.photo";
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

function Avatar({
  photo,
  initial,
  className,
}: {
  photo: string | null;
  initial: string;
  className: string;
}) {
  return (
    <span className={`avatar ${className}`}>
      {photo ? <img src={photo} alt="Profile" /> : initial}
    </span>
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(() => {
    try {
      return localStorage.getItem(PHOTO_KEY);
    } catch {
      return null;
    }
  });
  const [photoError, setPhotoError] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initial = student.name.charAt(0).toUpperCase();

  const averageScore = Math.round(
    results.reduce((sum, result) => sum + result.score, 0) /
      results.length,
  );
  const bestScore = Math.max(...results.map((result) => result.score));

  /* Close the profile menu on outside click or Escape */
  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  const goTo = (next: Tab) => {
    setTab(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  const signOut = () => navigate("/");

  const openPhotoPicker = () => fileInputRef.current?.click();

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file (JPG, PNG or WebP).");
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Image must be smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") return;

      setPhoto(reader.result);
      setPhotoError("");

      try {
        localStorage.setItem(PHOTO_KEY, reader.result);
      } catch {
        setPhotoError(
          "Photo applied, but it could not be saved on this device.",
        );
      }
    };

    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoError("");

    try {
      localStorage.removeItem(PHOTO_KEY);
    } catch {
      /* ignore */
    }
  };

  /* ------------------------- Sections ------------------------- */

  const renderVivaCard = (viva: Viva) => (
    <article className="dashboard-card viva-card" key={viva.id}>
      <div className="viva-card-header">
        <div className="card-heading">
          <div className="card-icon">
            <BookOpen size={20} />
          </div>

          <div>
            <h3>{viva.title}</h3>
            <p className="viva-subject">{viva.subject}</p>
          </div>
        </div>

        <span
          className={`viva-status ${
            viva.status === "ready" ? "ready" : ""
          }`}
        >
          <span />
          {viva.status === "ready" ? "Ready" : "Upcoming"}
        </span>
      </div>

      <div className="viva-meta">
        <span>
          <GraduationCap size={16} />
          {student.department}
        </span>

        <span>
          <CalendarDays size={16} />
          {viva.date}
        </span>

        <span>
          <Clock3 size={16} />
          {viva.time} · {viva.duration}
        </span>
      </div>

      <div className="viva-card-footer">
        <span>AI-generated questions · Adaptive follow-ups</span>

        {viva.status === "ready" ? (
          <button
            type="button"
            className="dashboard-continue"
            onClick={() => navigate("/start")}
          >
            Start Viva
            <BookOpen size={18} />
          </button>
        ) : (
          <button
            type="button"
            className="dashboard-continue"
            disabled
          >
            Opens {viva.date.split(",")[0]}
          </button>
        )}
      </div>
    </article>
  );

  const renderResults = (items: Result[]) => (
    <div className="dashboard-card recent-vivas">
      {items.map((result) => (
        <div className="recent-viva" key={result.id}>
          <div className="recent-viva-icon">
            <BookOpen size={18} />
          </div>

          <div className="recent-viva-info">
            <strong>{result.title}</strong>
            <small>{result.date}</small>
          </div>

          <div className="recent-viva-score">
            <span>Score</span>
            <strong>{result.score}%</strong>
          </div>

          <span
            className={`review-status ${
              result.reviewed ? "" : "pending"
            }`}
          >
            {result.reviewed && <Check size={13} />}
            {result.reviewed ? "Reviewed" : "Pending review"}
          </span>
        </div>
      ))}
    </div>
  );

  const renderDashboard = () => (
    <>
      <section className="dashboard-welcome">
        <div>
          <span className="welcome-tag">YOUR AI VIVA EXAMINER</span>

          <h1>
            {getGreeting()}, {student.name}
          </h1>

          <p>
            Your upcoming AI-powered viva sessions, performance and
            assessment history are all in one place.
          </p>
        </div>

        <div className="welcome-icon">
          <Sparkles size={34} strokeWidth={1.6} />
        </div>
      </section>

      <div className="dashboard-section-heading">
        <div>
          <h2>Upcoming Vivas</h2>
          <p className="section-sub">
            Vivas assigned to you by your institution.
          </p>
        </div>

        <span className="required-label">
          {vivas.length} available
        </span>
      </div>

      <div className="viva-list">{vivas.map(renderVivaCard)}</div>
    </>
  );

  const renderVivas = () => (
    <>
      <div className="dashboard-section-heading">
        <div>
          <h2>My Vivas</h2>
          <p className="section-sub">
            Every viva assigned to you, with its schedule and status.
          </p>
        </div>

        <span className="required-label">
          {vivas.length} assigned
        </span>
      </div>

      <div className="viva-list">{vivas.map(renderVivaCard)}</div>
    </>
  );

  const renderPerformance = () => (
    <>
      <div className="dashboard-section-heading">
        <div>
          <h2>Performance Overview</h2>
          <p className="section-sub">
            A summary of how you have done across your vivas.
          </p>
        </div>
      </div>

      <div className="performance-grid">
        <div className="dashboard-card performance-card">
          <div className="card-icon">
            <BarChart3 size={20} />
          </div>
          <span className="performance-label">AVERAGE SCORE</span>
          <strong>{averageScore}%</strong>
          <small>Across {results.length} vivas</small>
        </div>

        <div className="dashboard-card performance-card">
          <div className="card-icon">
            <Check size={20} />
          </div>
          <span className="performance-label">VIVAS COMPLETED</span>
          <strong>{results.length}</strong>
          <small>{vivas.length} more scheduled</small>
        </div>

        <div className="dashboard-card performance-card">
          <div className="card-icon">
            <Trophy size={20} />
          </div>
          <span className="performance-label">BEST SCORE</span>
          <strong>{bestScore}%</strong>
          <small>Your highest viva result</small>
        </div>
      </div>

      <div className="dashboard-section-heading">
        <h2>Recent Vivas</h2>
      </div>

      {renderResults(results)}
    </>
  );

  const renderHistory = () => (
    <>
      <div className="dashboard-section-heading">
        <div>
          <h2>Viva History</h2>
          <p className="section-sub">
            All vivas you have completed so far.
          </p>
        </div>

        <span className="required-label">
          {results.length} completed
        </span>
      </div>

      {renderResults(results)}
    </>
  );

  const renderReviews = () => (
    <>
      <div className="dashboard-section-heading">
        <div>
          <h2>Review Requests</h2>
          <p className="section-sub">
            Ask your teacher to re-evaluate an answer and track the
            outcome here.
          </p>
        </div>

        <span className="required-label">
          {reviewRequests.length} open
        </span>
      </div>

      <div className="viva-list">
        {reviewRequests.map((request) => (
          <div className="dashboard-card review-card" key={request.id}>
            <div className="review-card-icon">
              <MessageSquare size={20} />
            </div>

            <div>
              <h3>{request.title}</h3>
              <p>{request.note}</p>
              <small>{request.date}</small>
            </div>

            <span className="review-status pending">
              {request.status}
            </span>
          </div>
        ))}
      </div>
    </>
  );

  const renderProfile = () => (
    <>
      <section className="dashboard-card profile-hero">
        <div className="profile-photo-wrap">
          <Avatar photo={photo} initial={initial} className="avatar-lg" />

          <button
            type="button"
            className="profile-photo-edit"
            aria-label="Change profile photo"
            onClick={openPhotoPicker}
          >
            <Camera size={15} />
          </button>
        </div>

        <div className="profile-hero-text">
          <h1>{student.name}</h1>
          <p>
            {student.institutionShort} · {student.departmentShort}
          </p>
          <span className="profile-role">Student</span>
        </div>

        <div className="profile-hero-actions">
          <div className="profile-photo-actions">
            <button type="button" onClick={openPhotoPicker}>
              <Camera size={14} />
              {photo ? "Change photo" : "Upload photo"}
            </button>

            {photo && (
              <button
                type="button"
                className="muted"
                onClick={removePhoto}
              >
                <Trash2 size={14} />
                Remove
              </button>
            )}
          </div>

          {photoError && (
            <p className="profile-photo-error">{photoError}</p>
          )}
        </div>
      </section>

      <section className="dashboard-card">
        <div className="card-heading">
          <div className="card-icon">
            <User size={20} />
          </div>
          <h3>Personal details</h3>
        </div>

        <div className="academic-fields">
          <div className="dashboard-field">
            <label htmlFor="profile-name">Full name</label>
            <input
              id="profile-name"
              className="field-control"
              value={student.name}
              readOnly
            />
          </div>

          <div className="dashboard-field">
            <label htmlFor="profile-email">Email address</label>
            <input
              id="profile-email"
              className="field-control"
              value={student.email}
              readOnly
            />
          </div>

          <div className="dashboard-field">
            <label htmlFor="profile-institution">Institution</label>
            <input
              id="profile-institution"
              className="field-control"
              value={student.institution}
              readOnly
            />
          </div>

          <div className="dashboard-field">
            <label htmlFor="profile-department">Department</label>
            <input
              id="profile-department"
              className="field-control"
              value={student.department}
              readOnly
            />
          </div>
        </div>
      </section>
    </>
  );

  const content: Record<Tab, () => ReactElement> = {
    dashboard: renderDashboard,
    vivas: renderVivas,
    performance: renderPerformance,
    history: renderHistory,
    reviews: renderReviews,
    profile: renderProfile,
  };

  /* -------------------------- Layout -------------------------- */

  return (
    <div className="dashboard">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="visually-hidden"
        onChange={handlePhotoChange}
        tabIndex={-1}
        aria-hidden="true"
      />

      <aside className="dashboard-sidebar">
        <button
          type="button"
          className="dashboard-brand"
          onClick={() => goTo("dashboard")}
          aria-label="ELYSIAN dashboard"
        >
          <ElysianMark size={46} />
          <span className="dashboard-brand-name">
            ELYSIAN<span>.</span>
          </span>
        </button>

        <p className="sidebar-label">Workspace</p>

        <nav className="sidebar-nav" aria-label="Student navigation">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                className={`sidebar-link ${
                  tab === item.key ? "active" : ""
                }`}
                aria-current={tab === item.key ? "page" : undefined}
                onClick={() => goTo(item.key)}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="sidebar-link"
            onClick={signOut}
          >
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-inner">
          <header className="dashboard-header">
            <h2 className="dashboard-title">{titles[tab]}</h2>

            <div className="profile-menu" ref={menuRef}>
              <button
                type="button"
                className={`profile-trigger ${menuOpen ? "open" : ""}`}
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                aria-label="Open student profile"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <Avatar
                  photo={photo}
                  initial={initial}
                  className="avatar-sm"
                />

                <span className="profile-trigger-name">
                  {student.name}
                  <ChevronDown size={14} />
                </span>

                <small>
                  {student.institutionShort} · {student.departmentShort}
                </small>
              </button>

              {menuOpen && (
                <div
                  className="profile-popover"
                  role="dialog"
                  aria-label="Student profile"
                >
                  <div className="profile-popover-top">
                    <div className="profile-photo-wrap">
                      <Avatar
                        photo={photo}
                        initial={initial}
                        className="avatar-md"
                      />

                      <button
                        type="button"
                        className="profile-photo-edit"
                        aria-label="Change profile photo"
                        onClick={openPhotoPicker}
                      >
                        <Camera size={14} />
                      </button>
                    </div>

                    <strong>{student.name}</strong>

                    <small>
                      <Mail size={12} />
                      {student.email}
                    </small>

                    <div className="profile-photo-actions">
                      <button type="button" onClick={openPhotoPicker}>
                        <Camera size={14} />
                        {photo ? "Change photo" : "Upload photo"}
                      </button>

                      {photo && (
                        <button
                          type="button"
                          className="muted"
                          onClick={removePhoto}
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      )}
                    </div>

                    {photoError && (
                      <p className="profile-photo-error">{photoError}</p>
                    )}
                  </div>

                  <dl className="profile-info">
                    <div>
                      <dt>Institution</dt>
                      <dd>{student.institution}</dd>
                    </div>

                    <div>
                      <dt>Department</dt>
                      <dd>{student.department}</dd>
                    </div>

                    <div>
                      <dt>Role</dt>
                      <dd>Student</dd>
                    </div>
                  </dl>

                  <div className="profile-popover-actions">
                    <button
                      type="button"
                      className="profile-menu-item"
                      onClick={() => goTo("profile")}
                    >
                      <User size={17} />
                      View full profile
                    </button>

                    <button
                      type="button"
                      className="profile-menu-item danger"
                      onClick={signOut}
                    >
                      <LogOut size={17} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>

          {content[tab]()}
        </div>
      </main>
    </div>
  );
}
