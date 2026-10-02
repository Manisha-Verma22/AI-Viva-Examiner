import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Building2,
  ChevronDown,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  UploadCloud,
  X,
  ClipboardList,
  BarChart3,
} from "lucide-react";

type InstitutionType = "school" | "college" | "";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [institutionType, setInstitutionType] =
    useState<InstitutionType>("");

  const [institution, setInstitution] = useState("");
  const [level, setLevel] = useState("");
  const [stream, setStream] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  const schoolSubjects: Record<string, string[]> = {
    "Class 1": ["Mathematics", "English", "Environmental Studies"],
    "Class 2": ["Mathematics", "English", "Environmental Studies"],
    "Class 3": ["Mathematics", "English", "Science"],
    "Class 4": ["Mathematics", "English", "Science"],
    "Class 5": ["Mathematics", "English", "Science"],
    "Class 6": ["Mathematics", "Science", "English", "Social Science"],
    "Class 7": ["Mathematics", "Science", "English", "Social Science"],
    "Class 8": ["Mathematics", "Science", "English", "Social Science"],
    "Class 9": ["Mathematics", "Science", "English", "Social Science"],
    "Class 10": ["Mathematics", "Science", "English", "Social Science"],
  };

  const seniorSubjects: Record<string, string[]> = {
    Science: ["Physics", "Chemistry", "Mathematics", "Biology"],
    Commerce: ["Accountancy", "Business Studies", "Economics"],
    Humanities: ["History", "Political Science", "Geography", "Economics"],
  };

  const collegeSubjects: Record<string, string[]> = {
    "Computer Science and Engineering": [
      "Data Structures",
      "Database Management Systems",
      "Operating Systems",
      "Computer Networks",
      "Design and Analysis of Algorithms",
    ],
    "Electronics and Communication Engineering": [
      "Digital Electronics",
      "Signals and Systems",
      "Communication Systems",
    ],
    "Electrical Engineering": [
      "Electrical Machines",
      "Power Systems",
      "Control Systems",
    ],
    "Mechanical Engineering": [
      "Thermodynamics",
      "Fluid Mechanics",
      "Engineering Mechanics",
    ],
    "Civil Engineering": [
      "Structural Analysis",
      "Surveying",
      "Fluid Mechanics",
    ],
  };

  const isSeniorSchool =
    institutionType === "school" &&
    (level === "Class 11" || level === "Class 12");

  const availableSubjects =
    institutionType === "college"
      ? collegeSubjects[department] ?? []
      : isSeniorSchool
        ? seniorSubjects[stream] ?? []
        : schoolSubjects[level] ?? [];

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    const allowed = [".pdf", ".docx", ".txt"];

    const valid = selected.filter((file) =>
      allowed.some((extension) =>
        file.name.toLowerCase().endsWith(extension),
      ),
    );

    if (valid.length !== selected.length) {
      setError("Only PDF, DOCX, and TXT files are supported.");
    } else {
      setError("");
    }

    setFiles((previous) => {
      const combined = [...previous, ...valid];
      return combined.filter(
        (file, index) =>
          combined.findIndex(
            (item) =>
              item.name === file.name &&
              item.size === file.size,
          ) === index,
      );
    });

    event.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index),
    );
  };

  const handleContinue = () => {
    if (!institutionType || !institution || !level || !subject) {
      setError("Please complete all required academic details.");
      return;
    }

    if (isSeniorSchool && !stream) {
      setError("Please select your stream.");
      return;
    }

    if (institutionType === "college" && (!department || !semester)) {
      setError("Please select your department and semester.");
      return;
    }

    const academicDetails = {
      institutionType,
      institution,
      level,
      stream,
      department,
      semester,
      subject,
      files,
    };

    sessionStorage.setItem(
      "elysianAcademicDetails",
      JSON.stringify({
        ...academicDetails,
        files: files.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      }),
    );

    setError("");
    navigate("/start");
  };

  const resetAcademicDetails = (type: InstitutionType) => {
    setInstitutionType(type);
    setInstitution("");
    setLevel("");
    setStream("");
    setDepartment("");
    setSemester("");
    setSubject("");
    setFiles([]);
    setError("");
  };

  return (
    <main className="dashboard">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="brand-symbol">E</span>
          <span>ELYSIAN<span className="brand-dot">.</span></span>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <button className="sidebar-link active">
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            className="sidebar-link"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <BookOpen size={19} />
            Start a Viva
          </button>

          <button
            className="sidebar-link"
            onClick={() =>
              document
                .getElementById("study-materials")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <FileText size={19} />
            Study Materials
          </button>

          <button className="sidebar-link" disabled>
            <ClipboardList size={19} />
            Assessments
          </button>

          <button className="sidebar-link" disabled>
            <BarChart3 size={19} />
            Performance
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-link" disabled>
            <Settings size={19} />
            Settings
          </button>
          <button
            className="sidebar-link"
            onClick={() => navigate("/start")}
          >
            <LogOut size={19} />
            Continue to details
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
            <div className="profile-avatar">S</div>
            <div>
              <strong>Student</strong>
              <small>Welcome to ELYSIAN</small>
            </div>
          </div>
        </header>

        <section className="dashboard-welcome">
          <div>
            <span className="welcome-tag">YOUR AI VIVA EXAMINER</span>
            <h2>Welcome to ELYSIAN</h2>
            <p>
              Choose your academic details, upload your study materials,
              and prepare for your viva.
            </p>
          </div>

          <div className="welcome-icon">
            <GraduationCap size={54} strokeWidth={1.4} />
          </div>
        </section>

        <div className="dashboard-section-heading">
          <div>
            <h2>Set up your viva</h2>
            <p>Tell us a little about your academic background.</p>
          </div>
          <span className="required-label">* Required fields</span>
        </div>

        <section className="dashboard-card">
          <div className="card-heading">
            <div className="card-icon">
              <Building2 size={21} />
            </div>
            <div>
              <h3>Academic information</h3>
              <p>Select your institution and academic details.</p>
            </div>
          </div>

          <div className="institution-options">
            <button
              className={`institution-option ${
                institutionType === "school" ? "chosen" : ""
              }`}
              onClick={() => resetAcademicDetails("school")}
              type="button"
            >
              <div className="institution-option-icon">
                <BookOpen size={23} />
              </div>
              <span>
                <strong>School</strong>
                <small>Classes 1–12</small>
              </span>
              <span className="radio-circle" />
            </button>

            <button
              className={`institution-option ${
                institutionType === "college" ? "chosen" : ""
              }`}
              onClick={() => resetAcademicDetails("college")}
              type="button"
            >
              <div className="institution-option-icon">
                <GraduationCap size={24} />
              </div>
              <span>
                <strong>College / University</strong>
                <small>Undergraduate and higher</small>
              </span>
              <span className="radio-circle" />
            </button>
          </div>

          {institutionType && (
            <div className="academic-fields">
              <label className="dashboard-field">
                <span>
                  {institutionType === "school"
                    ? "School name"
                    : "College / University name"}{" "}
                  <b>*</b>
                </span>
                <div className="field-control">
                  <Building2 size={17} />
                  <input
                    value={institution}
                    onChange={(event) => setInstitution(event.target.value)}
                    placeholder={
                      institutionType === "school"
                        ? "Enter your school name"
                        : "Enter your college name"
                    }
                  />
                </div>
              </label>

              <label className="dashboard-field">
                <span>
                  {institutionType === "school" ? "Class" : "Course"}{" "}
                  <b>*</b>
                </span>
                <div className="field-control">
                  <select
                    value={level}
                    onChange={(event) => {
                      setLevel(event.target.value);
                      setStream("");
                      setDepartment("");
                      setSemester("");
                      setSubject("");
                    }}
                  >
                    <option value="">
                      {institutionType === "school"
                        ? "Select your class"
                        : "Select your course"}
                    </option>
                    {institutionType === "school" ? (
                      Array.from({ length: 12 }, (_, index) => (
                        <option key={index + 1} value={`Class ${index + 1}`}>
                          Class {index + 1}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="B.Tech">B.Tech</option>
                        <option value="B.E.">B.E.</option>
                        <option value="B.Sc.">B.Sc.</option>
                        <option value="BCA">BCA</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="M.Sc.">M.Sc.</option>
                        <option value="MCA">MCA</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                  <ChevronDown size={17} />
                </div>
              </label>

              {isSeniorSchool && (
                <label className="dashboard-field">
                  <span>Stream <b>*</b></span>
                  <div className="field-control">
                    <select
                      value={stream}
                      onChange={(event) => {
                        setStream(event.target.value);
                        setSubject("");
                      }}
                    >
                      <option value="">Select your stream</option>
                      <option value="Science">Science</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Humanities">Humanities / Arts</option>
                    </select>
                    <ChevronDown size={17} />
                  </div>
                </label>
              )}

              {institutionType === "college" && (
                <>
                  <label className="dashboard-field">
                    <span>Department <b>*</b></span>
                    <div className="field-control">
                      <select
                        value={department}
                        onChange={(event) => {
                          setDepartment(event.target.value);
                          setSubject("");
                        }}
                      >
                        <option value="">Select department</option>
                        {Object.keys(collegeSubjects).map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={17} />
                    </div>
                  </label>

                  <label className="dashboard-field">
                    <span>Semester <b>*</b></span>
                    <div className="field-control">
                      <select
                        value={semester}
                        onChange={(event) => setSemester(event.target.value)}
                      >
                        <option value="">Select semester</option>
                        {Array.from({ length: 8 }, (_, index) => (
                          <option key={index + 1} value={String(index + 1)}>
                            Semester {index + 1}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={17} />
                    </div>
                  </label>
                </>
              )}

              <label className="dashboard-field">
                <span>Subject <b>*</b></span>
                <div className="field-control">
                  <BookOpen size={17} />
                  <select
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    disabled={
                      institutionType === "school"
                        ? !level || (isSeniorSchool && !stream)
                        : !department
                    }
                  >
                    <option value="">Select your subject</option>
                    {availableSubjects.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={17} />
                </div>
              </label>
            </div>
          )}
        </section>

        <section className="dashboard-card" id="study-materials">
          <div className="card-heading">
            <div className="card-icon">
              <UploadCloud size={21} />
            </div>
            <div>
              <h3>Study materials</h3>
              <p>
                Upload your notes so ELYSIAN can ask questions based on them.
              </p>
            </div>
            <span className="optional-label">OPTIONAL</span>
          </div>

          <label className="upload-area">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              multiple
              onChange={handleFiles}
            />
            <div className="upload-icon">
              <UploadCloud size={25} />
            </div>
            <strong>Click to upload or drag and drop</strong>
            <span>PDF, DOCX or TXT files</span>
            <span className="upload-note">
              Upload your class notes, textbooks or study guides.
            </span>
          </label>

          {files.length > 0 && (
            <div className="uploaded-files">
              <h4>Uploaded files ({files.length})</h4>
              {files.map((file, index) => (
                <div className="uploaded-file" key={`${file.name}-${index}`}>
                  <FileText size={19} />
                  <div>
                    <strong>{file.name}</strong>
                    <small>{(file.size / 1024).toFixed(1)} KB</small>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => removeFile(index)}
                  >
                    <X size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {error && <p className="dashboard-error">{error}</p>}

        <div className="dashboard-footer">
          <p>
            <span className="secure-dot" />
            Your academic details will be used to personalize your viva.
          </p>
          <button className="dashboard-continue" onClick={handleContinue}>
            Continue to viva setup
            <Plus size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}