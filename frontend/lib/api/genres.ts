/**
 * ジャンル関連のAPIクライアント関数
 */
import { get } from './client';
import type { Genre } from '@/types/knowledge';

/**
 * ジャンル一覧を取得（階層構造）
 * 
 * 【用途】
 * - サイドバーでのツリー表示
 * - ネットワーク図などの視覚化
 * 
 * @param includeInactive 非アクティブなジャンルも含めるか（デフォルト: false）
 * @returns ジャンル一覧（階層構造、親ジャンルのみ）
 */
export async function getGenres(includeInactive = false): Promise<Genre[]> {
  const queryParams = new URLSearchParams();
  if (includeInactive) {
    queryParams.append('include_inactive', 'true');
  }

  const queryString = queryParams.toString();
  const endpoint = `/api/genres/${queryString ? `?${queryString}` : ''}`;
  
  return get<Genre[]>(endpoint);
}

/**
 * ジャンル一覧を取得（フラットリスト）
 * 
 * 【用途】
 * - ドロップダウンでのジャンル選択
 * - ジャンル一覧表示
 * - フロントエンドでの自由なフィルタリング
 * 
 * @param options オプション
 * @param options.includeInactive 非アクティブなジャンルも含めるか
 * @returns ジャンル一覧（フラット、level・display_orderでソート済み）
 */
export async function getGenresFlat(options?: {
  includeInactive?: boolean;
}): Promise<Genre[]> {
  const queryParams = new URLSearchParams();
  
  if (options?.includeInactive) {
    queryParams.append('include_inactive', 'true');
  }

  const queryString = queryParams.toString();
  const endpoint = `/api/genres/flat${queryString ? `?${queryString}` : ''}`;
  
  return get<Genre[]>(endpoint);
}

/**
 * ジャンル詳細を取得
 * 
 * 【用途】
 * - ジャンル詳細画面
 * - ジャンル編集画面
 * - ナレッジ詳細でのジャンル情報表示
 * 
 * @param id ジャンルID
 * @param includeInactive 非アクティブなジャンルも含めるか
 * @returns ジャンル詳細（子・孫を含む）
 */
export async function getGenre(
  id: number,
  includeInactive = false
): Promise<Genre> {
  const queryParams = new URLSearchParams();
  if (includeInactive) {
    queryParams.append('include_inactive', 'true');
  }

  const queryString = queryParams.toString();
  const endpoint = `/api/genres/${id}${queryString ? `?${queryString}` : ''}`;
  
  return get<Genre>(endpoint);
}