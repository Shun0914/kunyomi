export type QAStatus = 'pending' | 'answered' | 'closed';

export interface QAResponse {
  id: number;
  document_id: number;
  question_user_id: number;
  question_user_name?: string; // 質問者の名前
  question_text: string;
  answer_text: string | null;
  answer_user_id: number | null;
  answer_user_name?: string;   // 回答者の名前
  status: QAStatus;
  is_faq: boolean;
  created_at: string;
  answered_at: string | null;
}