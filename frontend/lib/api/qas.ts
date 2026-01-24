/**
 * QA（質問・回答）関連のAPIクライアント関数
 */
import { get, post, put } from './client';
// ※型定義がまだ無い場合は後ほど作成、ここでは想定される型を指定します
import type { QAResponse } from '@/types/qa'; 

/**
 * 特定のドキュメントに関連付けられたQA一覧を取得
 * @param documentId ドキュメントID
 * @returns QA一覧
 */
export async function getQAsByDocument(documentId: string): Promise<QAResponse[]> {
  return get<QAResponse[]>(`/api/documents/${documentId}/qas`);
}

/**
 * 新しい質問を投稿
 * @param documentId 対象のドキュメントID
 * @param questionText 質問本文
 * @returns 作成されたQAデータ
 */
export async function createQuestion(
  documentId: string, 
  questionText: string
): Promise<QAResponse> {
  return post<QAResponse>(`/api/documents/${documentId}/qas`, {
    question_text: questionText
  });
}

/**
 * 質問に対する回答を登録
 * @param qaId QA ID
 * @param answerText 回答本文
 * @param isFaq FAQとして登録するかどうか
 * @returns 更新されたQAデータ
 */
export async function submitAnswer(
  qaId: number,
  answerText: string,
  isFaq: boolean = false
): Promise<QAResponse> {
  return put<QAResponse>(`/api/qas/${qaId}/answer`, {
    answer_text: answerText,
    is_faq: isFaq
  });
}