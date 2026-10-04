import { useState, type FormEvent } from "react";
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
  Toast,
  getGreeting,
  scoreStatus,
  type Column,
  type Tone,
} from "./dashboardKit";
import {
  adminActivity,
  adminProfile,
  adminRecordRows,
  adminVivaRows,
  batchRows,
  courseRows,
  departmentRows,
  formatDate,
  formatTime,
  initialAdminStudents,
  initialPendingStudents,
  initialPendingTeachers,
  initialTeachers,
  institutionSettings,
  subjectRows,
  type AdminStudent,
  type PendingApproval,
  type Teacher,
  type VivaStatus,
} from "./mockData";

/* ---------------------------------------------------------
   Institution Admin dashboard (mock data - swap for API
   calls later)
--------------------------------------------------------- */

type Tab =
  | "dashboard"
  | "students"
  | "teachers"
  | "departments"
  | "courses"
  | "subjects"
  | "batches"
  | "vivas"
  | "records"
  | "approvals"
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

const statusTone: Record<VivaStatus, Tone> = {
  Upcoming: "info",
  Scheduled: "neutral",
  Completed: "success",
};

/* ----------------------------- Static table columns ----------------------------- */

const departmentColumns: Column<(typeof departmentRows)[number]>[] = [
  { key: "name", header: "Department", render: (r) => <strong>{r.name}</strong> },
  { key: "head", header: "Head", render: (r) => r.head },
  { key: "teachers", header: "Teachers", render: (r) => r.teachers },
  { key: "students", header: "Students", render: (r) => r.students },
];

const courseColumns: Column<(typeof courseRows)[number]>[] = [
  { key: "name", header: "Course", render: (r) => <strong>{r.name}</strong> },
  { key: "department", header: "Department", render: (r) => r.department },
  { key: "duration", header: "Duration", render: (r) => r.duration },
  { key: "students", header: "Students", render: (r) => r.students },
];

const subjectColumns: Column<(typeof subjectRows)[number]>[] = [
  { key: "name", header: "Subject", render: (r) => <strong>{r.name}</strong> },
  { key: "code", header: "Code", render: (r) => r.code },
  { key: "department", header: "Department", render: (r) => r.department },
  { key: "semester", header: "Semester", render: (r) => r.semester },
];

const batchColumns: Column<(typeof batchRows)[number]>[] = [
  { key: "name", header: "Batch", render: (r) => <strong>{r.name}</strong> },
  { key: "course", header: "Programme", render: (r) => r.course },
  { key: "students", header: "Students", render: (r) => r.students },
  {
    key: "status",
    header: "Status",
    render: (r) => (
      <Badge tone={r.status === "Active" ? "success" : "info"}>
        {r.status}
      </Badge>
    ),
  },
];

