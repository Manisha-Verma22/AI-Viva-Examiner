import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  History,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";

const upcomingVivas = [
  {
    id: "dbms-unit-3",
    title: "DBMS — Unit 3 Viva",
    subject: "Database Management Systems",
    department: "Computer Science and Engineering",
    batch: "2024–2028",
    date: "October 5, 2026",
    time: "10:00 AM",
    duration: "15 minutes",
    status: "Ready",
  },
  {
    id: "os-unit-2",
    title: "Operating Systems — Unit 2",
    subject: "Operating Systems",
    department: "Computer Science and Engineering",
    batch: "2024–2028",
    date: "October 8, 2026",
    time: "2:00 PM",
    duration: "15 minutes",
    status: "Upcoming",
  },
];

const recentVivas = [
  {
    subject: "Data Structures",
    date: "September 28, 2026",
    score: 82,
    status: "Completed",
  },
  {
    subject: "Computer Networks",
    date: "September 20, 2026",
    score: 76,
    status: "Completed",
  },
  {
    subject: "Database Management Systems",
    date: "September 12, 2026",
    score: 88,
    status: "Reviewed",
  },
];

export default function StudentDashboard() {
  const navigate = useNavigate();

  const startViva = (vivaId: string) => {
    sessionStorage.setItem("elysianSelectedViva", vivaId);
    navigate("/start");
  };

  return (
    <main className="dashboard">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="brand-symbol">E</span>
          <span>
            ELYSIAN<span className="brand-dot">.</span>
          </span>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <button className="sidebar-link active" type="button">
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            className="sidebar-link"
            type="button"
            onClick={() =>
              document
                .getElementById("upcoming-vivas")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <BookOpen size={19} />
            My Vivas
          </button>

          <button
            className="sidebar-link"
            type="button"
            onClick={() =>
              document
                .getElementById("performance")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <BarChart3 size={19} />
            Performance
          </button>

          <button
            className="sidebar-link"
            type="button"
            onClick={() =>
              document
                .getElementById("history")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <History size={19} />
            History
          </button>

          <button
            className="sidebar-link"
            type="button"
            onClick={() =>
              document
                .getElementById("reviews")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <MessageSquare size={19} />
            Review Requests
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-link" type="button">
            <Settings size={19} />
            Settings
          </button>

          <button
            className="sidebar-link"
            type="button"
            onClick={() => navigate("/start")}
          >
            <LogOut size={19} />
            Viva Setup
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">STUDENT WORKSPACE</span>
            <h1>Dashboard</h1>
          </div>

          <div className="dashboard-profile">
            <div className="profile-avatar">M</div>

            <div>
              <strong>Manisha</strong>
              <small>NIT Sikkim · CSE</small>
            </div>
          </div>
        </header>

        <section className="dashboard-welcome">
          <div>
            <span className="welcome-tag">YOUR AI VIVA EXAMINER</span>

            <h2>Good afternoon, Manisha</h2>

            <p>
              Your upcoming AI-powered viva sessions, performance and
              assessment history are all in one place.
            </p>
          </div>

          <div className="welcome-icon">
            <Sparkles size={54} strokeWidth={1.4} />
          </div>
        </section>

        <section className="dashboard-section-heading" id="upcoming-vivas">
          <div>
            <h2>Upcoming Vivas</h2>
            <p>Vivas assigned to you by your institution.</p>
          </div>

          <span className="required-label">
            {upcomingVivas.length} available
          </span>
        </section>

        <div className="viva-list">
          {upcomingVivas.map((viva) => (
            <article className="dashboard-card viva-card" key={viva.id}>
              <div className="viva-card-header">
                <div className="card-heading">
                  <div className="card-icon">
                    <BookOpen size={21} />
                  </div>

                  <div>
                    <h3>{viva.title}</h3>
                    <p>{viva.subject}</p>
                  </div>
                </div>

                <span
                  className={`viva-status ${
                    viva.status === "Ready" ? "ready" : ""
                  }`}
                >
                  <span />
                  {viva.status}
                </span>
              </div>

              <div className="viva-meta">
                <span>
                  <UserRound size={16} />
                  {viva.department}
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
                <span>
                  AI-generated questions · Adaptive follow-ups
                </span>

                <button
                  className="dashboard-continue"
                  type="button"
                  onClick={() => startViva(viva.id)}
                >
                  Start Viva
                  <BookOpen size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>

        <section className="dashboard-section-heading">
          <div>
            <h2>Performance Overview</h2>
            <p>Your recent AI viva performance.</p>
          </div>
        </section>

        <section className="performance-grid" id="performance">
          <div className="dashboard-card performance-card">
            <div className="card-icon">
              <BarChart3 size={21} />
            </div>

            <span className="performance-label">AVERAGE AI SCORE</span>

            <strong>82%</strong>

            <small>Across completed vivas</small>
          </div>

          <div className="dashboard-card performance-card">
            <div className="card-icon">
              <CheckCircle2 size={21} />
            </div>

            <span className="performance-label">VIVAS COMPLETED</span>

            <strong>12</strong>

            <small>Completed sessions</small>
          </div>

          <div className="dashboard-card performance-card">
            <div className="card-icon">
              <MessageSquare size={21} />
            </div>

            <span className="performance-label">REVIEW REQUESTS</span>

            <strong>1</strong>

            <small>Awaiting teacher review</small>
          </div>
        </section>

        <section className="dashboard-section-heading" id="history">
          <div>
            <h2>Recent Vivas</h2>
            <p>Your latest completed assessment sessions.</p>
          </div>

          <button className="text-action" type="button">
            View history
          </button>
        </section>

        <section className="dashboard-card recent-vivas">
          {recentVivas.map((viva, index) => (
            <div className="recent-viva" key={`${viva.subject}-${index}`}>
              <div className="recent-viva-icon">
                <ClipboardList size={19} />
              </div>

              <div className="recent-viva-info">
                <strong>{viva.subject}</strong>
                <small>{viva.date}</small>
              </div>

              <div className="recent-viva-score">
                <span>AI Score</span>
                <strong>{viva.score}%</strong>
              </div>

              <span className="review-status">
                <CheckCircle2 size={15} />
                {viva.status}
              </span>
            </div>
          ))}
        </section>

        <section className="dashboard-section-heading" id="reviews">
          <div>
            <h2>Review Requests</h2>
            <p>Track questions you've asked your teacher to review.</p>
          </div>
        </section>

        <section className="dashboard-card review-card">
          <div className="review-card-icon">
            <MessageSquare size={22} />
          </div>

          <div>
            <h3>DBMS — Unit 2 Viva</h3>

            <p>
              Your review request is waiting for teacher assessment.
            </p>

            <small>
              Requested on September 30, 2026
            </small>
          </div>

          <span className="review-status pending">
            Pending
          </span>
        </section>

        <footer className="dashboard-footer">
          <p>
            <span className="secure-dot" />
            Your viva data and assessment records are securely associated
            with your institution.
          </p>

          <button
            className="dashboard-continue"
            type="button"
            onClick={() => navigate("/start")}
          >
            Continue to viva setup
            <BookOpen size={18} />
          </button>
        </footer>
      </section>
    </main>
  );
}
