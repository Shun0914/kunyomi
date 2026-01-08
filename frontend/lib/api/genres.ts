/**
 * ジャンル関連のAPIクライアント関数
 */
import { get } from './client';
import type { Genre } from '@/types/knowledge';

/**
 * ジャンル一覧を取得
 * @param includeInactive 非アクティブなジャンルも含めるか（デフォルト: false）
 * @returns ジャンル一覧
 */
export async function getGenres(includeInactive = false): Promise<Genre[]> {
  const queryParams = new URLSearchParams();
  if (includeInactive) {
    queryParams.append('include_inactive', 'true');
  }

  const queryString = queryParams.toString();
  const endpoint = `/api/genres${queryString ? `?${queryString}` : ''}`;
  
  return get<Genre[]>(endpoint);
}

/**
 * ジャンル詳細を取得
 * @param id ジャンルID
 * @returns ジャンル詳細
 */
export async function getGenre(id: number): Promise<Genre> {
  return get<Genre>(`/api/genres/${id}`);
}

/**
 * ジャンルツリーを取得（階層構造で返す）
 * @returns ジャンルツリー（親子関係が整理された構造）
 */
export async function getGenreTree(): Promise<Genre[]> {
  return get<Genre[]>('/api/genres/tree');
}

