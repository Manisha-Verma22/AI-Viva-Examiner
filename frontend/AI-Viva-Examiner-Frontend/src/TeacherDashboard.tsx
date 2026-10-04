import { useRef, useState, type FormEvent } from "react";
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
  Toast,
  getGreeting,
  scoreStatus,
  type Column,
  type Tone,
} from "./dashboardKit";
import {
  batchSize,
  formatDate,
  formatLongDate,
  formatTime,
  initialMaterials,
  initialTeacherVivas,
  scheduleOptions,
  teacherProfile,
  teacherRecords,
  teacherResults,
  teacherStudents,
  todayISO,
  type Material,
  type ResultRow,
  type Student,
  type TeacherViva,
  type VivaRecord,
  type VivaStatus,
} from "./mockData";

/* ---------------------------------------------------------
   Teacher dashboard (mock data - swap for API calls later)
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

const statusTone: Record<VivaStatus, Tone> = {
  Upcoming: "info",
  Scheduled: "neutral",
  Completed: "success",
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const FILE_PATTERN = /\.(pdf|doc|docx|txt)$/i;

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sortByWhen(a: TeacherViva, b: TeacherViva): number {
  return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
}

/* ----------------------------- Table columns ----------------------------- */

const studentColumns: Column<Student>[] = [
  {
    key: "student",
    header: "Student",
    render: (student) => (
      <div className="person-cell">
        <span className="avatar avatar-xs">{student.name.charAt(0)}</span>
        <div>
          <strong>{student.name}</strong>
          <small>{student.roll}</small>
        </div>
      </div>
    ),
  },
  { key: "batch", header: "Batch", render: (student) => student.batch },
  { key: "vivas", header: "Vivas", render: (student) => student.vivas },
  {
    key: "score",
    header: "Avg score",
    render: (student) => `${student.avgScore}%`,
  },
  {
    key: "status",
    header: "Status",
    render: (student) => {
      const status = scoreStatus(student.avgScore);
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
        <span className="avatar avatar-xs">{row.student.charAt(0)}</span>
        <strong>{row.student}</strong>
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
  material?: string;
  materialSize?: string;
};

function ScheduleForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: TeacherViva | null;
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
    String(initial?.duration ?? 20),
  );
  const [file, setFile] = useState<{ name: string; size: string } | null>(
    initial?.material ? { name: initial.material, size: "" } : null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    setFile({ name: chosen.name, size: formatSize(chosen.size) });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const next: Record<string, string> = {};

    if (!subject.trim()) next.subject = "Please enter the subject.";
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
      material: file?.name,
      materialSize: file?.size || undefined,
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
                  <FileText size={15} /> {file.name}
                  {file.size && ` · ${file.size}`}
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

        <button type="submit" className="dashboard-continue">
          {initial ? "Save changes" : "Schedule Viva"}
        </button>
      </div>
    </form>
  );
}

/* ----------------------------- Dashboard ----------------------------- */

