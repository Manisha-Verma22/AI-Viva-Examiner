import { useEffect, useState, type FormEvent } from "react";
import {
  Activity,
  BookMarked,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  ClipboardList,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Settings,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import DashboardShell, { type NavItem } from "./DashboardShell";
import {
  Badge,
  DataSection,
  DataTable,
  SectionHeading,
  StatCard,
  StatusBlock,
  Toast,
  getGreeting,
  scoreStatus,
  type Column,
  type Tone,
} from "./dashboardKit";
import {
  api,
  getUser,
  messageOf,
  shortName,
  type BatchRow,
  type CourseRow,
  type DepartmentRow,
  type InstitutionSettings,
  type PendingPerson,
  type ResultRow,
  type StudentRow,
  type SubjectRow,
  type TeacherRow,
  type Viva,
} from "./api";
import { useLoad } from "./useLoad";
import { formatDate, formatTime } from "./mockData";

/* ---------------------------------------------------------
   Institution admin dashboard - all data comes from the API
--------------------------------------------------------- */

type Tab =
  | "dashboard"
  | "approvals"
  | "students"
  | "teachers"
  | "departments"
  | "courses"
  | "subjects"
  | "batches"
  | "vivas"
  | "records"
  | "settings"
  | "profile";

const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "approvals", label: "Approvals", icon: UserCheck },
  { key: "students", label: "Students", icon: GraduationCap },
  { key: "teachers", label: "Teachers", icon: Users },
  { key: "departments", label: "Departments", icon: Building2 },
  { key: "courses", label: "Courses", icon: BookMarked },
  { key: "subjects", label: "Subjects", icon: BookOpen },
  { key: "batches", label: "Batches", icon: Layers },
  { key: "vivas", label: "Scheduled Vivas", icon: CalendarDays },
  { key: "records", label: "Viva Records", icon: ClipboardList },
  { key: "settings", label: "Institution Settings", icon: Settings },
];

const titles: Record<Tab, string> = {
  dashboard: "Dashboard",
  approvals: "Approvals",
  students: "Students",
  teachers: "Teachers",
  departments: "Departments",
  courses: "Courses",
  subjects: "Subjects",
  batches: "Batches",
  vivas: "Scheduled Vivas",
  records: "Viva Records",
  settings: "Institution Settings",
  profile: "Profile & Settings",
};

const statusTone: Record<Viva["status"], Tone> = {
  Upcoming: "info",
  Scheduled: "neutral",
  Completed: "success",
  Cancelled: "danger",
};

/* ----------------------------- Table columns ----------------------------- */

const departmentColumns: Column<DepartmentRow>[] = [
  { key: "name", header: "Department", render: (r) => <strong>{r.name}</strong> },
  { key: "teachers", header: "Teachers", render: (r) => r.teachers },
  { key: "vivas", header: "Vivas", render: (r) => r.vivas },
];

const courseColumns: Column<CourseRow>[] = [
  { key: "name", header: "Course", render: (r) => <strong>{r.name}</strong> },
  { key: "students", header: "Students", render: (r) => r.students },
  { key: "vivas", header: "Vivas", render: (r) => r.vivas },
];

const subjectColumns: Column<SubjectRow>[] = [
  { key: "name", header: "Subject", render: (r) => <strong>{r.name}</strong> },
  { key: "department", header: "Department", render: (r) => r.department },
  { key: "semester", header: "Semester", render: (r) => r.semester },
  { key: "vivas", header: "Vivas", render: (r) => r.vivas },
];

const batchColumns: Column<BatchRow>[] = [
  { key: "name", header: "Batch", render: (r) => <strong>{r.name}</strong> },
  { key: "students", header: "Students", render: (r) => r.students },
  { key: "vivas", header: "Vivas", render: (r) => r.vivas },
];

