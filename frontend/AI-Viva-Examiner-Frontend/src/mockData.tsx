/* ---------------------------------------------------------
   ELYSIAN - mock data for the Teacher and Admin dashboards.
   Every export here will be replaced by an API call later.
--------------------------------------------------------- */

/* ----------------------------- Helpers ----------------------------- */

export function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export function formatLongDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/* ----------------------------- Shared types ----------------------------- */

export type VivaStatus = "Upcoming" | "Scheduled" | "Completed";

export type TeacherViva = {
  id: string;
  subject: string;
  department: string;
  course: string;
  semester: string;
  batch: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm (24h)
  duration: number; // minutes
  students: number;
  status: VivaStatus;
  material?: string;
};

export type Student = {
  id: string;
  name: string;
  roll: string;
  batch: string;
  department: string;
  vivas: number;
  avgScore: number;
};

export type ResultRow = {
  id: string;
  student: string;
  subject: string;
  score: number;
  date: string;
};

export type VivaQuestion = {
  question: string;
  answer: string;
  score: number;
  max: number;
};

export type VivaRecord = {
  id: string;
  student: string;
  subject: string;
  date: string;
  duration: string;
  overall: number;
  metrics: { label: string; value: number }[];
  questions: VivaQuestion[];
};

export type Material = {
  id: string;
  name: string;
  subject: string;
  size: string;
  uploaded: string;
};

/* ----------------------------- Teacher ----------------------------- */

export const teacherProfile = {
  name: "Dr. Ankit Sharma",
  short: "Dr. Sharma",
  email: "teacher@college.edu",
  institution: "National Institute of Technology Sikkim",
  institutionShort: "NIT Sikkim",
  department: "Computer Science and Engineering",
  departmentShort: "CSE",
  teacherId: "NITS-T-1042",
};

export const scheduleOptions = {
  subjects: [
    "Data Structures",
    "DBMS",
    "Operating Systems",
    "Computer Networks",
    "Algorithms",
  ],
  departments: [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Mechanical Engineering",
  ],
  courses: ["B.Tech CSE", "B.Tech IT", "B.Tech ECE", "M.Tech CSE"],
  semesters: [
    "1st Semester",
    "2nd Semester",
    "3rd Semester",
    "4th Semester",
    "5th Semester",
    "6th Semester",
    "7th Semester",
    "8th Semester",
  ],
  batches: ["2022–2026", "2023–2027", "2024–2028", "2025–2029"],
  durations: [10, 15, 20, 30, 45, 60],
};

export function batchSize(batch: string): number {
  const sizes: Record<string, number> = {
    "2022–2026": 28,
    "2023–2027": 30,
    "2024–2028": 32,
    "2025–2029": 34,
  };

  return sizes[batch] ?? 30;
}

export const initialTeacherVivas: TeacherViva[] = [
  {
    id: "v1",
    subject: "Data Structures",
    department: "Computer Science & Engineering",
    course: "B.Tech CSE",
    semester: "4th Semester",
    batch: "2024–2028",
    date: "2026-10-04",
    time: "15:00",
    duration: 20,
    students: 32,
    status: "Upcoming",
    material: "DSA-Unit-3-Notes.pdf",
  },
  {
    id: "v2",
    subject: "DBMS",
    department: "Computer Science & Engineering",
    course: "B.Tech CSE",
    semester: "4th Semester",
    batch: "2024–2028",
    date: "2026-10-06",
    time: "11:00",
    duration: 20,
    students: 28,
    status: "Scheduled",
  },
  {
    id: "v3",
    subject: "Operating Systems",
    department: "Computer Science & Engineering",
    course: "B.Tech CSE",
    semester: "6th Semester",
    batch: "2023–2027",
    date: "2026-10-08",
    time: "14:00",
    duration: 30,
    students: 30,
    status: "Scheduled",
  },
  {
    id: "v4",
    subject: "Computer Networks",
    department: "Computer Science & Engineering",
    course: "B.Tech CSE",
    semester: "6th Semester",
    batch: "2023–2027",
    date: "2026-09-28",
    time: "10:00",
    duration: 20,
    students: 30,
    status: "Completed",
  },
];

