// Types for VHDN Survey App

export interface ParticipantInfo {
  name?: string;
  email?: string;
  department: string;
  position: string;
  seniority: string;
  gender?: string;
  ageGroup?: string;
}

export interface DimensionAnswer {
  dimensionNumber: number;
  scoreA_current: number;
  scoreB_current: number;
  scoreC_current: number;
  scoreD_current: number;
  scoreA_preferred: number;
  scoreB_preferred: number;
  scoreC_preferred: number;
  scoreD_preferred: number;
}

// Câu hỏi bổ sung - Giá trị & Tầm nhìn Mi2
export interface AdditionalQuestions {
  whyMi2Exists: string; // Vì sao Mi2 tồn tại?
  mi2Future: string; // 5-10 năm sau Mi2 sẽ như thế nào?
  mi2Values: string; // 02 giá trị rõ nhất + 01 giá trị nên tăng cường
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  participantInfo: ParticipantInfo;
  answers: DimensionAnswer[];
  additionalQuestions?: AdditionalQuestions;
  submittedAt: Date;
}

export interface Survey {
  id: string;
  companyName: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: "draft" | "active" | "completed";
  anonymous: boolean;
  shareLink: string;
  responses: SurveyResponse[];
  createdAt: Date;
}

export interface CultureScores {
  clan: number; // A - Văn hóa hợp tác
  adhocracy: number; // B - Văn hóa sáng tạo
  market: number; // C - Văn hóa cạnh tranh
  hierarchy: number; // D - Văn hóa kiểm soát
}

export interface DimensionResult {
  dimensionNumber: number;
  dimensionName: string;
  current: CultureScores;
  preferred: CultureScores;
}

export interface SurveyStatistics {
  totalResponses: number;
  averageCurrent: CultureScores;
  averagePreferred: CultureScores;
  dimensionResults: DimensionResult[];
  byDepartment: Record<string, CultureScores>;
  byPosition: Record<string, CultureScores>;
  bySeniority: Record<string, CultureScores>;
}

// Dropdown options
export const DEPARTMENTS = [
  "Ban lãnh đạo",
  "Nhân sự",
  "Kế toán - Tài chính",
  "Marketing",
  "Kinh doanh",
  "Sản xuất",
  "IT - Công nghệ",
  "Hành chính",
  "R&D",
  "Khác",
];

export const POSITIONS = ["Nhân viên", "Quản lý"];

export const SENIORITIES = ["Dưới 1 năm", "1-3 năm", "3-5 năm", "Trên 5 năm"];

export const GENDERS = ["Nam", "Nữ"];

export const AGE_GROUPS = [
  "Dưới 25 tuổi",
  "25-34 tuổi",
  "35-44 tuổi",
  "45-54 tuổi",
  "Trên 55 tuổi",
];
