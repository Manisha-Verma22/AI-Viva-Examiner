import { create } from "zustand";

import type {
  Candidate,
  ExamConfig,
  VivaQuestion,
} from "./types";

// Exam configuration
const config: ExamConfig = {
  title: "Computer Science Viva",
  durationMinutes: 12,
  perQuestionSeconds: 90,
  topics: [
    { id: "dsa", name: "Data Structures" },
    { id: "os", name: "Operating Systems" },
    { id: "dbms", name: "DBMS" },
    { id: "project", name: "Project Discussion" },
    { id: "other", name: "Other questions" },
  ],
};

// Zustand store state
type State = {
  candidate: Candidate | null;
  config: ExamConfig;
  step: number;
  camera: MediaStream | null;
  screen: MediaStream | null;
  micChecked: boolean;
  consent: boolean;
  question: VivaQuestion | null;
  answered: number;

  set: (value: Partial<State>) => void;
  reset: () => void;
};

// Viva exam store
export const useViva = create<State>((set) => ({
  candidate: null,
  config,
  step: 0,
  camera: null,
  screen: null,
  micChecked: false,
  consent: false,
  question: null,
  answered: 0,

  // Update store values
  set: (value) => set(value),

  // Reset the exam state
  reset: () =>
    set({
      candidate: null,
      step: 0,
      camera: null,
      screen: null,
      micChecked: false,
      consent: false,
      question: null,
      answered: 0,
    }),
}));