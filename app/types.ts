export interface Question {
  questionId: string;
  format: string;
  boardSection: string;
  marksEquivalent: number;
  workingRequired: boolean;
  estimatedTimeSeconds: number;
  isParametrisable: boolean;
  lastBoardAppearance: any;
  subject: string;
  grade: string;
  unitNo: number;
  unitName: string;
  chapter: string;
  topic: string;
  subtopic: string;
  conceptDisplayName: string;
  conceptTagPrimary: string;
  conceptTagSecondary: string | null;
  conceptDifficultyRank: number;
  questionType: string;
  skillType: string;
  bloomLevel: string;
  difficulty: string;
  difficultyBand: string;
  boardWeightPriority: string;
  stem: string;
  options: string; // Stringified JSON array
  correctOptionId: string;
  explanation: string; // Stringified JSON object
  distractorRationale: string; // Stringified JSON object
  templateId: string | null;
  templateFamily: string | null;
  caseSetId: string | null;
  language: string;
  status: string;
  sourceType: string;
  generatorPromptVersion: string;
  reviewStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRequest {
  questionId: string;
  reviewerId: string;
  reviewType: string;
  decision: 'APPROVED' | 'REJECTED';
  feedback: Record<string, any>;
  comments: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ChapterCount {
  chapter: string;
  count: number;
}
