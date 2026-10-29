import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  Clock3,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Plus,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";

import DashboardShell, { type NavItem } from "./DashboardShell";
import {
  Badge,
  DataSection,
  DataTable,
  Modal,
  ScoreBar,
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
  type MaterialRow,
  type RecordDetail,
  type ResultRow,
  type StudentRow,
  type Viva,
} from "./api";
import { useLoad } from "./useLoad";
import {
  formatDate,
  formatLongDate,
  formatTime,
  scheduleOptions,
  todayISO,
} from "./mockData";

/* ---------------------------------------------------------
   Teacher dashboard - all data comes from the backend API
--------------------------------------------------------- */

type Tab =
  | "dashboard"
  | "schedule"
  | "vivas"
  | "students"
  | "results"
  | "records"
  | "materials"
  | "profile";

const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "schedule", label: "Schedule Viva", icon: CalendarPlus },
  { key: "vivas", label: "My Vivas", icon: BookOpen },
  { key: "students", label: "Students", icon: Users },
  { key: "results", label: "Results", icon: BarChart3 },
  { key: "records", label: "Viva Records", icon: ClipboardList },
  { key: "materials", label: "Study Material", icon: FolderOpen },
];

const titles: Record<Tab, string> = {
  dashboard: "Dashboard",
  schedule: "Schedule Viva",
  vivas: "My Vivas",
  students: "Students",
  results: "Results",
  records: "Viva Records",
  materials: "Study Material",
  profile: "Profile & Settings",
};