const vivaColumns: Column<Viva>[] = [
  { key: "subject", header: "Subject", render: (r) => <strong>{r.subject}</strong> },
  { key: "teacher", header: "Teacher", render: (r) => r.teacher_name },
  { key: "batch", header: "Batch", render: (r) => r.batch },
  {
    key: "when",
    header: "Date & time",
    render: (r) => `${formatDate(r.date)} · ${formatTime(r.time)}`,
  },
  { key: "students", header: "Students", render: (r) => r.students },
  {
    key: "status",
    header: "Status",
    render: (r) => <Badge tone={statusTone[r.status]}>{r.status}</Badge>,
  },
];

const resultColumns: Column<ResultRow>[] = [
  {
    key: "student",
    header: "Student",
    render: (r) => (
      <div className="person-cell">
        <span className="avatar avatar-xs">{r.student_name.charAt(0)}</span>
        <strong>{r.student_name}</strong>
      </div>
    ),
  },
  { key: "subject", header: "Subject", render: (r) => r.subject },
  { key: "date", header: "Date", render: (r) => formatDate(r.date) },
  {
    key: "score",
    header: "Score",
    render: (r) => {
      const status = scoreStatus(r.score);
      return (
        <Badge tone={status.tone}>
          {r.score}% · {status.label}
        </Badge>
      );
    },
  },
];

const studentColumns: Column<StudentRow>[] = [
  {
    key: "student",
    header: "Student",
    render: (s) => (
      <div className="person-cell">
        <span className="avatar avatar-xs">{s.name.charAt(0)}</span>
        <div>
          <strong>{s.name}</strong>
          <small>{s.roll_no ?? s.email}</small>
        </div>
      </div>
    ),
  },
  { key: "course", header: "Course", render: (s) => s.course ?? "—" },
  { key: "batch", header: "Batch", render: (s) => s.batch ?? "—" },
  { key: "vivas", header: "Vivas", render: (s) => s.vivas },
  {
    key: "score",
    header: "Avg score",
    render: (s) => {
      if (!s.vivas) return <Badge tone="neutral">No vivas yet</Badge>;

      const status = scoreStatus(s.avg_score);
      return (
        <Badge tone={status.tone}>
          {s.avg_score}% · {status.label}
        </Badge>
      );
    },
  },
];

const teacherColumns: Column<TeacherRow>[] = [
  {
    key: "teacher",
    header: "Teacher",
    render: (t) => (
      <div className="person-cell">
        <span className="avatar avatar-xs">
          {t.name.replace(/^(Dr|Prof)\.?\s+/i, "").charAt(0)}
        </span>
        <div>
          <strong>{t.name}</strong>
          <small>{t.email}</small>
        </div>
      </div>
    ),
  },
  { key: "department", header: "Department", render: (t) => t.department ?? "—" },
  { key: "teacherId", header: "Teacher ID", render: (t) => t.teacher_code ?? "—" },
  { key: "vivas", header: "Vivas", render: (t) => t.vivas },
  {
    key: "status",
    header: "Status",
    render: () => <Badge tone="success">Active</Badge>,
  },
];

/* ----------------------------- Dashboard ----------------------------- */

