import { useEffect, useRef, useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ---------------------------------------------------------
   Shared building blocks for the Teacher and Admin dashboards
--------------------------------------------------------- */

export type Tone = "success" | "info" | "warn" | "neutral" | "danger";

export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function scoreStatus(score: number): { label: string; tone: Tone } {
  if (score >= 80) return { label: "Strong", tone: "success" };
  if (score >= 65) return { label: "Good", tone: "info" };
  return { label: "Review", tone: "warn" };
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="dashboard-card dashboard-stat">
      <div className="dashboard-stat-top">
        <div className="dashboard-stat-icon">
          <Icon size={20} />
        </div>

        {hint && <span className="stat-hint">{hint}</span>}
      </div>

      <div className="dashboard-stat-value">{value}</div>
      <div className="dashboard-stat-label">{label}</div>
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="dashboard-section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p className="section-sub">{subtitle}</p>}
      </div>

      {right}
    </div>
  );
}

export function ScoreBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="score-bar">
      <div className="score-bar-top">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>

      <div className="score-bar-track">
        <i style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/* ----------------------------- Tables ----------------------------- */

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyText = "Nothing to show yet.",
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyText?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="empty-state">
        <h3>{emptyText}</h3>
      </div>
    );
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={column.align === "right" ? "right" : ""}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={onRowClick ? "clickable" : ""}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === "Enter") onRowClick(row);
                    }
                  : undefined
              }
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={column.align === "right" ? "right" : ""}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* A full section: heading, search, optional filters and a table */
export function DataSection<T>({
  title,
  subtitle,
  columns,
  rows,
  rowKey,
  searchText,
  searchPlaceholder = "Search",
  toolbar,
  action,
  onRowClick,
  emptyText,
}: {
  title: string;
  subtitle?: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  searchText: (row: T) => string;
  searchPlaceholder?: string;
  toolbar?: ReactNode;
  action?: ReactNode;
  onRowClick?: (row: T) => void;
  emptyText?: string;
}) {
  const [query, setQuery] = useState("");

  const normalised = query.trim().toLowerCase();
  const filtered = normalised
    ? rows.filter((row) =>
        searchText(row).toLowerCase().includes(normalised),
      )
    : rows;

  return (
    <>
      <SectionHeading
        title={title}
        subtitle={subtitle}
        right={action}
      />

      <div className="dashboard-card table-card">
        <div className="table-toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
          </label>

          {toolbar}

          <span className="table-count">
            {filtered.length}{" "}
            {filtered.length === 1 ? "result" : "results"}
          </span>
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={rowKey}
          onRowClick={onRowClick}
          emptyText={emptyText}
        />
      </div>
    </>
  );
}

/* ----------------------------- Overlays ----------------------------- */

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };

    document.addEventListener("keydown", handleKey);

    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>

          <button
            type="button"
            className="modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => closeRef.current(), 3500);

    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div className="toast" role="status">
      {message}

      <button type="button" onClick={onClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