const statusTone: Record<Viva["status"], Tone> = {
  Upcoming: "info",
  Scheduled: "neutral",
  Completed: "success",
  Cancelled: "danger",
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const FILE_PATTERN = /\.(pdf|doc|docx|txt)$/i;

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ----------------------------- Table columns ----------------------------- */

const studentColumns: Column<StudentRow>[] = [
  {
    key: "student",
    header: "Student",
    render: (student) => (
      <div className="person-cell">
        <span className="avatar avatar-xs">{student.name.charAt(0)}</span>
        <div>
          <strong>{student.name}</strong>
          <small>{student.roll_no ?? student.email}</small>
        </div>
      </div>
    ),
  },
  { key: "batch", header: "Batch", render: (s) => s.batch ?? "—" },
  { key: "vivas", header: "Vivas", render: (s) => s.vivas },
  {
    key: "score",
    header: "Avg score",
    render: (s) => (s.vivas ? `${s.avg_score}%` : "—"),
  },
  {
    key: "status",
    header: "Status",
    render: (s) => {
      if (!s.vivas) return <Badge tone="neutral">No vivas yet</Badge>;

      const status = scoreStatus(s.avg_score);
      return <Badge tone={status.tone}>{status.label}</Badge>;
    },
  },
];

const resultColumns: Column<ResultRow>[] = [
  {
    key: "student",
    header: "Student",
    render: (row) => (
      <div className="person-cell">
        <span className="avatar avatar-xs">{row.student_name.charAt(0)}</span>
        <strong>{row.student_name}</strong>
      </div>
    ),
  },
  { key: "subject", header: "Subject", render: (row) => row.subject },
  { key: "date", header: "Date", render: (row) => formatDate(row.date) },
  { key: "score", header: "Score", render: (row) => `${row.score}%` },
  {
    key: "status",
    header: "Status",
    render: (row) => {
      const status = scoreStatus(row.score);
      return <Badge tone={status.tone}>{status.label}</Badge>;
    },
  },
];

/* ----------------------------- Schedule form ----------------------------- */

type ScheduleValues = {
  subject: string;
  department: string;
  course: string;
  semester: string;
  batch: string;
  date: string;
  time: string;
  duration: number;
  file: File | null;
};

function ScheduleForm({
  initial,
  saving,
  onSubmit,
  onCancel,
}: {
  initial: Viva | null;
  saving: boolean;
  onSubmit: (values: ScheduleValues) => void;
  onCancel: () => void;
}) {
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [department, setDepartment] = useState(
    initial?.department ?? scheduleOptions.departments[0],
  );
  const [course, setCourse] = useState(
    initial?.course ?? scheduleOptions.courses[0],
  );
  const [semester, setSemester] = useState(
    initial?.semester ?? scheduleOptions.semesters[3],
  );
  const [batch, setBatch] = useState(
    initial?.batch ?? scheduleOptions.batches[2],
  );
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [time, setTime] = useState(initial?.time ?? "");
  const [duration, setDuration] = useState(
    String(initial?.duration_minutes ?? 20),
  );
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = event.target.files?.[0];
    event.target.value = "";

    if (!chosen) return;

    if (!FILE_PATTERN.test(chosen.name)) {
      setErrors((current) => ({
        ...current,
        file: "Please upload a PDF, DOC, DOCX or TXT file.",
      }));
      return;
    }

    if (chosen.size > MAX_FILE_BYTES) {
      setErrors((current) => ({
        ...current,
        file: "File must be smaller than 10 MB.",
      }));
      return;
    }

    setErrors((current) => {
      const next = { ...current };
      delete next.file;
      return next;
    });
    setFile(chosen);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const next: Record<string, string> = {};

    if (subject.trim().length < 2) next.subject = "Please enter the subject.";
    if (!date) next.date = "Please choose a date.";
    else if (!initial && date < todayISO()) {
      next.date = "Choose today or a future date.";
    }
    if (!time) next.time = "Please choose a start time.";

    setErrors(next);

    if (Object.keys(next).length > 0) return;

    onSubmit({
      subject: subject.trim(),
      department,
      course,
      semester,
      batch,
      date,
      time,
      duration: Number(duration),
      file,
    });
  };

  return (
    <form className="dashboard-card" onSubmit={handleSubmit} noValidate>
      <div className="schedule-grid">
        <div className="dashboard-field full">
          <label htmlFor="viva-subject">Subject</label>
          <input
            id="viva-subject"
            className="field-control"
            list="subject-options"
            placeholder="e.g. Data Structures"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
          <datalist id="subject-options">
            {scheduleOptions.subjects.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
          {errors.subject && (
            <small className="field-error">{errors.subject}</small>
          )}
        </div>

        <div className="dashboard-field">
          <label htmlFor="viva-department">Department</label>
          <select
            id="viva-department"
            className="field-control"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
          >
            {scheduleOptions.departments.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="dashboard-field">
          <label htmlFor="viva-course">Course</label>
          <select
            id="viva-course"
            className="field-control"
            value={course}
            onChange={(event) => setCourse(event.target.value)}
          >
            {scheduleOptions.courses.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="dashboard-field">
          <label htmlFor="viva-semester">Semester</label>
          <select
            id="viva-semester"
            className="field-control"
            value={semester}
            onChange={(event) => setSemester(event.target.value)}
          >
            {scheduleOptions.semesters.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="dashboard-field">
          <label htmlFor="viva-batch">Batch</label>
          <select
            id="viva-batch"
            className="field-control"
            value={batch}
            onChange={(event) => setBatch(event.target.value)}
          >
            {scheduleOptions.batches.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="dashboard-field">
          <label htmlFor="viva-date">Date</label>
          <input
            id="viva-date"
            type="date"
            className="field-control"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          {errors.date && (
            <small className="field-error">{errors.date}</small>
          )}
        </div>

        <div className="dashboard-field">
          <label htmlFor="viva-time">Start time</label>
          <input
            id="viva-time"
            type="time"
            className="field-control"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
          {errors.time && (
            <small className="field-error">{errors.time}</small>
          )}
        </div>

        <div className="dashboard-field">
          <label htmlFor="viva-duration">Duration</label>
          <select
            id="viva-duration"
            className="field-control"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
          >
            {scheduleOptions.durations.map((option) => (
              <option key={option} value={option}>
                {option} minutes
              </option>
            ))}
          </select>
        </div>

        <div className="dashboard-field full">
          <label htmlFor="viva-material">
            Study material
            <span className="optional-label">Optional</span>
          </label>

          <label className="upload-area" htmlFor="viva-material">
            <div className="upload-icon">
              <Upload size={20} />
            </div>
            <strong>Upload PDF / DOC / DOCX / TXT</strong>
            <span className="upload-note">
              The AI examiner can use this to shape questions · up to 10 MB
            </span>
          </label>

          <input
            id="viva-material"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="visually-hidden"
            onChange={handleFile}
          />

          {file && (
            <div className="uploaded-files">
              <div className="uploaded-file">
                <span>
                  <FileText size={15} /> {file.name} ·{" "}
                  {formatSize(file.size)}
                </span>

                <button
                  type="button"
                  className="icon-button"
                  aria-label="Remove file"
                  onClick={() => setFile(null)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {!file && initial?.material_name && (
            <small className="field-hint">
              Current material: {initial.material_name}. Upload a new file
              to replace it.
            </small>
          )}

          {errors.file && (
            <small className="field-error">{errors.file}</small>
          )}
        </div>
      </div>

      <div className="dashboard-button-row">
        <button
          type="button"
          className="dashboard-secondary"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="dashboard-continue"
          disabled={saving}
        >
          {saving
            ? "Saving…"
            : initial
              ? "Save changes"
              : "Schedule Viva"}
        </button>
      </div>
    </form>
  );
}

/* ----------------------------- Dashboard ----------------------------- */

export default function TeacherDashboard() {
  const session = getUser();

  const me = {
    name: session?.name ?? "Teacher",
    email: session?.email ?? "",
    institution: session?.institution_name ?? "",
    institutionShort: session?.institution_short ?? "",
    department: session?.department ?? "",
    teacherCode: session?.teacher_code ?? "",
  };

  const vivasQuery = useLoad(() => api.teacher.vivas());
  const studentsQuery = useLoad(() => api.teacher.students());
  const resultsQuery = useLoad(() => api.teacher.results());
  const materialsQuery = useLoad(() => api.teacher.materials());

  const vivas = vivasQuery.data ?? [];
  const students = studentsQuery.data ?? [];
  const results = resultsQuery.data ?? [];
  const materials = materialsQuery.data ?? [];

  const loading =
    vivasQuery.loading ||
    studentsQuery.loading ||
    resultsQuery.loading ||
    materialsQuery.loading;

  const error =
    vivasQuery.error ||
    studentsQuery.error ||
    resultsQuery.error ||
    materialsQuery.error;

  const firstLoad =
    loading &&
    !vivasQuery.data &&
    !studentsQuery.data &&
    !resultsQuery.data &&
    !materialsQuery.data;

  const reloadAll = () => {
    vivasQuery.reload();
    studentsQuery.reload();
    resultsQuery.reload();
    materialsQuery.reload();
  };

  const [tab, setTab] = useState<Tab>("dashboard");
  const [editing, setEditing] = useState<Viva | null>(null);
  const [selectedViva, setSelectedViva] = useState<Viva | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<RecordDetail | null>(
    null,
  );
  const [vivaFilter, setVivaFilter] = useState<"All" | Viva["status"]>("All");
  const [batchFilter, setBatchFilter] = useState("All batches");
  const [subjectFilter, setSubjectFilter] = useState("All subjects");
  const [materialSubject, setMaterialSubject] = useState(
    scheduleOptions.subjects[0],
  );
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const materialInputRef = useRef<HTMLInputElement>(null);

  const goTo = (next: Tab) => {
    setTab(next);
    setSelectedRecord(null);
    setSelectedViva(null);

    if (next !== "schedule") setEditing(null);
  };

  /* Derived numbers */
  const upcoming = vivas.filter(
    (viva) => viva.status === "Upcoming" || viva.status === "Scheduled",
  );

  const scored = students.filter((student) => student.vivas > 0);
  const averageScore = scored.length
    ? Math.round(
        scored.reduce((sum, student) => sum + student.avg_score, 0) /
          scored.length,
      )
    : null;

  const reviewCount = results.filter((result) => result.score < 65).length;

  /* ----------------------------- Actions ----------------------------- */

  const handleSchedule = async (values: ScheduleValues) => {
    setSaving(true);

    try {
      let materialId: number | null = null;

      if (values.file) {
        const material = await api.teacher.uploadMaterial(
          values.file,
          values.subject,
        );
        materialId = material.id;
      }

      const payload = {
        subject: values.subject,
        department: values.department,
        course: values.course,
        semester: values.semester,
        batch: values.batch,
        date: values.date,
        time: values.time,
        duration_minutes: values.duration,
        material_id: materialId,
      };

      if (editing) {
        await api.teacher.updateViva(editing.id, payload);
        setToast("Viva updated.");
      } else {
        await api.teacher.createViva(payload);
        setToast("Viva scheduled successfully.");
      }

      reloadAll();
      setEditing(null);
      setTab("vivas");
    } catch (err) {
      setToast(messageOf(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelViva = async (viva: Viva) => {
    if (!window.confirm(`Cancel the ${viva.subject} viva?`)) return;

    try {
      await api.teacher.cancelViva(viva.id);
      setToast("Viva cancelled.");
      setSelectedViva(null);
      vivasQuery.reload();
    } catch (err) {
      setToast(messageOf(err));
    }
  };

  const openRecord = async (id: number) => {
    try {
      setSelectedRecord(await api.teacher.record(id));
    } catch (err) {
      setToast(messageOf(err));
    }
  };

  const handleMaterialUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = event.target.files?.[0];
    event.target.value = "";

    if (!chosen) return;

    if (!FILE_PATTERN.test(chosen.name)) {
      setToast("Please upload a PDF, DOC, DOCX or TXT file.");
      return;
    }

    if (chosen.size > MAX_FILE_BYTES) {
      setToast("File must be smaller than 10 MB.");
      return;
    }

    try {
      await api.teacher.uploadMaterial(chosen, materialSubject);
      setToast("Study material uploaded.");
      materialsQuery.reload();
    } catch (err) {
      setToast(messageOf(err));
    }
  };

  const handleDeleteMaterial = async (material: MaterialRow) => {
    try {
      await api.teacher.deleteMaterial(material.id);
      setToast("Study material removed.");
      materialsQuery.reload();
    } catch (err) {
      setToast(messageOf(err));
    }
  };

  /* ----------------------------- Sections ----------------------------- */

  const renderDashboard = () => (
    <>
      <section className="dashboard-welcome">
        <div>
          <span className="welcome-tag">TEACHER PORTAL</span>

          <h1>
            {getGreeting()}, {shortName(me.name)}
          </h1>

          <p>Run every viva with clarity.</p>
        </div>

        <button
          type="button"
          className="dashboard-continue"
          onClick={() => {
            setEditing(null);
            goTo("schedule");
          }}
        >
          <Plus size={18} />
          Schedule New Viva
        </button>
      </section>

      <div className="dashboard-stat-grid four">
        <StatCard
          icon={CalendarDays}
          label="Upcoming vivas"
          value={upcoming.length}
        />
        <StatCard icon={Users} label="Students" value={students.length} />
        <StatCard
          icon={Star}
          label="Average score"
          value={averageScore === null ? "—" : `${averageScore}%`}
        />
        <StatCard
          icon={ClipboardList}
          label="Needs review"
          value={reviewCount}
        />
      </div>

      <div className="dash-columns">
        <section className="dashboard-card">
          <div className="card-title-row">
            <h3>Upcoming Vivas</h3>

            <button
              type="button"
              className="text-action"
              onClick={() => goTo("vivas")}
            >
              View all
            </button>
          </div>

          {upcoming.slice(0, 3).map((viva) => (
            <button
              type="button"
              className="list-row"
              key={viva.id}
              onClick={() => setSelectedViva(viva)}
            >
              <div className="list-row-icon">
                <BookOpen size={18} />
              </div>

              <div className="list-row-info">
                <strong>{viva.subject}</strong>
                <small>
                  {viva.course} · {viva.batch} · {viva.students} students
                </small>
              </div>

              <div className="list-row-end">
                <span>
                  {formatDate(viva.date)} · {formatTime(viva.time)}
                </span>
                <Badge tone={statusTone[viva.status]}>{viva.status}</Badge>
              </div>
            </button>
          ))}

          {upcoming.length === 0 && (
            <div className="empty-state">
              <h3>No upcoming vivas</h3>
              <p>Schedule one to see it here.</p>
            </div>
          )}
        </section>

        <section className="dashboard-card">
          <div className="card-title-row">
            <h3>Next on your schedule</h3>
          </div>

          {upcoming.slice(0, 3).map((viva) => (
            <div className="schedule-item" key={viva.id}>
              <span className="schedule-time">
                <Clock3 size={14} />
                {formatTime(viva.time)}
              </span>

              <div>
                <strong>{viva.subject}</strong>
                <small>
                  {formatDate(viva.date)} · {viva.students} students ·{" "}
                  {viva.duration_minutes} min
                </small>
              </div>
            </div>
          ))}

          {upcoming.length === 0 && (
            <p className="section-sub">Nothing scheduled yet.</p>
          )}
        </section>
      </div>

      <SectionHeading
        title="Recent Student Performance"
        subtitle="Latest viva results across your batches."
        right={
          <button
            type="button"
            className="text-action"
            onClick={() => goTo("results")}
          >
            View all results
          </button>
        }
      />

      <div className="dashboard-card table-card">
        <DataTable
          columns={resultColumns}
          rows={results.slice(0, 5)}
          rowKey={(row) => String(row.id)}
          emptyText="No viva results yet."
        />
      </div>
    </>
  );

  const renderSchedule = () => (
    <>
      <SectionHeading
        title={editing ? "Edit viva" : "Create a new Viva"}
        subtitle={
          editing
            ? "Update the schedule or details for this viva."
            : "Set up a viva for your students. The study material is optional."
        }
      />

      <ScheduleForm
        key={editing?.id ?? "new"}
        initial={editing}
        saving={saving}
        onSubmit={(values) => void handleSchedule(values)}
        onCancel={() => {
          const wasEditing = Boolean(editing);
          setEditing(null);
          setTab(wasEditing ? "vivas" : "dashboard");
        }}
      />
    </>
  );

  const renderVivas = () => {
    const filtered = vivas.filter(
      (viva) => vivaFilter === "All" || viva.status === vivaFilter,
    );

    return (
      <>
        <SectionHeading
          title="My Vivas"
          subtitle="Every viva you have created, with its schedule and status."
          right={
            <button
              type="button"
              className="dashboard-continue"
              onClick={() => {
                setEditing(null);
                goTo("schedule");
              }}
            >
              <Plus size={18} />
              New Viva
            </button>
          }
        />

        <div className="chip-tabs" role="tablist">
          {(["All", "Upcoming", "Scheduled", "Completed"] as const).map(
            (option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={vivaFilter === option}
                className={`chip-tab ${
                  vivaFilter === option ? "active" : ""
                }`}
                onClick={() => setVivaFilter(option)}
              >
                {option}
              </button>
            ),
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No vivas in this view</h3>
            <p>Try another filter or schedule a new viva.</p>
          </div>
        ) : (
          <div className="viva-tile-grid">
            {filtered.map((viva) => (
              <button
                type="button"
                className="viva-tile"
                key={viva.id}
                onClick={() => setSelectedViva(viva)}
              >
                <div className="viva-tile-top">
                  <div className="card-icon">
                    <BookOpen size={20} />
                  </div>
                  <Badge tone={statusTone[viva.status]}>{viva.status}</Badge>
                </div>

                <h3>{viva.subject}</h3>
                <p>
                  {viva.course} · {viva.batch}
                </p>

                <div className="viva-tile-meta">
                  <span>
                    <CalendarDays size={15} />
                    {formatDate(viva.date)} · {formatTime(viva.time)}
                  </span>
                  <span>
                    <Users size={15} />
                    {viva.students} students
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </>
    );
  };

  const renderStudents = () => {
    const batches = [
      "All batches",
      ...Array.from(
        new Set(students.map((s) => s.batch).filter((b): b is string => !!b)),
      ),
    ];

    const rows = students.filter(
      (student) =>
        batchFilter === "All batches" || student.batch === batchFilter,
    );

    return (
      <DataSection
        title="Students"
        subtitle="Students at your institution."
        columns={studentColumns}
        rows={rows}
        rowKey={(student) => String(student.id)}
        searchText={(student) =>
          `${student.name} ${student.roll_no ?? ""} ${student.batch ?? ""}`
        }
        searchPlaceholder="Search by name or roll number"
        toolbar={
          <select
            className="filter-select"
            aria-label="Filter by batch"
            value={batchFilter}
            onChange={(event) => setBatchFilter(event.target.value)}
          >
            {batches.map((batch) => (
              <option key={batch}>{batch}</option>
            ))}
          </select>
        }
      />
    );
  };

  const renderResults = () => {
    const subjects = [
      "All subjects",
      ...Array.from(new Set(results.map((r) => r.subject))),
    ];

    const rows = results.filter(
      (row) =>
        subjectFilter === "All subjects" || row.subject === subjectFilter,
    );

    return (
      <DataSection
        title="Results"
        subtitle="Scores from completed vivas. Under 65% is flagged for review."
        columns={resultColumns}
        rows={rows}
        rowKey={(row) => String(row.id)}
        searchText={(row) => `${row.student_name} ${row.subject}`}
        searchPlaceholder="Search by student or subject"
        toolbar={
          <select
            className="filter-select"
            aria-label="Filter by subject"
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
          >
            {subjects.map((subject) => (
              <option key={subject}>{subject}</option>
            ))}
          </select>
        }
      />
    );
  };

  const renderRecordDetail = (record: RecordDetail) => (
    <>
      <button
        type="button"
        className="back-link"
        onClick={() => setSelectedRecord(null)}
      >
        <ArrowLeft size={16} />
        All viva records
      </button>

      <section className="dashboard-card record-header">
        <div>
          <h2>{record.student_name}</h2>
          <p>
            {record.subject} · {formatLongDate(record.date)} ·{" "}
            {record.duration}
          </p>

          <div className="record-actions">
            <button
              type="button"
              className="dashboard-secondary"
              onClick={() =>
                setToast(
                  "Recording playback will be available once recordings are connected.",
                )
              }
            >
              View Recording
            </button>

            <button
              type="button"
              className="dashboard-secondary"
              onClick={() =>
                setToast(
                  "Transcripts will be available once recordings are connected.",
                )
              }
            >
              View Transcript
            </button>
          </div>
        </div>

        <div className="record-overall">
          <span>Overall score</span>
          <strong>{record.overall}%</strong>
        </div>
      </section>

      <div className="dash-columns">
        <section className="dashboard-card">
          <div className="card-title-row">
            <h3>Performance breakdown</h3>
          </div>

          {record.metrics.map((metric) => (
            <ScoreBar
              key={metric.label}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </section>

        <section className="dashboard-card">
          <div className="card-title-row">
            <h3>Questions &amp; answers</h3>
          </div>

          {record.questions.map((item, index) => (
            <div className="qa-block" key={`${index}-${item.question}`}>
              <div className="qa-top">
                <span>Question {index + 1}</span>
                <Badge tone="info">
                  {item.score}/{item.max_score}
                </Badge>
              </div>

              <p className="qa-question">{item.question}</p>

              <span className="qa-label">Student answer</span>
              <p className="qa-answer">{item.answer}</p>
            </div>
          ))}
        </section>
      </div>
    </>
  );

  const renderRecords = () => {
    if (selectedRecord) return renderRecordDetail(selectedRecord);

    const columns: Column<ResultRow>[] = [
      ...resultColumns.slice(0, 3),
      { key: "duration", header: "Duration", render: (r) => r.duration },
      {
        key: "score",
        header: "Overall",
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

    return (
      <DataSection
        title="Viva Records"
        subtitle="Open a record to see scores and every question and answer."
        columns={columns}
        rows={results}
        rowKey={(row) => String(row.id)}
        searchText={(row) => `${row.student_name} ${row.subject}`}
        searchPlaceholder="Search by student or subject"
        onRowClick={(row) => void openRecord(row.id)}
      />
    );
  };

  const renderMaterials = () => {
    const columns: Column<MaterialRow>[] = [
      {
        key: "name",
        header: "File",
        render: (material) => (
          <div className="person-cell">
            <span className="file-chip">
              <FileText size={16} />
            </span>
            <div>
              <strong>{material.name}</strong>
              <small>{formatSize(material.size_bytes)}</small>
            </div>
          </div>
        ),
      },
      { key: "subject", header: "Subject", render: (m) => m.subject },
      {
        key: "uploaded",
        header: "Uploaded",
        render: (m) => formatDate(m.uploaded_at.slice(0, 10)),
      },
      {
        key: "remove",
        header: "",
        align: "right",
        render: (material) => (
          <button
            type="button"
            className="icon-button"
            aria-label={`Remove ${material.name}`}
            onClick={() => void handleDeleteMaterial(material)}
          >
            <Trash2 size={16} />
          </button>
        ),
      },
    ];

    return (
      <>
        <SectionHeading
          title="Study Material"
          subtitle="Notes and slides your AI examiner can use when generating questions."
        />

        <section className="dashboard-card material-upload">
          <div className="dashboard-field">
            <label htmlFor="material-subject">Subject</label>
            <select
              id="material-subject"
              className="field-control"
              value={materialSubject}
              onChange={(event) => setMaterialSubject(event.target.value)}
            >
              {scheduleOptions.subjects.map((subject) => (
                <option key={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="dashboard-continue"
            onClick={() => materialInputRef.current?.click()}
          >
            <Upload size={18} />
            Upload material
          </button>

          <input
            ref={materialInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="visually-hidden"
            onChange={(event) => void handleMaterialUpload(event)}
            tabIndex={-1}
            aria-hidden="true"
          />
        </section>

        <div className="dashboard-card table-card">
          <DataTable
            columns={columns}
            rows={materials}
            rowKey={(material) => String(material.id)}
            emptyText="No study material uploaded yet."
          />
        </div>
      </>
    );
  };

  const content: Record<Exclude<Tab, "profile">, () => React.ReactElement> =
    {
      dashboard: renderDashboard,
      schedule: renderSchedule,
      vivas: renderVivas,
      students: renderStudents,
      results: renderResults,
      records: renderRecords,
      materials: renderMaterials,
    };

  const showStatus = firstLoad || Boolean(error);

  return (
    <DashboardShell
      portalLabel="Teacher workspace"
      navItems={navItems}
      active={tab}
      onNavigate={(key) => goTo(key as Tab)}
      title={titles[tab]}
      photoStorageKey="elysian.teacher.photo"
      user={{
        name: me.name,
        email: me.email,
        subtitle: `${me.institutionShort} · Teacher`,
        roleLabel: "Teacher",
        details: [
          { label: "Institution", value: me.institution },
          { label: "Department", value: me.department },
          { label: "Teacher ID", value: me.teacherCode },
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

      {selectedViva && (
        <Modal
          title={selectedViva.subject}
          onClose={() => setSelectedViva(null)}
        >
          <dl className="detail-list">
            <div>
              <dt>Subject</dt>
              <dd>{selectedViva.subject}</dd>
            </div>
            <div>
              <dt>Batch</dt>
              <dd>
                {selectedViva.course} · {selectedViva.batch}
              </dd>
            </div>
            <div>
              <dt>Semester</dt>
              <dd>{selectedViva.semester}</dd>
            </div>
            <div>
              <dt>Teacher</dt>
              <dd>{selectedViva.teacher_name}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{formatLongDate(selectedViva.date)}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>
                {formatTime(selectedViva.time)} ·{" "}
                {selectedViva.duration_minutes} minutes
              </dd>
            </div>
            <div>
              <dt>Students</dt>
              <dd>{selectedViva.students}</dd>
            </div>
            <div>
              <dt>Study material</dt>
              <dd>{selectedViva.material_name ?? "None uploaded"}</dd>
            </div>
          </dl>

          <div className="modal-actions">
            <button
              type="button"
              className="dashboard-secondary danger-text"
              disabled={selectedViva.status === "Completed"}
              onClick={() => void handleCancelViva(selectedViva)}
            >
              Cancel Viva
            </button>

            <button
              type="button"
              className="dashboard-secondary"
              disabled={selectedViva.status === "Completed"}
              onClick={() => {
                setEditing(selectedViva);
                setSelectedViva(null);
                setTab("schedule");
              }}
            >
              Edit Viva
            </button>

            <button
              type="button"
              className="dashboard-continue"
              onClick={() => goTo("records")}
            >
              View Records
            </button>
          </div>
        </Modal>
      )}

      <Toast message={toast} onClose={() => setToast("")} />
    </DashboardShell>
  );
}
