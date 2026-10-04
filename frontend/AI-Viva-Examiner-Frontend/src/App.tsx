import { useEffect, useRef, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  Clock3,
  MessageCircle,
  Mic,
  PhoneOff,
  Repeat2,
  ShieldCheck,
} from "lucide-react";
import PhoneInput, {
  isValidPhoneNumber,
} from "react-phone-number-input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useViva } from "./store";
import {
  MockInterviewService,
  MockProctorService,
  MockUploadService,
} from "./services";

import StudentDashboard from "./StudentDashboard";
import Welcome from "./Welcome";
import InstitutionSelect from "./InstitutionSelect";
import Auth from "./Auth";
import Register from "./Register";
import InstitutionRegister from "./InstitutionRegister";

function Logo() {
  return (
    <div className="logo">
      ELYSIAN<span>.</span>
    </div>
  );
}

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
};

function Button({
  children,
  onClick,
  disabled = false,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      className="pill"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Back({ to }: { to: string }) {
  const navigate = useNavigate();

  return (
    <button className="back" onClick={() => navigate(to)}>
      <ArrowLeft size={18} />
      Back
    </button>
  );
}

function Progress({ n }: { n: number }) {
  return (
    <div className="progress">
      <span>
        <i style={{ width: `${(n / 3) * 100}%` }} />
      </span>
      {n}/3
    </div>
  );
}

function Chips() {
  const topics = useViva((state) => state.config.topics);

  return (
    <div className="chips">
      {topics.map((topic) => (
        <span key={topic.id}>{topic.name}</span>
      ))}

      <span className="plain">
        • &nbsp;Custom questions defined for the exam
      </span>
    </div>
  );
}

function Start() {
  const navigate = useNavigate();
  const set = useViva((state) => state.set);
  const candidate = useViva((state) => state.candidate);

  const schema = z.object({
    name: z.string().trim().min(2, "Please enter your name"),
    email: z.string().email("Enter a valid email"),
    phone: z
      .string()
      .refine(
        (value) => isValidPhoneNumber(value),
        "Enter a valid phone number",
      ),
  });

  type Form = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: candidate?.name ?? "",
      email: candidate?.email ?? "",
      phone: candidate?.phone ?? "",
    },
  });

  const onSubmit = (values: Form) => {
    set({
      candidate: values,
      step: 1,
    });

    navigate("/instructions");
  };

  return (
    <main className="details">
      <header>
        <Logo />
        <Progress n={1} />
      </header>

      <form
        className="details-form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1>Please enter your details</h1>

        <label>
          Name
          <input
            {...register("name")}
            placeholder="Your full name"
          />
          {errors.name && (
            <small>{errors.name.message}</small>
          )}
        </label>

        <label>
          Email
          <input
            type="email"
            {...register("email")}
            placeholder="you@example.com"
          />
          {errors.email && (
            <small>{errors.email.message}</small>
          )}
        </label>

        <label>
          Phone Number

          <PhoneInput
            international
            defaultCountry="IN"
            value={watch("phone")}
            onChange={(value) =>
              setValue("phone", value ?? "", {
                shouldValidate: true,
              })
            }
            className="phone"
          />

          {errors.phone && (
            <small>{errors.phone.message}</small>
          )}
        </label>

        <Button type="submit" disabled={!isValid}>
          Continue
        </Button>
      </form>
    </main>
  );
}

function Instructions() {
  const navigate = useNavigate();
  const config = useViva((state) => state.config);

  return (
    <main className="center">
      <section className="instructions">
        <Logo />

        <p>
          Please note that this interview will take{" "}
          <b>~{config.durationMinutes} minutes</b>, with each
          question having a limited time for a response. You
          will answer by speaking or typing. Ensure you're in a
          quiet spot with a stable internet connection. This
          interview will be recorded and available in your
          profile link.
        </p>

        <div className="topicbox">
          You will be interviewed on these topics
          <Chips />
        </div>

        <p className="refresh">
          Please don't refresh the page during the interview.
        </p>

        <Button
          onClick={() => {
            useViva.getState().set({ step: 2 });
            navigate("/camera");
          }}
        >
          Continue
        </Button>
      </section>
    </main>
  );
}

