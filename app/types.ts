export interface Question {
  questionId: string;
  conceptIdPrimary: string;
  conceptIdsSecondary?: string[];
  questionType: string;
  stemEnglish: string;
  stemHindi?: string;
  reviewStatus: string;
  difficultyLevel: string;
  marks: number;
  correctOptionIds: string[];
  options: string;
  status: string;
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
