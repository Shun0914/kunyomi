# プロジェクト構造と開発フロー

## ディレクトリ構造

```
project_team11/
├── docs/                    # 設計ドキュメント
│   ├── data_definition.md   # データ定義
│   ├── er_diagram.md        # ER図
│   ├── project_structure.md # このファイル
│   ├── feature_roadmap.md   # 機能一覧とリリース計画
│   └── task_breakdown_week1.md # Week 1タスク分割
│
├── minutes/                  # ミーティング議事録
│   ├── meeting_01.md
│   └── ...
│
├── frontend/                 # フロントエンド（Next.js）
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx          # ページコンポーネント
│   │   ├── layout.tsx        # レイアウトコンポーネント
│   │   └── globals.css       # グローバルスタイル
│   ├── lib/                  # ユーティリティ関数
│   │   └── api/              # APIクライアント関数
│   │       ├── client.ts     # APIクライアントのベース設定
│   │       ├── documents.ts
│   │       ├── genres.ts
│   │       ├── keywords.ts
│   │       └── index.ts
│   ├── types/                # TypeScript型定義
│   │   └── knowledge.ts
│   ├── components/           # Reactコンポーネント（今後追加予定）
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
├── frontend_figma/           # 参考用（既存のReact+Viteコード）
│
├── backend/                  # バックエンド（FastAPI）
│   ├── app/
│   │   ├── api/             # APIエンドポイント
│   │   │   ├── documents.py
│   │   │   ├── genres.py
│   │   │   └── keywords.py
│   │   ├── models/          # SQLAlchemyモデル
│   │   │   ├── user.py
│   │   │   ├── genre.py
│   │   │   ├── document.py
│   │   │   └── keyword.py
│   │   ├── schemas/         # Pydanticスキーマ（リクエスト/レスポンス）
│   │   │   ├── document.py
│   │   │   └── genre.py
│   │   ├── db.py            # データベース接続設定
│   │   └── main.py          # FastAPIアプリのエントリーポイント
│   ├── alembic/             # マイグレーション（今後追加）
│   ├── requirements.txt
│   └── .env                 # 環境変数（.gitignore対象）
│
├── .gitignore
└── README.md
```

## ファイルの役割

### フロントエンド

#### `frontend/lib/api/`
**役割**: バックエンドAPIを呼び出す関数を定義  
**例**:
```typescript
// documents.ts
export async function getDocuments(): Promise<Document[]>
export async function getDocument(id: number): Promise<Document>
export async function createDocument(data: CreateDocumentRequest): Promise<Document>
```

#### `frontend/app/`
**役割**: Next.js App Router（ページとレイアウト）  
**特徴**: ファイルベースのルーティング。`app/page.tsx`が`/`に対応。

#### `frontend/components/`
**役割**: Reactコンポーネント（UI部分、今後追加予定）  
**特徴**: 既存の`frontend_figma/`のコンポーネントを参考に、Next.js用に再実装予定。

#### `frontend/types/`
**役割**: TypeScript型定義  
**特徴**: バックエンドのスキーマと一致させる必要がある。

### バックエンド

#### `backend/app/api/`
**役割**: FastAPIのエンドポイントを定義  
**例**:
```python
# documents.py
@router.get("/documents")
@router.get("/documents/{id}")
@router.post("/documents")
```

#### `backend/app/models/`
**役割**: SQLAlchemyモデル（データベーステーブル定義）  
**特徴**: `data_definition.md`に基づいて定義。

#### `backend/app/schemas/`
**役割**: Pydanticスキーマ（リクエスト/レスポンスの型定義）  
**特徴**: フロントエンドの型定義と一致させる。

---

## 開発の流れ

### 1. データベース設計
1. `docs/data_definition.md`でテーブル定義を決定
2. `backend/app/models/`でSQLAlchemyモデルを定義
3. マイグレーションでテーブルを作成

### 2. バックエンドAPI実装
1. `backend/app/schemas/`でリクエスト/レスポンスの型を定義
2. `backend/app/api/`でエンドポイントを実装
3. 動作確認（Postman等でテスト）

### 3. フロントエンドAPIクライアント作成
1. `frontend/lib/api/`でAPI呼び出し関数を作成
2. 型定義を`frontend/types/`に追加（必要に応じて）

### 4. フロントエンドコンポーネント接続
1. 既存コンポーネントのデータ取得部分を修正
2. モックデータ → API呼び出しに変更
3. ローディング・エラー状態を追加

### 5. 統合テスト
1. フロントエンドとバックエンドを接続
2. 動作確認
3. バグ修正

---

## データの流れ

```
[ユーザー操作]
    ↓
[Next.jsページ/コンポーネント] (frontend/app/)
    ↓
[APIクライアント関数] (frontend/lib/api/)
    ↓
[HTTPリクエスト]
    ↓
[FastAPIエンドポイント] (backend/app/api/)
    ↓
[SQLAlchemyモデル] (backend/app/models/)
    ↓
[データベース (MySQL)]
    ↓
[レスポンス]
    ↓
[Next.jsページ/コンポーネント]
    ↓
[画面表示]
```

---

## 並行開発のポイント

複数人で同時に開発する際、同じファイルを編集するとコンフリクト（競合）が発生します。それを避けるために、担当を分けて開発します。

### バックエンドの分担例

**機能ごとにファイルを分ける**ことで、同じファイルを同時に編集することを避けます。

- `backend/app/api/documents.py` → メンバーAが担当
- `backend/app/api/genres.py` → メンバーBが担当
- `backend/app/api/keywords.py` → メンバーCが担当

これにより、各メンバーが異なるファイルを編集するため、コンフリクトが起きにくくなります。

### フロントエンドの分担例

**画面ごとに担当を分ける**ことで、同じコンポーネントを同時に編集することを避けます。

- 一覧画面（`KnowledgeList.tsx`） → メンバーAが担当
- 詳細画面（`KnowledgeDetail.tsx`） → メンバーBが担当
- 作成画面（`KnowledgeForm.tsx`） → メンバーCが担当

### 共通部分の担当

**全員が使う基盤部分**は、@しゅんすけが最初に作成します。

- DBモデル定義（`backend/app/models/`）
- APIクライアント関数の基本構造（`frontend/lib/api/`）
- エラーハンドリングの共通処理

これらが完成すれば、他のメンバーは並行して開発を進められます。

---

## 開発環境のセットアップ

### フロントエンド
```bash
cd frontend
npm install
npm run dev  # 開発サーバー起動（http://localhost:3000）
```

### バックエンド
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload  # 開発サーバー起動（http://localhost:8000）
```

### データベース
- ローカル: MySQLを起動
- 本番: Azure Database for MySQL

---

## 次のステップ

1. [機能一覧とリリース計画](./feature_roadmap.md)を確認
2. [Week 1タスク分割](./task_breakdown_week1.md)を確認
3. 開発開始