function CameraCheck() {
  const navigate = useNavigate();
  const set = useViva((state) => state.set);
  const stream = useViva((state) => state.camera);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [error, setError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let liveStream: MediaStream | null = null;

    void navigator.mediaDevices
      .getUserMedia({
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : true,
      })
      .then(async (mediaStream) => {
        liveStream = mediaStream;

        set({
          camera: mediaStream,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        const allDevices =
          await navigator.mediaDevices.enumerateDevices();

        setDevices(
          allDevices.filter(
            (device) => device.kind === "videoinput",
          ),
        );

        setError("");
      })
      .catch(() => {
        setError(
          "Camera permission denied or no camera found. Allow access and retry.",
        );
      });

    return () => {
      if (liveStream) {
        liveStream
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [deviceId, set]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <main className="device">
      <header>
        <Logo />
        <Back to="/instructions" />
      </header>

      <section className="device-content">
        <h1>Check your camera</h1>

        <p>
          Your camera will record the interview for assessment
          and proctoring. Please be ready to appear on video in a
          professional setting.
        </p>

        <div className="select">
          <Camera />

          <select
            value={deviceId}
            onChange={(event) =>
              setDeviceId(event.target.value)
            }
          >
            <option value="">Default camera</option>

            {devices.map((device, index) => (
              <option
                key={device.deviceId}
                value={device.deviceId}
              >
                {device.label || `Camera ${index + 1}`}
              </option>
            ))}
          </select>

          <ChevronDown />
        </div>

        <div className="preview">
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
            />
          ) : (
            <span>
              <Camera /> Camera preview
            </span>
          )}
        </div>

        {error && (
          <small className="error">{error}</small>
        )}

        <Button
          disabled={!stream}
          onClick={() => {
            set({ step: 3 });
            navigate("/mic");
          }}
        >
          Continue
        </Button>

        <small className="footnote">
          Note: Screen sharing is required. Please share your
          entire screen to continue.
        </small>
      </section>
    </main>
  );
}

function MicCheck() {
  const navigate = useNavigate();
  const set = useViva((state) => state.set);
  const consent = useViva((state) => state.consent);
  const done = useViva((state) => state.micChecked);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [level, setLevel] = useState(0);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    void navigator.mediaDevices
      .enumerateDevices()
      .then((allDevices) => {
        setDevices(
          allDevices.filter(
            (device) => device.kind === "audioinput",
          ),
        );
      });
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let animationFrame = 0;

    void navigator.mediaDevices
      .getUserMedia({
        audio: deviceId
          ? { deviceId: { exact: deviceId } }
          : true,
      })
      .then((mediaStream) => {
        stream = mediaStream;
        audioContext = new AudioContext();

        const analyser = audioContext.createAnalyser();

        audioContext
          .createMediaStreamSource(mediaStream)
          .connect(analyser);

        const data = new Uint8Array(analyser.fftSize);

        const updateLevel = () => {
          analyser.getByteTimeDomainData(data);

          let sum = 0;

          for (const value of data) {
            const normalized = (value - 128) / 128;
            sum += normalized * normalized;
          }

          setLevel(
            Math.min(
              1,
              Math.sqrt(sum / data.length) * 5,
            ),
          );

          animationFrame =
            requestAnimationFrame(updateLevel);
        };

        updateLevel();
      })
      .catch(() => setLevel(0));

    return () => {
      cancelAnimationFrame(animationFrame);

      stream
        ?.getTracks()
        .forEach((track) => track.stop());

      void audioContext?.close();
    };
  }, [deviceId]);

  const testMicrophone = () => {
    setCapturing(true);
    set({ micChecked: false });

    window.setTimeout(() => {
      setCapturing(false);
      set({ micChecked: true });
    }, 5000);
  };

  return (
    <main className="device">
      <header>
        <Logo />
        <Back to="/camera" />
      </header>

      <section className="device-content">
        <h1>Test your mic</h1>

        <p>
          Let's make sure your mic is working. Please follow the
          steps below to test it.
        </p>

        <div className="select">
          <Mic />

          <select
            value={deviceId}
            onChange={(event) =>
              setDeviceId(event.target.value)
            }
          >
            <option value="">Default microphone</option>

            {devices.map((device, index) => (
              <option
                key={device.deviceId}
                value={device.deviceId}
              >
                {device.label || `Microphone ${index + 1}`}
              </option>
            ))}
          </select>

          <ChevronDown />
        </div>

        <div className="mic-card">
          <b>
            Click the 'Speak' button and read the line below out
            loud.
          </b>

          <div className="sentence">
            Testing. Do you hear me, ELYSIAN?
          </div>

          <div className="bars">
            {Array.from({ length: 17 }, (_, index) => (
              <i
                key={index}
                className={
                  level * 17 > index ? "on" : ""
                }
                style={{
                  height: 10 + (index % 5) * 4,
                }}
              />
            ))}
          </div>

          <button
            className="speak"
            onClick={testMicrophone}
            disabled={capturing}
          >
            {capturing ? "Listening..." : "Speak"}
          </button>

          {done && (
            <div className="success">
              <Check /> Mic check complete!
            </div>
          )}
        </div>

        <label className="consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) =>
              set({
                consent: event.target.checked,
              })
            }
          />

          I agree to all{" "}
          <a href="#privacy">
            terms &amp; privacy policies
          </a>
        </label>

        <Button
          disabled={!done || !consent}
          onClick={() => navigate("/share")}
        >
          Screen-share &amp; continue
        </Button>

        <small className="footnote">
          Please share your entire screen to continue.
        </small>
      </section>
    </main>
  );
}

