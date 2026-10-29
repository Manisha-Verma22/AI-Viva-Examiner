import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  GraduationCap,
  History as HistoryIcon,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Trophy,
} from "lucide-react";

import DashboardShell, { type NavItem } from "./DashboardShell";
import {
  Badge,
  DataSection,
  SectionHeading,
  StatCard,
  StatusBlock,
  getGreeting,
  scoreStatus,
  type Column,
} from "./dashboardKit";
import { api, getUser, shortName, type ResultRow, type Viva } from "./api";
import { useLoad } from "./useLoad";
import { formatDate, formatTime } from "./mockData";

/* ---------------------------------------------------------
   Student dashboard - vivas and results come from the API
--------------------------------------------------------- */

type Tab =
  | "dashboard"
  | "vivas"
  | "performance"
  | "history"
  | "reviews"
  | "profile";

const navItems: NavItem[] = [
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
  profile: "Profile & Settings",
};

const historyColumns: Column<ResultRow>[] = [
  {
    key: "subject",
    header: "Viva",
    render: (row) => (
      <div className="person-cell">
        <span className="file-chip">
          <BookOpen size={16} />
        </span>
        <div>
          <strong>{row.subject}</strong>
          <small>{formatDate(row.date)}</small>
        </div>
      </div>
    ),
  },
  { key: "duration", header: "Duration", render: (row) => row.duration },
  { key: "score", header: "Score", render: (row) => `${row.score}%` },
  {
    key: "status",
    header: "Result",
    render: (row) => {
      const status = scoreStatus(row.score);
      return <Badge tone={status.tone}>{status.label}</Badge>;
    },
  },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const session = getUser();

  const me = {
    name: session?.name ?? "Student",
    email: session?.email ?? "",
    institution: session?.institution_name ?? "",
    institutionShort: session?.institution_short ?? "",
    course: session?.course ?? "",
    batch: session?.batch ?? "",
    rollNo: session?.roll_no ?? "",
  };

  const vivasQuery = useLoad(() => api.student.vivas());
  const resultsQuery = useLoad(() => api.student.results());

  const vivas = vivasQuery.data ?? [];
  const results = resultsQuery.data ?? [];

  const firstLoad =
    (vivasQuery.loading && !vivasQuery.data) ||
    (resultsQuery.loading && !resultsQuery.data);
  const error = vivasQuery.error || resultsQuery.error;

  const reloadAll = () => {
    vivasQuery.reload();
    resultsQuery.reload();
  };

  const [tab, setTab] = useState<Tab>("dashboard");

  const average = results.length
    ? Math.round(
        results.reduce((sum, row) => sum + row.score, 0) / results.length,
      )
    : null;
  const best = results.length
    ? Math.max(...results.map((row) => row.score))
    : null;

  const renderVivaCard = (viva: Viva) => (
    <article className="dashboard-card viva-card" key={viva.id}>
      <div className="viva-card-header">
        <div className="card-heading">
          <div className="card-icon">
            <BookOpen size={20} />
          </div>

          <div>
            <h3>{viva.subject}</h3>
            <p className="viva-subject">{viva.semester}</p>
          </div>
        </div>

        <span
          className={`viva-status ${viva.status === "Upcoming" ? "ready" : ""}`}
        >
          <span />
          {viva.status === "Upcoming" ? "Ready" : "Scheduled"}
        </span>
      </div>

      <div className="viva-meta">
        <span>
          <GraduationCap size={16} />
          {viva.department}
        </span>

        <span>
          <CalendarDays size={16} />
          {formatDate(viva.date)}
        </span>

        <span>
          <Clock3 size={16} />
          {formatTime(viva.time)} · {viva.duration_minutes} minutes
        </span>
      </div>

      <div className="viva-card-footer">
        <span>AI-generated questions · Adaptive follow-ups</span>

        {viva.status === "Upcoming" ? (
          <button
            type="button"
            className="dashboard-continue"
            onClick={() => navigate("/start")}
          >
            Start Viva
            <BookOpen size={18} />
          </button>
        ) : (
          <button type="button" className="dashboard-continue" disabled>
            Opens {formatDate(viva.date)}
          </button>
        )}
      </div>
    </article>
  );

  const vivaList = (
    <>
      {vivas.length === 0 ? (
        <div className="empty-state">
          <h3>No vivas scheduled yet</h3>
          <p>
            When your teachers schedule a viva for your batch, it will
            appear here.
          </p>
        </div>
      ) : (
        <div className="viva-list">{vivas.map(renderVivaCard)}</div>
      )}
    </>
  );

  const renderDashboard = () => (
    <>
      <section className="dashboard-welcome">
        <div>
          <span className="welcome-tag">YOUR AI VIVA EXAMINER</span>

          <h1>
            {getGreeting()}, {shortName(me.name)}
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

      <SectionHeading
        title="Upcoming Vivas"
        subtitle="Vivas assigned to you by your institution."
        right={
          <span className="required-label">{vivas.length} available</span>
        }
      />

      {vivaList}
    </>
  );

  const renderVivas = () => (
    <>
      <SectionHeading
        title="My Vivas"
        subtitle="Every viva assigned to you, with its schedule and status."
        right={
          <span className="required-label">{vivas.length} assigned</span>
        }
      />

      {vivaList}
    </>
  );

  const renderPerformance = () => (
    <>
      <SectionHeading
        title="Performance Overview"
        subtitle="A summary of how you have done across your vivas."
      />

      <div className="dashboard-stat-grid">
        <StatCard
          icon={BarChart3}
          label="Average score"
          value={average === null ? "—" : `${average}%`}
        />
        <StatCard
          icon={Check}
          label="Vivas completed"
          value={results.length}
        />
        <StatCard
          icon={Trophy}
          label="Best score"
          value={best === null ? "—" : `${best}%`}
        />
      </div>

      <DataSection
        title="Recent Vivas"
        columns={historyColumns}
        rows={results.slice(0, 5)}
        rowKey={(row) => String(row.id)}
        searchText={(row) => row.subject}
        searchPlaceholder="Search your vivas"
        emptyText="You have not completed a viva yet."
      />
    </>
  );

  const renderHistory = () => (
    <DataSection
      title="Viva History"
      subtitle="All vivas you have completed so far."
      columns={historyColumns}
      rows={results}
      rowKey={(row) => String(row.id)}
      searchText={(row) => row.subject}
      searchPlaceholder="Search your vivas"
      emptyText="You have not completed a viva yet."
    />
  );

  const renderReviews = () => (
    <>
      <SectionHeading
        title="Review Requests"
        subtitle="Ask a teacher to re-evaluate an answer and track the outcome here."
      />

      <div className="empty-state">
        <h3>No review requests yet</h3>
        <p>
          Requesting a review of a viva result is coming soon. Your
          requests and their outcomes will be listed on this page.
        </p>
      </div>
    </>
  );

  const content: Record<Exclude<Tab, "profile">, () => React.ReactElement> =
    {
      dashboard: renderDashboard,
      vivas: renderVivas,
      performance: renderPerformance,
      history: renderHistory,
      reviews: renderReviews,
    };

  return (
    <DashboardShell
      portalLabel="Workspace"
      navItems={navItems}
      active={tab}
      onNavigate={(key) => setTab(key as Tab)}
      title={titles[tab]}
      photoStorageKey="elysian.student.photo"
      user={{
        name: me.name,
        email: me.email,
        subtitle: `${me.institutionShort} · ${me.course || "Student"}`,
        roleLabel: "Student",
        details: [
          { label: "Institution", value: me.institution },
          { label: "Course", value: me.course },
          { label: "Batch", value: me.batch },
          { label: "Roll number", value: me.rollNo },
        ],
      }}
    >
      {tab !== "profile" &&
        (firstLoad || error ? (
          <StatusBlock
            loading={firstLoad}
            error={error}
            onRetry={reloadAll}
          />
        ) : (
          content[tab]()
        ))}
    </DashboardShell>
  );
}
