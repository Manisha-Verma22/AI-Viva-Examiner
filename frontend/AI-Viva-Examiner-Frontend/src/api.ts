/* ---------------------------------------------------------
   ELYSIAN API client
   - talks to the FastAPI backend
   - keeps the login token and signed-in user in localStorage
--------------------------------------------------------- */

export type Role = "student" | "teacher" | "admin";

export type SessionUser = {
  id: number;
  role: Role;
  status: string;
  name: string;
  email: string;
  institution_id: number;
  institution_name: string;
  institution_short: string;
  department: string | null;
  course: string | null;
  batch: string | null;
  roll_no: string | null;
  teacher_code: string | null;
};

export type Institution = {
  id: number;
  name: string;
  short_name: string;
  code: string;
  location: string;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
  user: SessionUser;
};

type MessageResponse = { message: string };

const env = (
  import.meta as unknown as { env?: Record<string, string | undefined> }
).env;

export const API_URL = (env?.VITE_API_URL ?? "http://localhost:8000").replace(
  /\/$/,
  "",
);

const TOKEN_KEY = "elysian.token";
const USER_KEY = "elysian.user";

/* ----------------------------- Session ----------------------------- */

function tokenIsExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(json) as { exp?: number };

    return typeof exp === "number" && exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function saveSession(token: string, user: SessionUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) return null;

  if (tokenIsExpired(token)) {
    clearSession();
    return null;
  }

  return token;
}

export function getUser(): SessionUser | null {
  if (!getToken()) return null;

  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function dashboardPath(role: Role): string {
  return `/${role}`;
}

/* "Dr. Ankit Sharma" -> "Dr. Sharma",  "Manisha Verma" -> "Manisha" */
export function shortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const title = /^(dr|prof)\.?$/i.test(parts[0]);

  if (title && parts.length > 1) {
    return `${parts[0]} ${parts[parts.length - 1]}`;
  }

  return parts[0] ?? fullName;
}

/* ----------------------------- Requests ----------------------------- */

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: unknown };
    const detail = data.detail;

    if (typeof detail === "string") return detail;

    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { loc?: unknown[]; msg?: string };
      const field = Array.isArray(first.loc)
        ? String(first.loc[first.loc.length - 1])
        : "";
      const message = (first.msg ?? "Invalid value").replace(
        /^Value error, /,
        "",
      );

      return field ? `${field}: ${message}` : message;
    }
  } catch {
    /* fall through */
  }

  return `Request failed (${response.status}).`;
}

type RequestOptions = {
  method?: string;
  json?: unknown;
  form?: FormData;
  auth?: boolean;
};

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();

  if (options.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;

  if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  } else if (options.form) {
    body = options.form;
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body,
    });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the server. Make sure the backend is running.",
    );
  }

  if (!response.ok) {
    if (response.status === 401 && token) clearSession();

    throw new ApiError(response.status, await readError(response));
  }

  return (await response.json()) as T;
}

/* ----------------------------- Data types ----------------------------- */

export type VivaStatus = "Upcoming" | "Scheduled" | "Completed" | "Cancelled";

export type Viva = {
  id: number;
  subject: string;
  department: string;
  course: string;
  semester: string;
  batch: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:MM
  duration_minutes: number;
  status: VivaStatus;
  students: number;
  teacher_name: string;
  material_name: string | null;
};

export type VivaInput = {
  subject: string;
  department: string;
  course: string;
  semester: string;
  batch: string;
  date: string;
  time: string;
  duration_minutes: number;
  material_id: number | null;
};

export type StudentRow = {
  id: number;
  name: string;
  email: string;
  roll_no: string | null;
  course: string | null;
  batch: string | null;
  vivas: number;
  avg_score: number;
};

export type TeacherRow = {
  id: number;
  name: string;
  email: string;
  department: string | null;
  teacher_code: string | null;
  vivas: number;
};

export type PendingPerson = {
  id: number;
  name: string;
  email: string;
  detail: string;
  extra: string;
};

export type Approvals = {
  teachers: PendingPerson[];
  students: PendingPerson[];
};

export type Summary = {
  students: number;
  teachers: number;
  vivas: number;
  pending_approvals: number;
};

export type ResultRow = {
  id: number;
  student_name: string;
  subject: string;
  date: string;
  duration: string;
  score: number;
};