export const teacherStudents: Student[] = [
  { id: "s1", name: "Aarav Sharma", roll: "24CS101", batch: "2024–2028", department: "CSE", vivas: 6, avgScore: 88 },
  { id: "s2", name: "Priya Nair", roll: "24CS102", batch: "2024–2028", department: "CSE", vivas: 6, avgScore: 81 },
  { id: "s3", name: "Rohan Gupta", roll: "24CS103", batch: "2024–2028", department: "CSE", vivas: 5, avgScore: 72 },
  { id: "s4", name: "Ananya Das", roll: "24CS104", batch: "2024–2028", department: "CSE", vivas: 6, avgScore: 64 },
  { id: "s5", name: "Karan Singh", roll: "24CS105", batch: "2024–2028", department: "CSE", vivas: 5, avgScore: 77 },
  { id: "s6", name: "Sneha Rai", roll: "24CS106", batch: "2024–2028", department: "CSE", vivas: 6, avgScore: 91 },
  { id: "s7", name: "Tenzin Bhutia", roll: "23CS207", batch: "2023–2027", department: "CSE", vivas: 8, avgScore: 69 },
  { id: "s8", name: "Vikram Rathore", roll: "23CS208", batch: "2023–2027", department: "CSE", vivas: 8, avgScore: 83 },
  { id: "s9", name: "Isha Thapa", roll: "23CS209", batch: "2023–2027", department: "CSE", vivas: 7, avgScore: 74 },
  { id: "s10", name: "Neha Pradhan", roll: "23CS210", batch: "2023–2027", department: "CSE", vivas: 8, avgScore: 61 },
];

export const teacherResults: ResultRow[] = [
  { id: "r1", student: "Aarav Sharma", subject: "Data Structures", score: 88, date: "2026-09-21" },
  { id: "r2", student: "Priya Nair", subject: "Data Structures", score: 81, date: "2026-09-21" },
  { id: "r3", student: "Rohan Gupta", subject: "DBMS", score: 72, date: "2026-09-24" },
  { id: "r4", student: "Ananya Das", subject: "DBMS", score: 64, date: "2026-09-24" },
  { id: "r5", student: "Sneha Rai", subject: "Data Structures", score: 91, date: "2026-09-21" },
  { id: "r6", student: "Vikram Rathore", subject: "Computer Networks", score: 83, date: "2026-09-28" },
  { id: "r7", student: "Tenzin Bhutia", subject: "Computer Networks", score: 69, date: "2026-09-28" },
  { id: "r8", student: "Neha Pradhan", subject: "Computer Networks", score: 61, date: "2026-09-28" },
];

export const teacherRecords: VivaRecord[] = [
  {
    id: "rec1",
    student: "Aarav Sharma",
    subject: "Data Structures",
    date: "2026-09-21",
    duration: "18:42",
    overall: 88,
    metrics: [
      { label: "Knowledge", value: 90 },
      { label: "Depth", value: 84 },
      { label: "Communication", value: 91 },
      { label: "Problem Solving", value: 87 },
    ],
    questions: [
      {
        question:
          "What is the difference between a stack and a queue, and when would you choose each?",
        answer:
          "A stack is last-in first-out, so I would use it for undo operations or expression evaluation. A queue is first-in first-out, which suits scheduling and breadth-first search.",
        score: 9,
        max: 10,
      },
      {
        question:
          "Explain how a balanced binary search tree improves lookup time.",
        answer:
          "Balancing keeps the height close to log n, so search, insert and delete stay O(log n) instead of degrading to O(n) in a skewed tree.",
        score: 8,
        max: 10,
      },
    ],
  },
  {
    id: "rec2",
    student: "Rohan Gupta",
    subject: "DBMS",
    date: "2026-09-24",
    duration: "16:10",
    overall: 72,
    metrics: [
      { label: "Knowledge", value: 74 },
      { label: "Depth", value: 66 },
      { label: "Communication", value: 78 },
      { label: "Problem Solving", value: 70 },
    ],
    questions: [
      {
        question: "What does normalisation achieve in a relational database?",
        answer:
          "It reduces redundancy by splitting tables so each fact is stored once, which avoids update anomalies.",
        score: 8,
        max: 10,
      },
      {
        question: "Explain the difference between 2NF and 3NF.",
        answer:
          "2NF removes partial dependencies on part of a key. I am not fully sure about 3NF, I think it removes some other dependency.",
        score: 5,
        max: 10,
      },
    ],
  },
  {
    id: "rec3",
    student: "Ananya Das",
    subject: "DBMS",
    date: "2026-09-24",
    duration: "14:55",
    overall: 64,
    metrics: [
      { label: "Knowledge", value: 62 },
      { label: "Depth", value: 58 },
      { label: "Communication", value: 72 },
      { label: "Problem Solving", value: 63 },
    ],
    questions: [
      {
        question: "What is a transaction and what are the ACID properties?",
        answer:
          "A transaction is a unit of work. ACID stands for atomicity, consistency, isolation and durability.",
        score: 7,
        max: 10,
      },
      {
        question: "How does indexing speed up queries?",
        answer:
          "It stores keys in a sorted structure so the database does not have to scan the whole table.",
        score: 6,
        max: 10,
      },
    ],
  },
];

