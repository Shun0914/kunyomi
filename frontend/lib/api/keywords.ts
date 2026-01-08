/**
 * キーワード関連のAPIクライアント関数
 */
import { get, post } from './client';
import type { Keyword } from '@/types/knowledge';

/**
 * キーワード一覧を取得
 * @param limit 取得件数の上限（デフォルト: 100）
 * @returns キーワード一覧
 */
export async function getKeywords(limit = 100): Promise<Keyword[]> {
  const queryParams = new URLSearchParams();
  if (limit) {
    queryParams.append('limit', String(limit));
  }

  const queryString = queryParams.toString();
  const endpoint = `/api/keywords${queryString ? `?${queryString}` : ''}`;
  
  return get<Keyword[]>(endpoint);
}

/**
 * キーワード検索
 * @param query 検索クエリ
 * @param limit 取得件数の上限（デフォルト: 20）
 * @returns 検索結果のキーワード一覧
 */
export async function searchKeywords(
  query: string,
  limit = 20
): Promise<Keyword[]> {
  const queryParams = new URLSearchParams();
  queryParams.append('q', query);
  if (limit) {
    queryParams.append('limit', String(limit));
  }

  const endpoint = `/api/keywords/search?${queryParams.toString()}`;
  return get<Keyword[]>(endpoint);
}

/**
 * キーワードを作成（存在しない場合は作成、存在する場合は既存のものを返す）
 * @param name キーワード名
 * @returns 作成されたまたは既存のキーワード
 */
export async function createKeyword(name: string): Promise<Keyword> {
  return post<Keyword>('/api/keywords', { name });
}

/**
 * 人気のキーワードを取得（使用回数順）
 * @param limit 取得件数の上限（デフォルト: 10）
 * @returns 人気のキーワード一覧
 */
export async function getPopularKeywords(limit = 10): Promise<Keyword[]> {
  const queryParams = new URLSearchParams();
  queryParams.append('sort', 'usage_count');
  queryParams.append('order', 'desc');
  if (limit) {
    queryParams.append('limit', String(limit));
  }

  const endpoint = `/api/keywords?${queryParams.toString()}`;
  return get<Keyword[]>(endpoint);
}

