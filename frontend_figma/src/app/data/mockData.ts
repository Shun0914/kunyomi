import { User, Genre, Keyword, Document, QA, DocumentRelation, ChangeHistory } from '../types/knowledge';

export const mockUsers: User[] = [
  {
    id: 1,
    name: '山田太郎',
    email: 'yamada@example.com',
    department: '開発部',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '佐藤花子',
    email: 'sato@example.com',
    department: 'マーケティング部',
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    name: '鈴木一郎',
    email: 'suzuki@example.com',
    department: '営業部',
    created_at: '2024-01-03T00:00:00Z',
  },
];

export const mockGenres: Genre[] = [
  {
    id: 1,
    name: '技術',
    parent_id: null,
    level: 1,
    path: '/技術',
    display_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'フロントエンド',
    parent_id: 1,
    level: 2,
    path: '/技術/フロントエンド',
    display_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'バックエンド',
    parent_id: 1,
    level: 2,
    path: '/技術/バックエンド',
    display_order: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 4,
    name: 'ビジネス',
    parent_id: null,
    level: 1,
    path: '/ビジネス',
    display_order: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 5,
    name: 'マーケティング',
    parent_id: 4,
    level: 2,
    path: '/ビジネス/マーケティング',
    display_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 6,
    name: '営業',
    parent_id: 4,
    level: 2,
    path: '/ビジネス/営業',
    display_order: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const mockKeywords: Keyword[] = [
  { id: 1, name: 'React', normalized_name: 'react', usage_count: 15, created_at: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'TypeScript', normalized_name: 'typescript', usage_count: 12, created_at: '2024-01-01T00:00:00Z' },
  { id: 3, name: 'Node.js', normalized_name: 'nodejs', usage_count: 10, created_at: '2024-01-01T00:00:00Z' },
  { id: 4, name: 'SEO', normalized_name: 'seo', usage_count: 8, created_at: '2024-01-01T00:00:00Z' },
  { id: 5, name: 'API', normalized_name: 'api', usage_count: 20, created_at: '2024-01-01T00:00:00Z' },
];

export const mockDocuments: Document[] = [
  {
    id: 1,
    title: 'React Hooksの基本ガイド',
    content: `# React Hooksの基本ガイド

## 概要
React Hooksは、関数コンポーネントで状態管理やライフサイクル機能を使用できるようにする仕組みです。

## 主要なHooks

### useState
状態を管理するための基本的なHookです。

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

### useEffect
副作用を処理するためのHookです。データの取得やDOM操作などに使用します。

\`\`\`javascript
useEffect(() => {
  document.title = \`You clicked \${count} times\`;
}, [count]);
\`\`\`

## ベストプラクティス
- カスタムHooksを作成して、ロジックを再利用しましょう
- 依存配列を正しく指定しましょう
- Hooksのルールに従いましょう（トップレベルでのみ呼び出す）
`,
    genre_id: 2,
    external_link: 'https://react.dev/reference/react',
    status: 'published',
    created_by: 1,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z',
    helpful_count: 24,
    view_count: 156,
    helpfulness_score: 4.5,
    keywords: [mockKeywords[0], mockKeywords[1]],
  },
  {
    id: 2,
    title: 'TypeScriptの型システム入門',
    content: `# TypeScriptの型システム入門

## 型の基本
TypeScriptは静的型付けによって、コードの品質と保守性を向上させます。

## 基本的な型
- \`string\`: 文字列型
- \`number\`: 数値型
- \`boolean\`: 真偽値型
- \`array\`: 配列型
- \`object\`: オブジェクト型

## インターフェース
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}
\`\`\`

## 型エイリアス
\`\`\`typescript
type Status = 'active' | 'inactive' | 'pending';
\`\`\`

## ジェネリクス
再利用可能な型を定義する強力な機能です。

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}
\`\`\`
`,
    genre_id: 2,
    status: 'published',
    created_by: 1,
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-18T14:20:00Z',
    helpful_count: 32,
    view_count: 203,
    helpfulness_score: 4.7,
    keywords: [mockKeywords[1]],
  },
  {
    id: 3,
    title: 'RESTful API設計のベストプラクティス',
    content: `# RESTful API設計のベストプラクティス

## REST APIの原則

### 1. リソース指向
URLはリソースを表現し、HTTPメソッドでアクションを表現します。

\`\`\`
GET    /api/users      # ユーザー一覧取得
POST   /api/users      # ユーザー作成
GET    /api/users/:id  # 特定ユーザー取得
PUT    /api/users/:id  # ユーザー更新
DELETE /api/users/:id  # ユーザー削除
\`\`\`

### 2. ステータスコード
適切なHTTPステータスコードを返しましょう。
- 200: 成功
- 201: 作成成功
- 400: リクエストエラー
- 404: リソースが見つからない
- 500: サーバーエラー

### 3. バージョニング
APIのバージョンをURLに含めることを推奨します。
\`\`\`
/api/v1/users
\`\`\`

## セキュリティ
- 認証・認可を実装する
- HTTPS を使用する
- レート制限を設ける
`,
    genre_id: 3,
    status: 'published',
    created_by: 2,
    created_at: '2024-01-12T11:00:00Z',
    updated_at: '2024-01-22T16:45:00Z',
    helpful_count: 18,
    view_count: 142,
    helpfulness_score: 4.3,
    keywords: [mockKeywords[4], mockKeywords[2]],
  },
  {
    id: 4,
    title: 'SEO対策の基礎知識',
    content: `# SEO対策の基礎知識

## SEOとは
検索エンジン最適化（Search Engine Optimization）は、ウェブサイトを検索エンジンの検索結果で上位に表示させるための施策です。

## 基本的な施策

### 1. コンテンツ最適化
- 質の高いコンテンツを作成する
- キーワードを適切に配置する
- 見出しタグ（H1、H2など）を正しく使用する

### 2. テクニカルSEO
- ページの読み込み速度を最適化する
- モバイルフレンドリーにする
- サイトマップを作成する
- robots.txt を適切に設定する

### 3. メタタグ
\`\`\`html
<title>適切なタイトル（50-60文字）</title>
<meta name="description" content="説明文（150-160文字）">
\`\`\`

### 4. 内部リンク
関連するページ同士を適切にリンクさせましょう。

## 測定と改善
Google Search ConsoleやGoogle Analyticsを使用して効果を測定し、継続的に改善していきましょう。
`,
    genre_id: 5,
    status: 'published',
    created_by: 2,
    created_at: '2024-01-08T14:00:00Z',
    updated_at: '2024-01-25T10:30:00Z',
    helpful_count: 15,
    view_count: 98,
    helpfulness_score: 4.2,
    keywords: [mockKeywords[3]],
  },
  {
    id: 5,
    title: 'カスタマージャーニーマップの作成方法',
    content: `# カスタマージャーニーマップの作成方法

## カスタマージャーニーマップとは
顧客がサービスと接触するすべてのタッチポイントを可視化したものです。

## 作成ステップ

### 1. ペルソナの設定
ターゲット顧客の具体的なイメージを作成します。

### 2. ステージの定義
- 認知
- 検討
- 購入
- 利用
- 推奨

### 3. タッチポイントの洗い出し
各ステージでの顧客との接点を整理します。

### 4. 感情曲線の作成
各タッチポイントでの顧客の感情を可視化します。

### 5. 課題と機会の特定
マップから改善点を見つけ出します。

## 活用方法
- チーム内での共有と議論
- サービス改善の優先順位付け
- 新しい施策の企画
`,
    genre_id: 5,
    status: 'published',
    created_by: 2,
    created_at: '2024-01-20T13:00:00Z',
    updated_at: '2024-01-26T09:15:00Z',
    helpful_count: 12,
    view_count: 76,
    helpfulness_score: 4.0,
  },
  {
    id: 6,
    title: 'Node.jsでのパフォーマンス最適化',
    content: `# Node.jsでのパフォーマンス最適化

## はじめに
Node.jsアプリケーションのパフォーマンスを向上させるためのテクニックを紹介します。

## 最適化手法

### 1. 非同期処理の活用
\`\`\`javascript
// 良い例
const data = await fetchData();

// 避けるべき例（同期処理）
const data = fetchDataSync();
\`\`\`

### 2. クラスタリング
CPUコアを最大限活用するため、クラスタリングを使用します。

### 3. キャッシング
- メモリキャッシュ（Redis等）
- CDNの活用
- HTTPキャッシュヘッダーの設定

### 4. データベース最適化
- インデックスの適切な設定
- N+1問題の解消
- コネクションプーリング

### 5. モニタリング
- New RelicやDatadogなどのツール活用
- ログの適切な管理
- メトリクスの収集

## ベンチマーク
定期的にベンチマークを取り、パフォーマンスの変化を追跡しましょう。
`,
    genre_id: 3,
    status: 'published',
    created_by: 1,
    created_at: '2024-01-25T15:00:00Z',
    updated_at: '2024-01-27T11:20:00Z',
    helpful_count: 9,
    view_count: 54,
    helpfulness_score: 4.1,
    keywords: [mockKeywords[2], mockKeywords[4]],
  },
];

export const mockQAs: QA[] = [
  {
    id: 1,
    document_id: 1,
    question_user_id: 3,
    question_text: 'useEffectの依存配列を空にした場合、どのような挙動になりますか？',
    answer_text: '依存配列を空 [] にすると、useEffectはコンポーネントのマウント時に1度だけ実行されます。アンマウント時にクリーンアップ関数がある場合は、そちらも実行されます。',
    answer_user_id: 1,
    status: 'answered',
    is_faq: true,
    created_at: '2024-01-16T10:00:00Z',
    answered_at: '2024-01-16T11:30:00Z',
  },
  {
    id: 2,
    document_id: 2,
    question_user_id: 3,
    question_text: 'interfaceとtypeの使い分けについて教えてください。',
    answer_text: 'interfaceは拡張しやすく、クラスの実装にも使えます。typeは Union型や複雑な型定義に適しています。基本的にはinterfaceを使い、必要に応じてtypeを使うことをお勧めします。',
    answer_user_id: 1,
    status: 'answered',
    is_faq: true,
    created_at: '2024-01-11T14:00:00Z',
    answered_at: '2024-01-11T16:00:00Z',
  },
  {
    id: 3,
    document_id: 3,
    question_user_id: 1,
    question_text: 'GraphQLとRESTの使い分けについてアドバイスをいただけますか?',
    status: 'pending',
    is_faq: false,
    created_at: '2024-01-23T09:00:00Z',
  },
];

export const mockDocumentRelations: DocumentRelation[] = [
  {
    id: 1,
    source_document_id: 1,
    target_document_id: 2,
    relation_type: 'related',
    created_at: '2024-01-20T10:00:00Z',
    created_by: 1,
  },
  {
    id: 2,
    source_document_id: 2,
    target_document_id: 3,
    relation_type: 'reference',
    created_at: '2024-01-21T11:00:00Z',
    created_by: 1,
  },
  {
    id: 3,
    source_document_id: 1,
    target_document_id: 6,
    relation_type: 'related',
    created_at: '2024-01-22T12:00:00Z',
    created_by: 1,
  },
  {
    id: 4,
    source_document_id: 4,
    target_document_id: 5,
    relation_type: 'related',
    created_at: '2024-01-23T13:00:00Z',
    created_by: 2,
  },
];

export const mockChangeHistories: ChangeHistory[] = [
  {
    id: 1,
    document_id: 1,
    user_id: 1,
    change_type: 'created',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    document_id: 1,
    user_id: 1,
    change_type: 'updated',
    field_changed: 'content',
    old_value: '(previous content)',
    new_value: '(updated content)',
    created_at: '2024-01-20T15:30:00Z',
  },
  {
    id: 3,
    document_id: 2,
    user_id: 1,
    change_type: 'created',
    created_at: '2024-01-10T09:00:00Z',
  },
  {
    id: 4,
    document_id: 3,
    user_id: 2,
    change_type: 'created',
    created_at: '2024-01-12T11:00:00Z',
  },
];