export type RecordDetail = {
  id: number;
  student_name: string;
  subject: string;
  date: string;
  duration: string;
  overall: number;
  metrics: { label: string; value: number }[];
  questions: {
    question: string;
    answer: string;
    score: number;
    max_score: number;
  }[];
};

export type MaterialRow = {
  id: number;
  name: string;
  subject: string;
  size_bytes: number;
  uploaded_at: string;
};

export type InstitutionSettings = {
  name: string;
  code: string;
  contact_email: string;
  location: string;
  timezone: string;
};

export type DepartmentRow = { name: string; teachers: number; vivas: number };
export type CourseRow = { name: string; students: number; vivas: number };
export type SubjectRow = {
  name: string;
  department: string;
  semester: string;
  vivas: number;
};
export type BatchRow = { name: string; students: number; vivas: number };

/* ----------------------------- Endpoints ----------------------------- */

export const api = {
  institutions: () =>
    request<Institution[]>("/api/institutions", { auth: false }),

  login: (payload: {
    email: string;
    password: string;
    institution_id: number;
    role: Role;
  }) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      json: payload,
      auth: false,
    }),

  registerTeacher: (payload: {
    name: string;
    email: string;
    password: string;
    institution_id: number;
    department: string;
    teacher_code: string;
  }) =>
    request<MessageResponse>("/api/auth/register/teacher", {
      method: "POST",
      json: payload,
      auth: false,
    }),

  registerStudent: (payload: {
    name: string;
    email: string;
    password: string;
    institution_id: number;
    course: string;
    batch: string;
    roll_no: string;
  }) =>
    request<MessageResponse>("/api/auth/register/student", {
      method: "POST",
      json: payload,
      auth: false,
    }),

  me: () => request<SessionUser>("/api/auth/me"),

  teacher: {
    vivas: () => request<Viva[]>("/api/teacher/vivas"),
    createViva: (input: VivaInput) =>
      request<Viva>("/api/teacher/vivas", { method: "POST", json: input }),
    updateViva: (id: number, input: VivaInput) =>
      request<Viva>(`/api/teacher/vivas/${id}`, {
        method: "PUT",
        json: input,
      }),
    cancelViva: (id: number) =>
      request<MessageResponse>(`/api/teacher/vivas/${id}`, {
        method: "DELETE",
      }),
    students: () => request<StudentRow[]>("/api/teacher/students"),
    results: () => request<ResultRow[]>("/api/teacher/results"),
    record: (id: number) =>
      request<RecordDetail>(`/api/teacher/records/${id}`),
    materials: () => request<MaterialRow[]>("/api/teacher/materials"),
    uploadMaterial: (file: File, subject: string) => {
      const form = new FormData();
      form.append("subject", subject);
      form.append("file", file);

      return request<MaterialRow>("/api/teacher/materials", {
        method: "POST",
        form,
      });
    },
    deleteMaterial: (id: number) =>
      request<MessageResponse>(`/api/teacher/materials/${id}`, {
        method: "DELETE",
      }),
  },

  admin: {
    summary: () => request<Summary>("/api/admin/summary"),
    approvals: () => request<Approvals>("/api/admin/approvals"),
    approve: (id: number) =>
      request<MessageResponse>(`/api/admin/users/${id}/approve`, {
        method: "POST",
      }),
    reject: (id: number) =>
      request<MessageResponse>(`/api/admin/users/${id}/reject`, {
        method: "POST",
      }),
    teachers: () => request<TeacherRow[]>("/api/admin/teachers"),
    students: () => request<StudentRow[]>("/api/admin/students"),
    vivas: () => request<Viva[]>("/api/admin/vivas"),
    results: () => request<ResultRow[]>("/api/admin/results"),
    departments: () => request<DepartmentRow[]>("/api/admin/departments"),
    courses: () => request<CourseRow[]>("/api/admin/courses"),
    subjects: () => request<SubjectRow[]>("/api/admin/subjects"),
    batches: () => request<BatchRow[]>("/api/admin/batches"),
    institution: () =>
      request<InstitutionSettings>("/api/admin/institution"),
    updateInstitution: (data: InstitutionSettings) =>
      request<InstitutionSettings>("/api/admin/institution", {
        method: "PUT",
        json: data,
      }),
  },

  student: {
    vivas: () => request<Viva[]>("/api/student/vivas"),
    results: () => request<ResultRow[]>("/api/student/results"),
  },
};

export function messageOf(err: unknown): string {
  return err instanceof ApiError
    ? err.message
    : "Something went wrong. Please try again.";
}