function Share() {
  const navigate = useNavigate();
  const set = useViva((state) => state.set);
  const camera = useViva((state) => state.camera);

  const [error, setError] = useState("");

  const shareScreen = async () => {
    setError("");

    try {
      const screenStream =
        await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: "monitor",
          },
          audio: false,
        });

      if (
        screenStream
          .getVideoTracks()[0]
          .getSettings()
          .displaySurface !== "monitor"
      ) {
        screenStream
          .getTracks()
          .forEach((track) => track.stop());

        setError(
          "Please share your ENTIRE screen, not a tab or window.",
        );

        return;
      }

      set({
        screen: screenStream,
        step: 4,
      });

      navigate("/interview");
    } catch {
      setError(
        "Screen sharing was cancelled. Please try again.",
      );
    }
  };

  return (
    <main className="device">
      <header>
        <Logo />
      </header>

      <section className="share-content">
        <div>
          <h1>Share your entire screen</h1>

          <p>
            Screen sharing is required for this mock viva.
          </p>

          <div className="preview">
            {camera ? (
              <video
                autoPlay
                muted
                playsInline
                ref={(element) => {
                  if (element) {
                    element.srcObject = camera;
                  }
                }}
              />
            ) : (
              <span>Camera preview</span>
            )}
          </div>

          <Button onClick={() => void shareScreen()}>
            Choose screen to share
          </Button>

          {error && (
            <small className="error">{error}</small>
          )}
        </div>

        <aside>
          <h3>
            <ShieldCheck /> Before you begin
          </h3>

          <ol>
            <li>
              Your session may be recorded for assessment.
            </li>
            <li>
              The mock session includes proctoring event
              logging.
            </li>
            <li>
              Stay on this tab and avoid external tools or AI
              assistants.
            </li>
            <li>
              You may ask for clarification by repeating the
              question aloud.
            </li>
            <li>
              A long pause can indicate you have finished
              answering.
            </li>
          </ol>
        </aside>
      </section>
    </main>
  );
}

