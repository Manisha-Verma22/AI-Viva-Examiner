// Topic information
export type Topic = {
  id: string;
  name: string;
};

// Exam configuration
export type ExamConfig = {
  title: string;
  durationMinutes: number;
  topics: Topic[];
  perQuestionSeconds: number;
};

// Candidate information
export type Candidate = {
  name: string;
  email: string;
  phone: string;
};

// Viva question
export type VivaQuestion = {
  id: string;
  topicId: string;
  text: string;
};

// Answer submission mode
export type AnswerMode = "voice" | "type";