export default function TeacherDashboard() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [vivas, setVivas] = useState<TeacherViva[]>(initialTeacherVivas);
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [editing, setEditing] = useState<TeacherViva | null>(null);
  const [selectedViva, setSelectedViva] = useState<TeacherViva | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<VivaRecord | null>(
    null,
  );
  const [vivaFilter, setVivaFilter] = useState<"All" | VivaStatus>("All");
  const [batchFilter, setBatchFilter] = useState("All batches");
  const [subjectFilter, setSubjectFilter] = useState("All subjects");
  const [materialSubject, setMaterialSubject] = useState(
    scheduleOptions.subjects[0],
  );
  const [toast, setToast] = useState("");

  const materialInputRef = useRef<HTMLInputElement>(null);

  const goTo = (next: Tab) => {
    setTab(next);
    setSelectedRecord(null);
    setSelectedViva(null);

    if (next !== "schedule") setEditing(null);
  };

  /* Derived numbers */
  const upcoming = vivas
    .filter((viva) => viva.status !== "Completed")
    .sort(sortByWhen);

  const averageScore = Math.round(
    teacherStudents.reduce((sum, student) => sum + student.avgScore, 0) /
      teacherStudents.length,
  );

  const reviewCount = teacherResults.filter(
    (result) => result.score < 65,
  ).length;

  /* Actions */
  const handleSchedule = (values: ScheduleValues) => {
    const { materialSize, ...details } = values;
    const status: VivaStatus =
      details.date === todayISO() ? "Upcoming" : "Scheduled";

    if (editing) {
      setVivas((current) =>
        current.map((viva) =>
          viva.id === editing.id
            ? {
                ...viva,
                ...details,
                material: details.material ?? viva.material,
                status,
              }
            : viva,
        ),
      );
      setToast("Viva updated.");
    } else {
      setVivas((current) => [
        {
          id: `v${Date.now()}`,
          ...details,
          students: batchSize(details.batch),
          status,
        },
        ...current,
      ]);
      setToast("Viva scheduled successfully.");
    }

    if (details.material && materialSize) {
      setMaterials((current) => [
        {
          id: `m${Date.now()}`,
          name: details.material as string,
          subject: details.subject,
          size: materialSize,
          uploaded: formatDate(todayISO()),
        },
        ...current,
      ]);
    }

    setEditing(null);
    setTab("vivas");
  };

  const handleMaterialUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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

    setMaterials((current) => [
      {
        id: `m${Date.now()}`,
        name: chosen.name,
        subject: materialSubject,
        size: formatSize(chosen.size),
        uploaded: formatDate(todayISO()),
      },
      ...current,
    ]);
    setToast("Study material uploaded.");
  };

  /* ----------------------------- Sections ----------------------------- */

  const renderDashboard = () => (
    <>
      <section className="dashboard-welcome">
        <div>
          <span className="welcome-tag">TEACHER PORTAL</span>

          <h1>
            {getGreeting()}, {teacherProfile.short}
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
        <StatCard
          icon={Users}
          label="Students"
          value={teacherStudents.length}
        />
        <StatCard
          icon={Star}
          label="Average score"
          value={`${averageScore}%`}
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
                  {viva.duration} min
                </small>
              </div>
            </div>
          ))}
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
          rows={teacherResults.slice(0, 5)}
          rowKey={(row) => row.id}
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
        onSubmit={handleSchedule}
        onCancel={() => {
          const wasEditing = Boolean(editing);
          setEditing(null);
          setTab(wasEditing ? "vivas" : "dashboard");
        }}
      />
    </>
  );

  const renderVivas = () => {
    const filtered = vivas
      .filter((viva) => vivaFilter === "All" || viva.status === vivaFilter)
      .sort(sortByWhen);

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
                  <Badge tone={statusTone[viva.status]}>
                    {viva.status}
                  </Badge>
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
      ...Array.from(new Set(teacherStudents.map((s) => s.batch))),
    ];

    const rows = teacherStudents.filter(
      (student) =>
        batchFilter === "All batches" || student.batch === batchFilter,
    );

    return (
      <DataSection
        title="Students"
        subtitle="Students in the batches you teach."
        columns={studentColumns}
        rows={rows}
        rowKey={(student) => student.id}
        searchText={(student) =>
          `${student.name} ${student.roll} ${student.batch}`
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
      ...Array.from(new Set(teacherResults.map((r) => r.subject))),
    ];

    const rows = teacherResults.filter(
      (row) =>
        subjectFilter === "All subjects" || row.subject === subjectFilter,
    );

    return (
      <DataSection
        title="Results"
        subtitle="Scores from completed vivas. Under 65% is flagged for review."
        columns={resultColumns}
        rows={rows}
        rowKey={(row) => row.id}
        searchText={(row) => `${row.student} ${row.subject}`}
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

  const renderRecordDetail = (record: VivaRecord) => (
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
          <h2>{record.student}</h2>
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
                  "Recording playback will be available once the AI pipeline is connected.",
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
                  "Transcripts will be available once the AI pipeline is connected.",
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
            <div className="qa-block" key={item.question}>
              <div className="qa-top">
                <span>Question {index + 1}</span>
                <Badge tone="info">
                  {item.score}/{item.max}
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

    const columns: Column<VivaRecord>[] = [
      {
        key: "student",
        header: "Student",
        render: (record) => (
          <div className="person-cell">
            <span className="avatar avatar-xs">
              {record.student.charAt(0)}
            </span>
            <strong>{record.student}</strong>
          </div>
        ),
      },
      { key: "subject", header: "Subject", render: (r) => r.subject },
      { key: "date", header: "Date", render: (r) => formatDate(r.date) },
      { key: "duration", header: "Duration", render: (r) => r.duration },
      {
        key: "score",
        header: "Overall",
        render: (r) => {
          const status = scoreStatus(r.overall);
          return (
            <Badge tone={status.tone}>
              {r.overall}% · {status.label}
            </Badge>
          );
        },
      },
    ];

    return (
      <DataSection
        title="Viva Records"
        subtitle="Open a record to see scores, answers, the recording and transcript."
        columns={columns}
        rows={teacherRecords}
        rowKey={(record) => record.id}
        searchText={(record) => `${record.student} ${record.subject}`}
        searchPlaceholder="Search by student or subject"
        onRowClick={setSelectedRecord}
      />
    );
  };

  const renderMaterials = () => {
    const columns: Column<Material>[] = [
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
              <small>{material.size}</small>
            </div>
          </div>
        ),
      },
      { key: "subject", header: "Subject", render: (m) => m.subject },
      { key: "uploaded", header: "Uploaded", render: (m) => m.uploaded },
      {
        key: "remove",
        header: "",
        align: "right",
        render: (material) => (
          <button
            type="button"
            className="icon-button"
            aria-label={`Remove ${material.name}`}
            onClick={() => {
              setMaterials((current) =>
                current.filter((item) => item.id !== material.id),
              );
              setToast("Study material removed.");
            }}
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
            onChange={handleMaterialUpload}
            tabIndex={-1}
            aria-hidden="true"
          />
        </section>

        <div className="dashboard-card table-card">
          <DataTable
            columns={columns}
            rows={materials}
            rowKey={(material) => material.id}
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

  return (
    <DashboardShell
      portalLabel="Teacher workspace"
      navItems={navItems}
      active={tab}
      onNavigate={(key) => goTo(key as Tab)}
      title={titles[tab]}
      photoStorageKey="elysian.teacher.photo"
      user={{
        name: teacherProfile.name,
        email: teacherProfile.email,
        subtitle: `${teacherProfile.institutionShort} · ${teacherProfile.departmentShort}`,
        roleLabel: "Teacher",
        details: [
          { label: "Institution", value: teacherProfile.institution },
          { label: "Department", value: teacherProfile.department },
          { label: "Teacher ID", value: teacherProfile.teacherId },
        ],
      }}
    >
      {tab !== "profile" && content[tab]()}

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
              <dd>{teacherProfile.name}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{formatLongDate(selectedViva.date)}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>
                {formatTime(selectedViva.time)} · {selectedViva.duration}{" "}
                minutes
              </dd>
            </div>
            <div>
              <dt>Students</dt>
              <dd>{selectedViva.students}</dd>
            </div>
            <div>
              <dt>Study material</dt>
              <dd>{selectedViva.material ?? "None uploaded"}</dd>
            </div>
          </dl>

          <div className="modal-actions">
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
              className="dashboard-secondary"
              onClick={() => goTo("students")}
            >
              View Students
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