export const initialMaterials: Material[] = [
  {
    id: "m1",
    name: "DSA-Unit-3-Notes.pdf",
    subject: "Data Structures",
    size: "1.8 MB",
    uploaded: "30 Sep",
  },
  {
    id: "m2",
    name: "DBMS-Normalisation.docx",
    subject: "DBMS",
    size: "640 KB",
    uploaded: "28 Sep",
  },
  {
    id: "m3",
    name: "OS-Scheduling-Cheatsheet.txt",
    subject: "Operating Systems",
    size: "42 KB",
    uploaded: "25 Sep",
  },
];

/* ----------------------------- Admin ----------------------------- */

export const adminProfile = {
  name: "Dr. Meera Pradhan",
  short: "Dr. Pradhan",
  email: "admin@nitsikkim.edu",
  institution: "National Institute of Technology Sikkim",
  institutionShort: "NIT Sikkim",
  role: "Institution Administrator",
  adminId: "NITS-A-001",
};

export type PendingApproval = {
  id: string;
  name: string;
  detail: string;
  extra: string;
};

export const initialPendingTeachers: PendingApproval[] = [
  {
    id: "pt1",
    name: "Dr. Rahul Mehta",
    detail: "Computer Science",
    extra: "Teacher ID NITS-T-2108",
  },
  {
    id: "pt2",
    name: "Priya Sharma",
    detail: "Information Technology",
    extra: "Teacher ID NITS-T-2111",
  },
];

export const initialPendingStudents: PendingApproval[] = [
  {
    id: "ps1",
    name: "Manisha Verma",
    detail: "B.Tech CSE",
    extra: "Batch 2024–2028",
  },
  {
    id: "ps2",
    name: "Dev Chhetri",
    detail: "B.Tech ECE",
    extra: "Batch 2025–2029",
  },
  {
    id: "ps3",
    name: "Pooja Subba",
    detail: "B.Tech IT",
    extra: "Batch 2024–2028",
  },
];

export type Teacher = {
  id: string;
  name: string;
  email: string;
  department: string;
  teacherId: string;
  vivas: number;
};

export const initialTeachers: Teacher[] = [
  { id: "t1", name: "Dr. Ankit Sharma", email: "ankit.sharma@nitsikkim.edu", department: "Computer Science", teacherId: "NITS-T-1042", vivas: 12 },
  { id: "t2", name: "Dr. Sunita Rai", email: "sunita.rai@nitsikkim.edu", department: "Information Technology", teacherId: "NITS-T-1057", vivas: 9 },
  { id: "t3", name: "Prof. Lakpa Sherpa", email: "lakpa.sherpa@nitsikkim.edu", department: "Electronics & Communication", teacherId: "NITS-T-1063", vivas: 7 },
  { id: "t4", name: "Dr. Kavita Joshi", email: "kavita.joshi@nitsikkim.edu", department: "Mechanical Engineering", teacherId: "NITS-T-1079", vivas: 4 },
];

export type AdminStudent = Student & { course: string };

export const initialAdminStudents: AdminStudent[] = [
  { id: "as1", name: "Aarav Sharma", roll: "24CS101", batch: "2024–2028", department: "CSE", course: "B.Tech CSE", vivas: 6, avgScore: 88 },
  { id: "as2", name: "Priya Nair", roll: "24CS102", batch: "2024–2028", department: "CSE", course: "B.Tech CSE", vivas: 6, avgScore: 81 },
  { id: "as3", name: "Tenzin Bhutia", roll: "23CS207", batch: "2023–2027", department: "CSE", course: "B.Tech CSE", vivas: 8, avgScore: 69 },
  { id: "as4", name: "Riya Gurung", roll: "24IT021", batch: "2024–2028", department: "IT", course: "B.Tech IT", vivas: 4, avgScore: 76 },
  { id: "as5", name: "Sagar Lama", roll: "23EC115", batch: "2023–2027", department: "ECE", course: "B.Tech ECE", vivas: 5, avgScore: 70 },
];

