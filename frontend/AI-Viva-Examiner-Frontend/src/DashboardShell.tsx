import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  ChevronDown,
  LogOut,
  Mail,
  Settings,
  Trash2,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import ElysianMark from "./ElysianMark";

/* ---------------------------------------------------------
   Shared layout for the Teacher and Admin dashboards:
   sidebar, header, profile menu with photo upload, and the
   full profile page (shown when active === "profile").
--------------------------------------------------------- */

export type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
};

export type ProfileDetail = {
  label: string;
  value: string;
};

type ShellProps = {
  portalLabel: string;
  navItems: NavItem[];
  active: string;
  onNavigate: (key: string) => void;
  title: string;
  user: {
    name: string;
    email: string;
    subtitle: string;
    roleLabel: string;
    details: ProfileDetail[];
  };
  photoStorageKey: string;
  children: ReactNode;
};

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

function Avatar({
  photo,
  initial,
  className,
}: {
  photo: string | null;
  initial: string;
  className: string;
}) {
  return (
    <span className={`avatar ${className}`}>
      {photo ? <img src={photo} alt="Profile" /> : initial}
    </span>
  );
}

export default function DashboardShell({
  portalLabel,
  navItems,
  active,
  onNavigate,
  title,
  user,
  photoStorageKey,
  children,
}: ShellProps) {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(() => {
    try {
      return localStorage.getItem(photoStorageKey);
    } catch {
      return null;
    }
  });
  const [photoError, setPhotoError] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initial = user.name
    .replace(/^(Dr|Prof)\.?\s+/i, "")
    .charAt(0)
    .toUpperCase();

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
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  const goTo = (key: string) => {
    onNavigate(key);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  const signOut = () => navigate("/");
  const openPhotoPicker = () => fileInputRef.current?.click();

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file (JPG, PNG or WebP).");
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Image must be smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") return;

      setPhoto(reader.result);
      setPhotoError("");

      try {
        localStorage.setItem(photoStorageKey, reader.result);
      } catch {
        setPhotoError(
          "Photo applied, but it could not be saved on this device.",
        );
      }
    };

    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoError("");

    try {
      localStorage.removeItem(photoStorageKey);
    } catch {
      /* ignore */
    }
  };

  const photoActions = (
    <>
      <div className="profile-photo-actions">
        <button type="button" onClick={openPhotoPicker}>
          <Camera size={14} />
          {photo ? "Change photo" : "Upload photo"}
        </button>

        {photo && (
          <button type="button" className="muted" onClick={removePhoto}>
            <Trash2 size={14} />
            Remove
          </button>
        )}
      </div>

      {photoError && <p className="profile-photo-error">{photoError}</p>}
    </>
  );

  const profileFields: ProfileDetail[] = [
    { label: "Full name", value: user.name },
    { label: "Email address", value: user.email },
    ...user.details,
  ];

  const profilePage = (
    <>
      <section className="dashboard-card profile-hero">
        <div className="profile-photo-wrap">
          <Avatar photo={photo} initial={initial} className="avatar-lg" />

          <button
            type="button"
            className="profile-photo-edit"
            aria-label="Change profile photo"
            onClick={openPhotoPicker}
          >
            <Camera size={15} />
          </button>
        </div>

        <div className="profile-hero-text">
          <h1>{user.name}</h1>
          <p>{user.subtitle}</p>
          <span className="profile-role">{user.roleLabel}</span>
        </div>

        <div className="profile-hero-actions">{photoActions}</div>
      </section>

      <section className="dashboard-card">
        <div className="card-heading">
          <div className="card-icon">
            <User size={20} />
          </div>
          <h3>Account details</h3>
        </div>

        <div className="academic-fields">
          {profileFields.map((field, index) => (
            <div className="dashboard-field" key={field.label}>
              <label htmlFor={`profile-field-${index}`}>
                {field.label}
              </label>
              <input
                id={`profile-field-${index}`}
                className="field-control"
                value={field.value}
                readOnly
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );

  return (
    <div className="dashboard dashboard-dense">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="visually-hidden"
        onChange={handlePhotoChange}
        tabIndex={-1}
        aria-hidden="true"
      />

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

        <p className="sidebar-label">{portalLabel}</p>

        <nav className="sidebar-nav" aria-label={portalLabel}>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                className={`sidebar-link ${
                  active === item.key ? "active" : ""
                }`}
                aria-current={active === item.key ? "page" : undefined}
                onClick={() => goTo(item.key)}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom sidebar-bottom-stack">
          <button
            type="button"
            className={`sidebar-link ${
              active === "profile" ? "active" : ""
            }`}
            onClick={() => goTo("profile")}
          >
            <Settings size={19} />
            Profile &amp; Settings
          </button>

          <button type="button" className="sidebar-link" onClick={signOut}>
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-inner">
          <header className="dashboard-header">
            <h2 className="dashboard-title">{title}</h2>

            <div className="profile-menu" ref={menuRef}>
              <button
                type="button"
                className={`profile-trigger ${menuOpen ? "open" : ""}`}
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                aria-label="Open profile"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <Avatar
                  photo={photo}
                  initial={initial}
                  className="avatar-sm"
                />

                <span className="profile-trigger-name">
                  {user.name}
                  <ChevronDown size={14} />
                </span>

                <small>{user.subtitle}</small>
              </button>

              {menuOpen && (
                <div
                  className="profile-popover"
                  role="dialog"
                  aria-label="Profile"
                >
                  <div className="profile-popover-top">
                    <div className="profile-photo-wrap">
                      <Avatar
                        photo={photo}
                        initial={initial}
                        className="avatar-md"
                      />

                      <button
                        type="button"
                        className="profile-photo-edit"
                        aria-label="Change profile photo"
                        onClick={openPhotoPicker}
                      >
                        <Camera size={14} />
                      </button>
                    </div>

                    <strong>{user.name}</strong>

                    <small>
                      <Mail size={12} />
                      {user.email}
                    </small>

                    {photoActions}
                  </div>

                  <dl className="profile-info">
                    {user.details.slice(0, 3).map((detail) => (
                      <div key={detail.label}>
                        <dt>{detail.label}</dt>
                        <dd>{detail.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="profile-popover-actions">
                    <button
                      type="button"
                      className="profile-menu-item"
                      onClick={() => goTo("profile")}
                    >
                      <User size={17} />
                      View full profile
                    </button>

                    <button
                      type="button"
                      className="profile-menu-item danger"
                      onClick={signOut}
                    >
                      <LogOut size={17} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>

          {active === "profile" ? profilePage : children}
        </div>
      </main>
    </div>
  );
}