function Interview() {
  const navigate = useNavigate();
  const config = useViva((state) => state.config);
  const camera = useViva((state) => state.camera);
  const screen = useViva((state) => state.screen);
  const question = useViva((state) => state.question);
  const set = useViva((state) => state.set);
  const answered = useViva((state) => state.answered);

  const [seconds, setSeconds] = useState(
    config.durationMinutes * 60,
  );

  const [answerText, setAnswerText] = useState("");
  const [busy, setBusy] = useState(false);
  const [ended, setEnded] = useState(false);
  const [toast, setToast] = useState("");

  const [service] = useState(
    () => new MockInterviewService(),
  );

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!question) {
      void service.start().then((nextQuestion) => {
        set({
          question: nextQuestion,
        });
      });
    }
  }, [question, service, set]);

  useEffect(() => {
    if (videoRef.current && camera) {
      videoRef.current.srcObject = camera;
    }
  }, [camera]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSeconds((current) =>
        Math.max(0, current - 1),
      );
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (screen) {
      screen.getVideoTracks()[0].onended = () => {
        setToast(
          "Screen sharing stopped. Please restart the session.",
        );

        setEnded(true);
      };
    }
  }, [screen]);

  useEffect(() => {
    const proctor = new MockProctorService();

    const logEvent = (event: string) => {
      proctor.logEvent(event);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logEvent("visibilitychange");
        setToast("Please stay on this tab.");
      }
    };

    const handleWindowBlur = () => {
      logEvent("window.blur");
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      window.removeEventListener(
        "blur",
        handleWindowBlur,
      );
    };
  }, []);

  const finishInterview = async () => {
    setEnded(true);

    await service.end();

    const uploadService = new MockUploadService();
    void uploadService;

    camera
      ?.getTracks()
      .forEach((track) => track.stop());

    screen
      ?.getTracks()
      .forEach((track) => track.stop());
  };

  useEffect(() => {
    if (seconds === 0 && !ended) {
      void finishInterview();
    }
  }, [seconds, ended]);

  const submitAnswer = async () => {
    if (
      !question ||
      !answerText.trim() ||
      busy
    ) {
      return;
    }

    setBusy(true);
    setToast("ELYSIAN is thinking...");

    const nextQuestion =
      await service.submitAnswer({
        questionId: question.id,
        mode: "type",
        text: answerText,
      });

    set({
      question: nextQuestion,
      answered: answered + 1,
    });

    setAnswerText("");
    setBusy(false);
    setToast("");

    if (!nextQuestion) {
      await finishInterview();
    }
  };

  if (ended) {
    return (
      <main className="complete">
        <Logo />

        <section>
          <div className="checkmark">✓</div>

          <h1>
            Thank you, your viva is complete
          </h1>

          <p>
            You answered {answered} questions.
          </p>

          <p className="muted">
            Your recording will be available in your
            profile link.
          </p>

          <Button
            onClick={() => {
              useViva.getState().reset();
              navigate("/student");
            }}
          >
            Back to dashboard
          </Button>
        </section>
      </main>
    );
  }

  const activeTopicId =
    question?.topicId ??
    config.topics[0]?.id;

  return (
    <main className="interview">
      <header>
        <div>
          <Logo />

          <small className="recording">
            <i /> Recording
          </small>
        </div>

        <div className="timer">
          <Clock3 />

          {String(
            Math.floor(seconds / 60),
          ).padStart(2, "0")}
          :
          {String(seconds % 60).padStart(2, "0")}
        </div>
      </header>

      <nav className="tabs">
        {config.topics.map((topic) => (
          <div
            className={
              activeTopicId === topic.id
                ? "selected"
                : ""
            }
            key={topic.id}
          >
            {topic.name}
            <i />
          </div>
        ))}
      </nav>

      <section className="question-area">
        <div className="orb">
          <div>
            <Logo />
          </div>
        </div>

        <div className="question">
          <small>
            ELYSIAN · AI EXAMINER
          </small>

          <p>
            {question?.text ??
              "Preparing your first question..."}
          </p>

          <div className="answer-bar">
            <i />
          </div>

          <small>
            Take your time and explain your reasoning.
          </small>
        </div>
      </section>

      <section className="answer-layout">
        <div className="self-preview">
          <div className="preview">
            {camera ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
              />
            ) : (
              <span>
                Camera preview
              </span>
            )}
          </div>
        </div>

        <div className="answer-box">
          <div className="answer-title">
            Answer by typing{" "}
            <span>Mock session</span>
          </div>

          <textarea
            value={answerText}
            onChange={(event) =>
              setAnswerText(event.target.value)
            }
            placeholder="Type your answer here..."
          />

          <Button
            disabled={
              !answerText.trim() ||
              busy
            }
            onClick={() =>
              void submitAnswer()
            }
          >
            {busy
              ? "Thinking..."
              : "Submit answer"}
          </Button>

          <div className="actions">
            <button
              onClick={() =>
                setToast(
                  "Question repeat is available in the live examiner integration.",
                )
              }
            >
              <Repeat2 /> Repeat question
            </button>

            <button
              onClick={() =>
                setToast(
                  "You can ask ELYSIAN to clarify the question.",
                )
              }
            >
              <MessageCircle /> I need clarification
            </button>

            <button
              className="end"
              onClick={() => {
                if (
                  window.confirm(
                    "End this viva now?",
                  )
                ) {
                  void finishInterview();
                }
              }}
            >
              <PhoneOff /> End interview
            </button>
          </div>
        </div>
      </section>

      {toast && (
        <div className="toast">
          {toast}

          <button
            onClick={() => setToast("")}
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
}

function Guard({
  min,
  children,
}: {
  min: number;
  children: React.ReactNode;
}) {
  const currentStep = useViva(
    (state) => state.step,
  );

  return currentStep >= min ? (
    <>{children}</>
  ) : (
    <Navigate
      to="/start"
      replace
    />
  );
}

export default function App() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
      }}
    >
      <Routes>

        {/* =========================
            ELYSIAN ENTRY
        ========================== */}

        <Route
          path="/"
          element={<Welcome />}
        />

        {/* =========================
            STUDENT ENTRY
        ========================== */}

        <Route
          path="/login/student"
          element={
            <InstitutionSelect
              role="student"
            />
          }
        />

        <Route
          path="/auth/student/:institutionId"
          element={
            <Auth
              role="student"
            />
          }
        />

        {/* =========================
            TEACHER ENTRY
        ========================== */}

        <Route
          path="/login/teacher"
          element={
            <InstitutionSelect
              role="teacher"
            />
          }
        />

        <Route
          path="/auth/teacher/:institutionId"
          element={
            <Auth
              role="teacher"
            />
          }
        />

        {/* =========================
            ADMIN ENTRY
        ========================== */}

        <Route
          path="/login/admin"
          element={
            <InstitutionSelect
              role="admin"
            />
          }
        />

        <Route
          path="/auth/admin/:institutionId"
          element={
            <Auth
              role="admin"
            />
          }
        />

        {/* =========================
            STUDENT / USER REGISTER
        ========================== */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =========================
            INSTITUTION REGISTRATION
        ========================== */}

        <Route
          path="/register/institution"
          element={
            <InstitutionRegister />
          }
        />

        {/* =========================
            STUDENT DASHBOARD
        ========================== */}

        <Route
          path="/student"
          element={
            <StudentDashboard />
          }
        />

        {/* =========================
            VIVA FLOW
        ========================== */}

        <Route
          path="/start"
          element={<Start />}
        />

        <Route
          path="/instructions"
          element={
            <Guard min={1}>
              <Instructions />
            </Guard>
          }
        />

        <Route
          path="/camera"
          element={
            <Guard min={2}>
              <CameraCheck />
            </Guard>
          }
        />

        <Route
          path="/mic"
          element={
            <Guard min={3}>
              <MicCheck />
            </Guard>
          }
        />

        <Route
          path="/share"
          element={
            <Guard min={3}>
              <Share />
            </Guard>
          }
        />

        <Route
          path="/interview"
          element={
            <Guard min={4}>
              <Interview />
            </Guard>
          }
        />

        {/* =========================
            FALLBACK
        ========================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </motion.div>
  );
}