export const departmentRows = [
  { id: "d1", name: "Computer Science & Engineering", head: "Dr. Ankit Sharma", teachers: 14, students: 420 },
  { id: "d2", name: "Information Technology", head: "Dr. Sunita Rai", teachers: 9, students: 260 },
  { id: "d3", name: "Electronics & Communication", head: "Prof. Lakpa Sherpa", teachers: 11, students: 310 },
  { id: "d4", name: "Mechanical Engineering", head: "Dr. Kavita Joshi", teachers: 10, students: 280 },
];

export const courseRows = [
  { id: "c1", name: "B.Tech CSE", department: "Computer Science & Engineering", duration: "4 years", students: 420 },
  { id: "c2", name: "B.Tech IT", department: "Information Technology", duration: "4 years", students: 260 },
  { id: "c3", name: "B.Tech ECE", department: "Electronics & Communication", duration: "4 years", students: 310 },
  { id: "c4", name: "M.Tech CSE", department: "Computer Science & Engineering", duration: "2 years", students: 48 },
];

export const subjectRows = [
  { id: "sub1", name: "Data Structures", code: "CS201", department: "Computer Science & Engineering", semester: "4th Semester" },
  { id: "sub2", name: "DBMS", code: "CS204", department: "Computer Science & Engineering", semester: "4th Semester" },
  { id: "sub3", name: "Operating Systems", code: "CS301", department: "Computer Science & Engineering", semester: "6th Semester" },
  { id: "sub4", name: "Computer Networks", code: "IT302", department: "Information Technology", semester: "6th Semester" },
  { id: "sub5", name: "Digital Electronics", code: "EC202", department: "Electronics & Communication", semester: "3rd Semester" },
];

export const batchRows = [
  { id: "b1", name: "2022–2026", course: "B.Tech (all)", students: 280, status: "Final year" },
  { id: "b2", name: "2023–2027", course: "B.Tech (all)", students: 305, status: "Active" },
  { id: "b3", name: "2024–2028", course: "B.Tech (all)", students: 330, status: "Active" },
  { id: "b4", name: "2025–2029", course: "B.Tech (all)", students: 355, status: "Active" },
];

export const adminVivaRows = [
  { id: "av1", subject: "Data Structures", teacher: "Dr. Ankit Sharma", batch: "2024–2028", date: "2026-10-04", time: "15:00", students: 32, status: "Upcoming" as VivaStatus },
  { id: "av2", subject: "DBMS", teacher: "Dr. Ankit Sharma", batch: "2024–2028", date: "2026-10-06", time: "11:00", students: 28, status: "Scheduled" as VivaStatus },
  { id: "av3", subject: "Computer Networks", teacher: "Dr. Sunita Rai", batch: "2023–2027", date: "2026-10-07", time: "10:00", students: 30, status: "Scheduled" as VivaStatus },
  { id: "av4", subject: "Operating Systems", teacher: "Dr. Ankit Sharma", batch: "2023–2027", date: "2026-10-08", time: "14:00", students: 30, status: "Scheduled" as VivaStatus },
  { id: "av5", subject: "Digital Electronics", teacher: "Prof. Lakpa Sherpa", batch: "2024–2028", date: "2026-09-26", time: "11:30", students: 34, status: "Completed" as VivaStatus },
];

export const adminRecordRows = [
  { id: "ar1", student: "Aarav Sharma", subject: "Data Structures", teacher: "Dr. Ankit Sharma", date: "2026-09-21", score: 88 },
  { id: "ar2", student: "Rohan Gupta", subject: "DBMS", teacher: "Dr. Ankit Sharma", date: "2026-09-24", score: 72 },
  { id: "ar3", student: "Riya Gurung", subject: "Computer Networks", teacher: "Dr. Sunita Rai", date: "2026-09-25", score: 76 },
  { id: "ar4", student: "Sagar Lama", subject: "Digital Electronics", teacher: "Prof. Lakpa Sherpa", date: "2026-09-26", score: 70 },
];

export const adminActivity = [
  { id: "ac1", title: "New teacher registration", detail: "Dr. Rahul Mehta is waiting for approval", time: "10 min ago" },
  { id: "ac2", title: "Viva scheduled", detail: "DBMS for batch 2024–2028 on 06 Oct", time: "1 hr ago" },
  { id: "ac3", title: "Viva completed", detail: "Digital Electronics, 34 students assessed", time: "Yesterday" },
  { id: "ac4", title: "New student registration", detail: "Manisha Verma is waiting for approval", time: "Yesterday" },
];

export const institutionSettings = {
  name: "National Institute of Technology Sikkim",
  code: "NITS",
  email: "admin@nitsikkim.edu",
  location: "Ravangla, Sikkim",
  timezone: "Asia/Kolkata (IST)",
};