const vivaColumns: Column<(typeof adminVivaRows)[number]>[] = [
  { key: "subject", header: "Subject", render: (r) => <strong>{r.subject}</strong> },
  { key: "teacher", header: "Teacher", render: (r) => r.teacher },
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

const recordColumns: Column<(typeof adminRecordRows)[number]>[] = [
  {
    key: "student",
    header: "Student",
    render: (r) => (
      <div className="person-cell">
        <span className="avatar avatar-xs">{r.student.charAt(0)}</span>
        <strong>{r.student}</strong>
      </div>
    ),
  },
  { key: "subject", header: "Subject", render: (r) => r.subject },
  { key: "teacher", header: "Teacher", render: (r) => r.teacher },
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

const studentColumns: Column<AdminStudent>[] = [
  {
    key: "student",
    header: "Student",
    render: (s) => (
      <div className="person-cell">
        <span className="avatar avatar-xs">{s.name.charAt(0)}</span>
        <div>
          <strong>{s.name}</strong>
          <small>{s.roll}</small>
        </div>
      </div>
    ),
  },
  { key: "course", header: "Course", render: (s) => s.course },
  { key: "batch", header: "Batch", render: (s) => s.batch },
  { key: "vivas", header: "Vivas", render: (s) => s.vivas },
  {
    key: "score",
    header: "Avg score",
    render: (s) => {
      const status = scoreStatus(s.avgScore);
      return (
        <Badge tone={status.tone}>
          {s.avgScore}% · {status.label}
        </Badge>
      );
    },
  },
];

const teacherColumns: Column<Teacher>[] = [
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
  { key: "department", header: "Department", render: (t) => t.department },
  { key: "teacherId", header: "Teacher ID", render: (t) => t.teacherId },
  { key: "vivas", header: "Vivas", render: (t) => t.vivas },
  {
    key: "status",
    header: "Status",
    render: () => <Badge tone="success">Active</Badge>,
  },
];

/* ----------------------------- Dashboard ----------------------------- */

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [pendingTeachers, setPendingTeachers] = useState<PendingApproval[]>(
    initialPendingTeachers,
  );
  const [pendingStudents, setPendingStudents] = useState<PendingApproval[]>(
    initialPendingStudents,
  );
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [students, setStudents] = useState<AdminStudent[]>(
    initialAdminStudents,
  );
  const [settings, setSettings] = useState(institutionSettings);
  const [toast, setToast] = useState("");

  const goTo = (next: Tab) => setTab(next);

  const pendingCount = pendingTeachers.length + pendingStudents.length;

  /* ----------------------------- Approvals ----------------------------- */

  const decideTeacher = (person: PendingApproval, approve: boolean) => {
    setPendingTeachers((current) =>
      current.filter((item) => item.id !== person.id),
    );

    if (approve) {
      setTeachers((current) => [
        ...current,
        {
          id: `t-${person.id}`,
          name: person.name,
          email: `${person.name
            .toLowerCase()
            .replace(/^(dr|prof)\.?\s+/, "")
            .replace(/\s+/g, ".")}@nitsikkim.edu`,
          department: person.detail,
          teacherId: person.extra.replace("Teacher ID ", ""),
          vivas: 0,
        },
      ]);
    }

    setToast(
      approve
        ? `${person.name} approved as a teacher.`
        : `${person.name}'s request was rejected.`,
    );
  };

  const decideStudent = (person: PendingApproval, approve: boolean) => {
    setPendingStudents((current) =>
      current.filter((item) => item.id !== person.id),
    );

    if (approve) {
      setStudents((current) => [
        ...current,
        {
          id: `s-${person.id}`,
          name: person.name,
          roll: "Pending ID",
          batch: person.extra.replace("Batch ", ""),
          department: "",
          course: person.detail,
          vivas: 0,
          avgScore: 0,
        },
      ]);
    }

    setToast(
      approve
        ? `${person.name} approved as a student.`
        : `${person.name}'s request was rejected.`,
    );
  };

  const renderApprovalCard = (
    person: PendingApproval,
    onDecide: (person: PendingApproval, approve: boolean) => void,
  ) => (
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
          onClick={() => onDecide(person, true)}
        >
          <Check size={16} />
          Approve
        </button>

        <button
          type="button"
          className="dashboard-secondary compact"
          onClick={() => onDecide(person, false)}
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
            {getGreeting()}, {adminProfile.short}
          </h1>

          <p>
            Manage people, courses and vivas for{" "}
            {adminProfile.institutionShort} from one place.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-continue"
          onClick={() => goTo("approvals")}
        >
          <UserCheck size={18} />
          Review approvals ({pendingCount})
        </button>
      </section>

      <div className="dashboard-stat-grid four">
        <StatCard icon={GraduationCap} label="Students" value={students.length} />
        <StatCard icon={Users} label="Teachers" value={teachers.length} />
        <StatCard
          icon={Building2}
          label="Departments"
          value={departmentRows.length}
        />
        <StatCard
          icon={UserCheck}
          label="Pending approvals"
          value={pendingCount}
        />
      </div>

      <div className="dash-columns">
        <section className="dashboard-card">
          <div className="card-title-row">
            <h3>Pending approvals</h3>

            <button
              type="button"
              className="text-action"
              onClick={() => goTo("approvals")}
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
              {pendingTeachers.slice(0, 2).map((person) =>
                renderApprovalCard(person, decideTeacher),
              )}
              {pendingStudents.slice(0, 1).map((person) =>
                renderApprovalCard(person, decideStudent),
              )}
            </>
          )}
        </section>

        <section className="dashboard-card">
          <div className="card-title-row">
            <h3>Recent activity</h3>
          </div>

          <div className="activity-list">
            {adminActivity.map((item) => (
              <div className="activity-item" key={item.id}>
                <div className="activity-icon">
                  <Activity size={18} />
                </div>

                <div className="activity-content">
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>

                <span className="activity-time">{item.time}</span>
              </div>
            ))}
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
            onClick={() => goTo("vivas")}
          >
            View all
          </button>
        }
      />

      <div className="dashboard-card table-card">
        <DataTable
          columns={vivaColumns}
          rows={adminVivaRows.slice(0, 4)}
          rowKey={(row) => row.id}
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
          pendingTeachers.map((person) =>
            renderApprovalCard(person, decideTeacher),
          )
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
          pendingStudents.map((person) =>
            renderApprovalCard(person, decideStudent),
          )
        )}
      </section>
    </>
  );

  const handleSaveSettings = (event: FormEvent) => {
    event.preventDefault();
    setToast("Institution settings saved.");
  };

  const renderSettings = () => (
    <>
      <SectionHeading
        title="Institution Settings"
        subtitle="Details shown to teachers and students of your institution."
      />

      <form className="dashboard-card" onSubmit={handleSaveSettings}>
        <div className="schedule-grid">
          <div className="dashboard-field full">
            <label htmlFor="inst-name">Institution name</label>
            <input
              id="inst-name"
              className="field-control"
              value={settings.name}
              onChange={(event) =>
                setSettings({ ...settings, name: event.target.value })
              }
            />
          </div>

          <div className="dashboard-field">
            <label htmlFor="inst-code">Institution code</label>
            <input
              id="inst-code"
              className="field-control"
              value={settings.code}
              onChange={(event) =>
                setSettings({ ...settings, code: event.target.value })
              }
            />
          </div>

          <div className="dashboard-field">
            <label htmlFor="inst-email">Contact email</label>
            <input
              id="inst-email"
              type="email"
              className="field-control"
              value={settings.email}
              onChange={(event) =>
                setSettings({ ...settings, email: event.target.value })
              }
            />
          </div>

          <div className="dashboard-field">
            <label htmlFor="inst-location">Location</label>
            <input
              id="inst-location"
              className="field-control"
              value={settings.location}
              onChange={(event) =>
                setSettings({ ...settings, location: event.target.value })
              }
            />
          </div>

          <div className="dashboard-field">
            <label htmlFor="inst-timezone">Time zone</label>
            <input
              id="inst-timezone"
              className="field-control"
              value={settings.timezone}
              onChange={(event) =>
                setSettings({ ...settings, timezone: event.target.value })
              }
            />
          </div>
        </div>

        <div className="dashboard-button-row">
          <button
            type="button"
            className="dashboard-secondary"
            onClick={() => setSettings(institutionSettings)}
          >
            Reset
          </button>

          <button type="submit" className="dashboard-continue">
            Save changes
          </button>
        </div>
      </form>
    </>
  );

  const content: Record<Exclude<Tab, "profile">, () => React.ReactElement> =
    {
      dashboard: renderDashboard,
      approvals: renderApprovals,
      students: () => (
        <DataSection
          title="Students"
          subtitle="Every student registered at your institution."
          columns={studentColumns}
          rows={students}
          rowKey={(row) => row.id}
          searchText={(row) =>
            `${row.name} ${row.roll} ${row.course} ${row.batch}`
          }
          searchPlaceholder="Search students"
        />
      ),
      teachers: () => (
        <DataSection
          title="Teachers"
          subtitle="Approved teachers at your institution."
          columns={teacherColumns}
          rows={teachers}
          rowKey={(row) => row.id}
          searchText={(row) =>
            `${row.name} ${row.email} ${row.department} ${row.teacherId}`
          }
          searchPlaceholder="Search teachers"
        />
      ),
      departments: () => (
        <DataSection
          title="Departments"
          subtitle="Academic departments and their heads."
          columns={departmentColumns}
          rows={departmentRows}
          rowKey={(row) => row.id}
          searchText={(row) => `${row.name} ${row.head}`}
          searchPlaceholder="Search departments"
        />
      ),
      courses: () => (
        <DataSection
          title="Courses"
          subtitle="Programmes offered by your institution."
          columns={courseColumns}
          rows={courseRows}
          rowKey={(row) => row.id}
          searchText={(row) => `${row.name} ${row.department}`}
          searchPlaceholder="Search courses"
        />
      ),
      subjects: () => (
        <DataSection
          title="Subjects"
          subtitle="Subjects that vivas can be scheduled for."
          columns={subjectColumns}
          rows={subjectRows}
          rowKey={(row) => row.id}
          searchText={(row) =>
            `${row.name} ${row.code} ${row.department} ${row.semester}`
          }
          searchPlaceholder="Search subjects"
        />
      ),
      batches: () => (
        <DataSection
          title="Batches"
          subtitle="Student batches across your programmes."
          columns={batchColumns}
          rows={batchRows}
          rowKey={(row) => row.id}
          searchText={(row) => `${row.name} ${row.course} ${row.status}`}
          searchPlaceholder="Search batches"
        />
      ),
      vivas: () => (
        <DataSection
          title="Scheduled Vivas"
          subtitle="All vivas created by teachers at your institution."
          columns={vivaColumns}
          rows={adminVivaRows}
          rowKey={(row) => row.id}
          searchText={(row) =>
            `${row.subject} ${row.teacher} ${row.batch} ${row.status}`
          }
          searchPlaceholder="Search vivas"
        />
      ),
      records: () => (
        <DataSection
          title="Viva Records"
          subtitle="Completed vivas and their scores."
          columns={recordColumns}
          rows={adminRecordRows}
          rowKey={(row) => row.id}
          searchText={(row) =>
            `${row.student} ${row.subject} ${row.teacher}`
          }
          searchPlaceholder="Search records"
        />
      ),
      settings: renderSettings,
    };

  return (
    <DashboardShell
      portalLabel="Admin workspace"
      navItems={navItems}
      active={tab}
      onNavigate={(key) => goTo(key as Tab)}
      title={titles[tab]}
      photoStorageKey="elysian.admin.photo"
      user={{
        name: adminProfile.name,
        email: adminProfile.email,
        subtitle: `${adminProfile.institutionShort} · Administrator`,
        roleLabel: adminProfile.role,
        details: [
          { label: "Institution", value: adminProfile.institution },
          { label: "Role", value: adminProfile.role },
          { label: "Admin ID", value: adminProfile.adminId },
        ],
      }}
    >
      {tab !== "profile" && content[tab]()}

      <Toast message={toast} onClose={() => setToast("")} />
    </DashboardShell>
  );
}
