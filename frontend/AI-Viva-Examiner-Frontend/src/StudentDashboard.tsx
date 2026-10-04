import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
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

  const menuRef = useRef<HTMLDivElement>(null);

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
        <div className="profile-avatar-lg">{initial}</div>

        <div>
          <h1>{student.name}</h1>
          <p>
            {student.institutionShort} · {student.departmentShort}
          </p>
          <span className="profile-role">Student</span>
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

  const content: Record<Tab, () => JSX.Element> = {
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
            <div>
              <p className="dashboard-eyebrow">Student Workspace</p>
              <h2 className="dashboard-title">{titles[tab]}</h2>
            </div>

            <div className="profile-menu" ref={menuRef}>
              <button
                type="button"
                className={`profile-trigger ${
                  menuOpen ? "open" : ""
                }`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span className="profile-avatar">{initial}</span>

                <span className="profile-trigger-text">
                  <strong>{student.name}</strong>
                  <small>
                    {student.institutionShort} ·{" "}
                    {student.departmentShort}
                  </small>
                </span>

                <ChevronDown size={16} className="profile-chevron" />
              </button>

              {menuOpen && (
                <div className="profile-popover" role="menu">
                  <div className="profile-popover-card">
                    <span className="profile-avatar profile-avatar-md">
                      {initial}
                    </span>

                    <div>
                      <strong>{student.name}</strong>
                      <small>
                        <Mail size={12} />
                        {student.email}
                      </small>
                    </div>
                  </div>

                  <div className="profile-chips">
                    <span>{student.institutionShort}</span>
                    <span>{student.departmentShort}</span>
                    <span>Student</span>
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    className="profile-menu-item"
                    onClick={() => goTo("profile")}
                  >
                    <User size={17} />
                    View my profile
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    className="profile-menu-item danger"
                    onClick={signOut}
                  >
                    <LogOut size={17} />
                    Sign out
                  </button>
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
