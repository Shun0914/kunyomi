# くんよみ フロントエンド

社内ナレッジ管理システムのフロントエンド（Next.js）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# APIのベースURL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## プロジェクト構造

```
frontend/
├── app/              # Next.js App Router（ページ・レイアウト）
├── lib/              # ユーティリティ関数
│   └── api/          # APIクライアント関数
│       ├── client.ts      # APIクライアントのベース設定
│       ├── documents.ts   # ドキュメント関連API
│       ├── genres.ts      # ジャンル関連API
│       ├── keywords.ts    # キーワード関連API
│       └── index.ts       # エクスポート
├── types/            # TypeScript型定義
│   └── knowledge.ts  # データモデルの型定義
└── components/       # Reactコンポーネント（今後追加予定）
```

## APIクライアントの使い方

```typescript
import { getDocuments, createDocument } from '@/lib/api';

// ドキュメント一覧を取得
const documents = await getDocuments({ status: 'published' });

// ドキュメントを作成
const newDocument = await createDocument({
  title: 'タイトル',
  content: '本文',
  genre_id: 1,
  status: 'draft',
});
```

## 開発コマンド

- `npm run dev` - 開発サーバーを起動
- `npm run build` - 本番用ビルド
- `npm run start` - 本番サーバーを起動
- `npm run lint` - ESLintでコードをチェック

## 技術スタック

- **Next.js 16** - Reactフレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **React 19** - UIライブラリ
