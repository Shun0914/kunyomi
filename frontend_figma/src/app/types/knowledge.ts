export interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  created_at: string;
}

export interface Genre {
  id: number;
  name: string;
  parent_id: number | null;
  level: number;
  path: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Keyword {
  id: number;
  name: string;
  normalized_name: string;
  usage_count: number;
  created_at: string;
}

export interface Document {
  id: number;
  title: string;
  content: string;
  genre_id: number;
  external_link?: string;
  status: 'draft' | 'published' | 'archived';
  created_by: number;
  created_at: string;
  updated_at: string;
  helpful_count: number;
  view_count: number;
  helpfulness_score: number;
  keywords?: Keyword[];
}

export interface DocumentEvaluation {
  id: number;
  document_id: number;
  user_id: number;
  is_helpful: boolean;
  created_at: string;
}

export interface QA {
  id: number;
  document_id: number;
  question_user_id: number;
  question_text: string;
  answer_text?: string;
  answer_user_id?: number;
  status: 'pending' | 'answered' | 'closed';
  is_faq: boolean;
  created_at: string;
  answered_at?: string;
}

export interface DocumentRelation {
  id: number;
  source_document_id: number;
  target_document_id: number;
  relation_type: 'related' | 'prerequisite' | 'reference';
  created_at: string;
  created_by: number;
}

export interface ChangeHistory {
  id: number;
  document_id: number;
  user_id: number;
  change_type: 'created' | 'updated' | 'deleted';
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}