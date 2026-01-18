// frontend/types/network.ts

export interface NetworkNode {
  id: string; // "genre_1" or "doc_123"
  label: string; // 表示名
  type: "genre" | "document"; // ノードタイプ
  genre_id?: number; // ジャンルID（ジャンルノードのみ）
  document_id?: number; // ドキュメントID（ドキュメントノードのみ）
  level?: number; // 階層レベル（ジャンルのみ）
  document_count?: number; // 紐づくドキュメント数（ジャンルのみ）
  view_count?: number; // 閲覧数（ドキュメントのみ）
  helpful_count?: number; // 役立った数（ドキュメントのみ）
}

export interface NetworkLink {
  source: string; // ソースノードID
  target: string; // ターゲットノードID
  type: "genre_hierarchy" | "genre_document"; // リンクタイプ
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}