// frontend/lib/api/network.ts

import { get } from './client';
import type { NetworkGraphData } from '@/types/network';

/**
 * ネットワークグラフデータを取得
 * 
 * 【用途】
 * - ネットワーク図でのジャンル・ドキュメント可視化
 * - Obsidian風のグラフビュー
 * 
 * @param options オプション
 * @param options.genreId 特定ジャンルのみ取得（指定しない場合は全体）
 * @param options.includeInactive 無効なジャンル・ドキュメントも含めるか
 * @returns ネットワークグラフデータ（ノード + リンク）
 */
export async function getNetworkGraph(options?: {
  genreId?: number;
  includeInactive?: boolean;
}): Promise<NetworkGraphData> {
  const queryParams = new URLSearchParams();
  
  if (options?.genreId) {
    queryParams.append('genre_id', options.genreId.toString());
  }
  
  if (options?.includeInactive) {
    queryParams.append('include_inactive', 'true');
  }

  const queryString = queryParams.toString();
  const endpoint = `/api/network/graph${queryString ? `?${queryString}` : ''}`;
  
  return get<NetworkGraphData>(endpoint);
}