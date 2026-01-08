# くんよみ - 社内ナレッジ管理システム

## プロジェクト概要

社内のナレッジを「残す人」と「探す人」の両方に価値を提供するナレッジ管理システムです。

### コアバリュー

1. **入力の簡便さ**: フォームでの煩雑さをなくす
2. **自動的な結びつき**: 入力内容が勝手に関連ナレッジと結びつく
3. **役立つ情報が上位表示**: 評価スコアによる検索ランキング

## プロジェクト構造

```
project_team11/
├── docs/              # 設計ドキュメント
│   ├── data_definition.md
│   └── er_diagram.md
├── minutes/           # ミーティング議事録
├── frontend/          # フロントエンド（Next.js）
│   ├── app/           # Next.js App Router
│   ├── lib/           # ユーティリティ関数
│   │   └── api/       # APIクライアント関数
│   ├── types/         # TypeScript型定義
│   ├── package.json
│   └── next.config.ts
├── frontend_figma/    # 参考用（既存のReact+Viteコード）
├── backend/           # バックエンド（FastAPI）
└── README.md
```

## 技術スタック

### フロントエンド
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- App Router

### バックエンド
- FastAPI
- SQLAlchemy
- Azure Database for MySQL

### デプロイ
- Azure App Service

## 開発環境のセットアップ

### フロントエンド

```bash
cd frontend
npm install
npm run dev  # 開発サーバー起動（http://localhost:3000）
```

詳細は [frontend/README.md](./frontend/README.md) を参照してください。

### バックエンド

```bash
cd backend
# セットアップ手順は docs/setup.md を参照してください
```

## 開発の進め方

### 週次サイクル

- **木曜スタート → 水曜完了**
- 水曜に振り返り・次週計画

### GitHub運用

- 原則「1 Issue = 1 PR」
- PR相互レビューを徹底
- ローカル動作確認後に承認・マージ

### ブランチ運用

1. 最新のmainをフェッチ/プルしてから作業開始
2. 機能ごとにファイルやディレクトリを分離
3. プッシュ前に変更ファイルを確認

## リリース計画

### リリース1（MVP）
- ナレッジの検索・一覧・詳細表示
- ナレッジの新規作成・登録

### リリース2（差別化機能）
- 全体マップ（樹形図）表示
- Q&A/よくある質問
- 評価（役立ち度）

### リリース3（運用性/拡張）
- 変更履歴
- ログイン/認証・権限
- 検索支援チャットボット

## ドキュメント

### セットアップ・ワークフロー
- [開発環境セットアップ手順](./docs/setup/setup.md) ⭐ 初めて開発する方向け
- [GitHub開発ワークフロー手順書](./docs/setup/github_workflow.md) ⭐ 初心者向け
- [Week 1 開発ガイド](./docs/setup/week1_development_guide.md) ⭐ API実装の手順

### 設計・データ定義
- [データ定義](./docs/design/data_definition.md)
- [ER図](./docs/design/er_diagram.md)
- [機能一覧とリリース計画](./docs/design/feature_roadmap.md)
- [ジャンルマスターデータ定義](./docs/design/genre_master_data.md)

### タスク
- [Week 1タスク分割](./docs/tasks/task_breakdown_week1.md)

### その他
- [プロジェクト構造と開発フロー](./docs/project_structure.md)
- [ミーティング議事録](./minutes/)

## チーム

- プロジェクト名: くんよみ
- 開発期間: 2026年1月〜

## ライセンス

（未定）