export default function AdminDashboard() {
  const session = getUser();

  const me = {
    name: session?.name ?? "Administrator",
    email: session?.email ?? "",
    institution: session?.institution_name ?? "",
    institutionShort: session?.institution_short ?? "",
  };

  const summaryQuery = useLoad(() => api.admin.summary());
  const approvalsQuery = useLoad(() => api.admin.approvals());
  const studentsQuery = useLoad(() => api.admin.students());
  const teachersQuery = useLoad(() => api.admin.teachers());
  const vivasQuery = useLoad(() => api.admin.vivas());
  const resultsQuery = useLoad(() => api.admin.results());
  const departmentsQuery = useLoad(() => api.admin.departments());
  const coursesQuery = useLoad(() => api.admin.courses());
  const subjectsQuery = useLoad(() => api.admin.subjects());
  const batchesQuery = useLoad(() => api.admin.batches());
  const settingsQuery = useLoad(() => api.admin.institution());

  const queries = [
    summaryQuery,
    approvalsQuery,
    studentsQuery,
    teachersQuery,
    vivasQuery,
    resultsQuery,
    departmentsQuery,
    coursesQuery,
    subjectsQuery,
    batchesQuery,
    settingsQuery,
  ];

  const firstLoad = queries.some((query) => query.loading && !query.data);
  const error = queries.find((query) => query.error)?.error ?? "";

  const reloadAll = () => queries.forEach((query) => query.reload());

  const summary = summaryQuery.data;
  const pendingTeachers = approvalsQuery.data?.teachers ?? [];
  const pendingStudents = approvalsQuery.data?.students ?? [];
  const pendingCount = pendingTeachers.length + pendingStudents.length;
  const vivas = vivasQuery.data ?? [];
  const results = resultsQuery.data ?? [];

  const [tab, setTab] = useState<Tab>("dashboard");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState<InstitutionSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  /* Fill the settings form once it has loaded */
  useEffect(() => {
    if (settingsQuery.data) setForm(settingsQuery.data);
  }, [settingsQuery.data]);

  /* ----------------------------- Approvals ----------------------------- */

  const decide = async (person: PendingPerson, approve: boolean) => {
    try {
      if (approve) await api.admin.approve(person.id);
      else await api.admin.reject(person.id);

      setToast(
        approve
          ? `${person.name} was approved.`
          : `${person.name}'s request was rejected.`,
      );

      summaryQuery.reload();
      approvalsQuery.reload();
      studentsQuery.reload();
      teachersQuery.reload();
    } catch (err) {
      setToast(messageOf(err));
    }
  };

  const renderApprovalCard = (person: PendingPerson) => (
    <div className="approval-card" key={person.id}>
      <span className="avatar avatar-sm">
        {person.name.replace(/^(Dr|Prof)\.?\s+/i, "").charAt(0)}
      </span>

      <div className="approval-info">
        <strong>{person.name}</strong>
        <small>
          {person.detail} · {person.extra}
        </small>
      </div>

      <div className="approval-actions">
        <button
          type="button"
          className="dashboard-continue compact"
          onClick={() => void decide(person, true)}
        >
          <Check size={16} />
          Approve
        </button>

        <button
          type="button"
          className="dashboard-secondary compact"
          onClick={() => void decide(person, false)}
        >
          <X size={16} />
          Reject
        </button>
      </div>
    </div>
  );

  /* ----------------------------- Sections ----------------------------- */

  const renderDashboard = () => (
    <>
      <section className="dashboard-welcome">
        <div>
          <span className="welcome-tag">INSTITUTION ADMIN</span>

          <h1>
            {getGreeting()}, {shortName(me.name)}
          </h1>

          <p>
            Manage people, courses and vivas for {me.institutionShort} from
            one place.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-continue"
          onClick={() => setTab("approvals")}
        >
          <UserCheck size={18} />
          Review approvals ({pendingCount})
        </button>
      </section>

      <div className="dashboard-stat-grid four">
        <StatCard
          icon={GraduationCap}
          label="Students"
          value={summary?.students ?? 0}
        />
        <StatCard
          icon={Users}
          label="Teachers"
          value={summary?.teachers ?? 0}
        />
        <StatCard
          icon={CalendarDays}
          label="Vivas"
          value={summary?.vivas ?? 0}
        />
        <StatCard
          icon={UserCheck}
          label="Pending approvals"
          value={summary?.pending_approvals ?? 0}
        />
      </div>

      <div className="dash-columns">
        <section className="dashboard-card">
          <div className="card-title-row">
            <h3>Pending approvals</h3>

            <button
              type="button"
              className="text-action"
              onClick={() => setTab("approvals")}
            >
              View all
            </button>
          </div>

          {pendingCount === 0 ? (
            <div className="empty-state">
              <h3>You're all caught up</h3>
              <p>New teacher and student requests will appear here.</p>
            </div>
          ) : (
            <>
              {pendingTeachers.slice(0, 2).map(renderApprovalCard)}
              {pendingStudents.slice(0, 1).map(renderApprovalCard)}
            </>
          )}
        </section>

        <section className="dashboard-card">
          <div className="card-title-row">
            <h3>Recent results</h3>
          </div>

          <div className="activity-list">
            {results.slice(0, 4).map((result) => (
              <div className="activity-item" key={result.id}>
                <div className="activity-icon">
                  <Activity size={18} />
                </div>

                <div className="activity-content">
                  <strong>{result.student_name}</strong>
                  <span>
                    {result.subject} · {result.score}%
                  </span>
                </div>

                <span className="activity-time">
                  {formatDate(result.date)}
                </span>
              </div>
            ))}

            {results.length === 0 && (
              <p className="section-sub">No viva results yet.</p>
            )}
          </div>
        </section>
      </div>

      <SectionHeading
        title="Scheduled Vivas"
        subtitle="What is coming up across your institution."
        right={
          <button
            type="button"
            className="text-action"
            onClick={() => setTab("vivas")}
          >
            View all
          </button>
        }
      />

      <div className="dashboard-card table-card">
        <DataTable
          columns={vivaColumns}
          rows={vivas.slice(0, 4)}
          rowKey={(row) => String(row.id)}
          emptyText="No vivas scheduled yet."
        />
      </div>
    </>
  );

  const renderApprovals = () => (
    <>
      <SectionHeading
        title="Pending approvals"
        subtitle="Approve or reject new teacher and student accounts."
        right={<span className="required-label">{pendingCount} pending</span>}
      />

      <section className="dashboard-card">
        <div className="card-title-row">
          <h3>Teachers ({pendingTeachers.length})</h3>
        </div>

        {pendingTeachers.length === 0 ? (
          <div className="empty-state">
            <h3>No pending teacher requests</h3>
          </div>
        ) : (
          pendingTeachers.map(renderApprovalCard)
        )}
      </section>

      <section className="dashboard-card">
        <div className="card-title-row">
          <h3>Students ({pendingStudents.length})</h3>
        </div>

        {pendingStudents.length === 0 ? (
          <div className="empty-state">
            <h3>No pending student requests</h3>
          </div>
        ) : (
          pendingStudents.map(renderApprovalCard)
        )}
      </section>
    </>
  );

  const handleSaveSettings = async (event: FormEvent) => {
    event.preventDefault();

    if (!form) return;

    setSavingSettings(true);

    try {
      const saved = await api.admin.updateInstitution(form);
      setForm(saved);
      setToast("Institution settings saved.");
    } catch (err) {
      setToast(messageOf(err));
    } finally {
      setSavingSettings(false);
    }
  };

  const renderSettings = () => {
    if (!form) return null;

    const field = (
      id: string,
      label: string,
      key: keyof InstitutionSettings,
      full = false,
    ) => (
      <div className={`dashboard-field ${full ? "full" : ""}`}>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          className="field-control"
          value={form[key]}
          onChange={(event) =>
            setForm({ ...form, [key]: event.target.value })
          }
        />
      </div>
    );

    return (
      <>
        <SectionHeading
          title="Institution Settings"
          subtitle="Details shown to teachers and students of your institution."
        />

        <form
          className="dashboard-card"
          onSubmit={(event) => void handleSaveSettings(event)}
        >
          <div className="schedule-grid">
            {field("inst-name", "Institution name", "name", true)}
            {field("inst-code", "Institution code", "code")}
            {field("inst-email", "Contact email", "contact_email")}
            {field("inst-location", "Location", "location")}
            {field("inst-timezone", "Time zone", "timezone")}
          </div>

          <div className="dashboard-button-row">
            <button
              type="button"
              className="dashboard-secondary"
              onClick={() => settingsQuery.data && setForm(settingsQuery.data)}
            >
              Reset
            </button>

            <button
              type="submit"
              className="dashboard-continue"
              disabled={savingSettings}
            >
              {savingSettings ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </>
    );
  };

  const content: Record<Exclude<Tab, "profile">, () => React.ReactElement | null> =
    {
      dashboard: renderDashboard,
      approvals: renderApprovals,
      students: () => (
        <DataSection
          title="Students"
          subtitle="Every approved student at your institution."
          columns={studentColumns}
          rows={studentsQuery.data ?? []}
          rowKey={(row) => String(row.id)}
          searchText={(row) =>
            `${row.name} ${row.roll_no ?? ""} ${row.course ?? ""} ${row.batch ?? ""}`
          }
          searchPlaceholder="Search students"
        />
      ),
      teachers: () => (
        <DataSection
          title="Teachers"
          subtitle="Approved teachers at your institution."
          columns={teacherColumns}
          rows={teachersQuery.data ?? []}
          rowKey={(row) => String(row.id)}
          searchText={(row) =>
            `${row.name} ${row.email} ${row.department ?? ""} ${row.teacher_code ?? ""}`
          }
          searchPlaceholder="Search teachers"
        />
      ),
      departments: () => (
        <DataSection
          title="Departments"
          subtitle="Departments found across your teachers and vivas."
          columns={departmentColumns}
          rows={departmentsQuery.data ?? []}
          rowKey={(row) => row.name}
          searchText={(row) => row.name}
          searchPlaceholder="Search departments"
        />
      ),
      courses: () => (
        <DataSection
          title="Courses"
          subtitle="Courses your students are enrolled in."
          columns={courseColumns}
          rows={coursesQuery.data ?? []}
          rowKey={(row) => row.name}
          searchText={(row) => row.name}
          searchPlaceholder="Search courses"
        />
      ),
      subjects: () => (
        <DataSection
          title="Subjects"
          subtitle="Subjects that vivas have been scheduled for."
          columns={subjectColumns}
          rows={subjectsQuery.data ?? []}
          rowKey={(row) => `${row.name}-${row.department}-${row.semester}`}
          searchText={(row) =>
            `${row.name} ${row.department} ${row.semester}`
          }
          searchPlaceholder="Search subjects"
        />
      ),
      batches: () => (
        <DataSection
          title="Batches"
          subtitle="Student batches at your institution."
          columns={batchColumns}
          rows={batchesQuery.data ?? []}
          rowKey={(row) => row.name}
          searchText={(row) => row.name}
          searchPlaceholder="Search batches"
        />
      ),
      vivas: () => (
        <DataSection
          title="Scheduled Vivas"
          subtitle="All vivas created by teachers at your institution."
          columns={vivaColumns}
          rows={vivas}
          rowKey={(row) => String(row.id)}
          searchText={(row) =>
            `${row.subject} ${row.teacher_name} ${row.batch} ${row.status}`
          }
          searchPlaceholder="Search vivas"
        />
      ),
      records: () => (
        <DataSection
          title="Viva Records"
          subtitle="Completed vivas and their scores."
          columns={resultColumns}
          rows={results}
          rowKey={(row) => String(row.id)}
          searchText={(row) => `${row.student_name} ${row.subject}`}
          searchPlaceholder="Search records"
        />
      ),
      settings: renderSettings,
    };

  const showStatus = firstLoad || Boolean(error);

  return (
    <DashboardShell
      portalLabel="Admin workspace"
      navItems={navItems}
      active={tab}
      onNavigate={(key) => setTab(key as Tab)}
      title={titles[tab]}
      photoStorageKey="elysian.admin.photo"
      user={{
        name: me.name,
        email: me.email,
        subtitle: `${me.institutionShort} · Administrator`,
        roleLabel: "Institution Administrator",
        details: [
          { label: "Institution", value: me.institution },
          { label: "Role", value: "Institution Administrator" },
        ],
      }}
    >
      {tab !== "profile" &&
        (showStatus ? (
          <StatusBlock
            loading={firstLoad}
            error={error}
            onRetry={reloadAll}
          />
        ) : (
          content[tab]()
        ))}

      <Toast message={toast} onClose={() => setToast("")} />
    </DashboardShell>
  );
}
