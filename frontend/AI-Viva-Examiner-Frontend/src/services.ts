import type {
  ExamConfig,
  VivaQuestion,
  AnswerMode,
} from "./types";

// Service interfaces
export interface ExamService {
  getExamConfig(): Promise<ExamConfig>;
}

export interface InterviewService {
  start(): Promise<VivaQuestion>;

  submitAnswer(input: {
    questionId: string;
    mode: AnswerMode;
    text?: string;
    audioBlob?: Blob;
  }): Promise<VivaQuestion | null>;

  end(): Promise<void>;
}

export interface ProctorService {
  logEvent(event: string): void;
}

export interface UploadService {
  uploadRecording(blob: Blob): Promise<void>;
}

export interface TransportAdapter {
  start(): Promise<void>;
  send(event: object): Promise<void>;
  end(): Promise<void>;
}

// Mock transport adapter
export class MockTransport implements TransportAdapter {
  async start() {}

  async send(_event: object) {}

  async end() {}
}

// Mock viva questions
const questions: VivaQuestion[] = [
  {
    id: "q1",
    topicId: "dsa",
    text: "What is the difference between a stack and a queue? Give a real-world example of each.",
  },
  {
    id: "q2",
    topicId: "os",
    text: "What is a process, and how is it different from a thread?",
  },
  {
    id: "q3",
    topicId: "dbms",
    text: "What is database normalization, and why is it useful?",
  },
  {
    id: "q4",
    topicId: "project",
    text: "Tell me about a technical project you have worked on and one challenge you faced.",
  },
  {
    id: "q5",
    topicId: "other",
    text: "How would you approach learning a technology you have never used before?",
  },
];

// Mock exam service
export class MockExamService implements ExamService {
  async getExamConfig(): Promise<ExamConfig> {
    return {
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
  }
}

// Mock interview service
export class MockInterviewService implements InterviewService {
  private i = 0;

  constructor(
    private transport: TransportAdapter = new MockTransport(),
  ) {}

  async start(): Promise<VivaQuestion> {
    this.i = 0;

    await this.transport.start();

    await this.transport.send({
      type: "question.started",
      question: questions[0],
    });

    return questions[0];
  }

  async submitAnswer(input: {
    questionId: string;
    mode: AnswerMode;
    text?: string;
    audioBlob?: Blob;
  }): Promise<VivaQuestion | null> {
    await this.transport.send({
      type: "answer.received",
      ...input,
    });

    await new Promise((resolve) => setTimeout(resolve, 700));

    this.i++;

    const question = questions[this.i];

    if (question) {
      await this.transport.send({
        type: "topic.changed",
        topicId: question.topicId,
      });

      await this.transport.send({
        type: "question.started",
        question,
      });
    } else {
      await this.end();
    }

    return question ?? null;
  }

  async end(): Promise<void> {
    await this.transport.send({
      type: "interview.ended",
    });

    await this.transport.end();
  }
}

// Mock proctoring service
export class MockProctorService implements ProctorService {
  logEvent(event: string): void {
    console.info(
      "[mock proctor]",
      event,
      new Date().toISOString(),
    );
  }
}

// Mock recording upload service
export class MockUploadService implements UploadService {
  async uploadRecording(blob: Blob): Promise<void> {
    console.info("[mock upload]", blob.size);
  }
}