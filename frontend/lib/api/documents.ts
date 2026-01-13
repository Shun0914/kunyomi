/**
 * ドキュメント関連のAPIクライアント関数
 */
import { get, post, patch, del } from './client';
import type {
  Document,
  DocumentListResponse,
  Knowledge,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  SearchDocumentsParams,
} from '@/types/knowledge';

/**
 * ドキュメント一覧を取得
 * @param params 検索パラメータ
 * @returns ドキュメント一覧（配列）
 */
export async function getDocuments(
  params?: SearchDocumentsParams
): Promise<Knowledge[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.keyword) {
    queryParams.append('keyword', params.keyword);
  }
  if (params?.genre_id) {
    queryParams.append('genre_id', String(params.genre_id));
  }
  if (params?.status) {
    queryParams.append('status', params.status);
  }
  // skip, limit を優先（page, per_page は後方互換性のため残す）
  if (params?.skip !== undefined) {
    queryParams.append('skip', String(params.skip));
  } else if (params?.page !== undefined) {
    queryParams.append('skip', String(params.page));
  }
  if (params?.limit !== undefined) {
    queryParams.append('limit', String(params.limit));
  } else if (params?.per_page !== undefined) {
    queryParams.append('limit', String(params.per_page));
  }

  const queryString = queryParams.toString();
  const endpoint = `/api/documents_list${queryString ? `?${queryString}` : ''}`;
  
  return get<Knowledge[]>(endpoint);
}

/**
 * ドキュメント詳細を取得
 * @param id ドキュメントID
 * @returns ドキュメント詳細
 */
export async function getDocument(id: number): Promise<Document> {
  return get<Document>(`/api/documents/${id}`);
}

/**
 * ドキュメントを作成
 * @param data 作成するドキュメントのデータ
 * @returns 作成されたドキュメント
 */
export async function createDocument(
  data: CreateDocumentRequest
): Promise<Document> {
  return post<Document>('/api/documents', data);
}

/**
 * ドキュメントを更新
 * @param id ドキュメントID
 * @param data 更新するドキュメントのデータ
 * @returns 更新されたドキュメント
 */
export async function updateDocument(
  id: number,
  data: UpdateDocumentRequest
): Promise<Document> {
  return patch<Document>(`/api/documents/${id}`, data);
}

/**
 * ドキュメントを削除
 * @param id ドキュメントID
 */
export async function deleteDocument(id: number): Promise<void> {
  return del<void>(`/api/documents/${id}`);
}

/**
 * ドキュメントの閲覧数を増やす
 * @param id ドキュメントID
 */
export async function incrementViewCount(id: number): Promise<void> {
  return post<void>(`/api/documents/${id}/view`);
}

/**
 * ドキュメントの「役立った」評価を追加/更新
 * @param id ドキュメントID
 * @param isHelpful 役立ったかどうか
 */
export async function evaluateDocument(
  id: number,
  isHelpful: boolean
): Promise<void> {
  return post<void>(`/api/documents/${id}/evaluate`, { is_helpful: isHelpful });
}

