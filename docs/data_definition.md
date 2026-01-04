# データ定義ドキュメント v0.2

## 基本方針

### コアバリュー
1. **入力の簡便さ**: フォームでの煩雑さをなくす
2. **自動的な結びつき**: 入力内容が勝手に関連ナレッジと結びつく
3. **役立つ情報が上位表示**: 評価スコアによる検索ランキング

### 設計アプローチ
- 最小限の構造化入力 + 自動補完（B案ベース）
- ジャンル階層構造（楽天のL1-L4的な発想）
- キーワードは動的生成（運用しながら育てる）
- 評価スコアによる検索ランキング最適化

---

## エンティティ一覧

1. **Document** - ナレッジ/ドキュメント本体
2. **Genre** - ジャンル階層マスター
3. **Keyword** - キーワードマスター（動的生成）
4. **DocumentKeyword** - ドキュメント-キーワード中間テーブル
5. **User** - ユーザー情報
6. **DocumentEvaluation** - 評価（リリース2以降）
7. **QA** - Q&A（リリース2以降）

---

## テーブル定義詳細

### 1. Document（ナレッジ/ドキュメント）

メインのコンテンツエンティティ

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主キー |
| title | VARCHAR(255) | NO | - | タイトル |
| content | TEXT | NO | - | 本文（Markdown対応想定） |
| genre_id | BIGINT | NO | - | ジャンルID（FK to Genre） |
| external_link | VARCHAR(500) | YES | NULL | 外部リンク（Box/SharePoint等） |
| status | ENUM('draft','published','archived') | NO | 'draft' | ステータス |
| created_by | BIGINT | NO | - | 作成者（FK to User） |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | 作成日時 |
| updated_by | BIGINT | YES | NULL | 最終更新者（FK to User、初回作成時はNULL） |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP ON UPDATE | 更新日時 |
| helpful_count | INTEGER | NO | 0 | 役立った数 |
| view_count | INTEGER | NO | 0 | 閲覧数 |
| helpfulness_score | DECIMAL(5,2) | NO | 0.00 | 役立ち度スコア（算出値） |

**インデックス**:
- PRIMARY KEY (id)
- INDEX idx_genre_id (genre_id)
- INDEX idx_status (status)
- INDEX idx_helpfulness_score (helpfulness_score DESC)
- INDEX idx_created_by (created_by)
- INDEX idx_updated_by (updated_by)

**補足**:
- `helpfulness_score = helpful_count / MAX(view_count, 1)` で算出
- `updated_by`は初回作成時はNULL、更新時に現在のユーザーIDを設定
- 表示時は`updated_by`がNULLの場合は`created_by`を表示、それ以外は`updated_by`を表示
- リリース2以降で `version`, `parent_document_id` を追加予定（履歴管理）

---

### 2. Genre（ジャンル階層）

階層構造を持つカテゴリマスター

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主キー |
| name | VARCHAR(100) | NO | - | ジャンル名 |
| parent_id | BIGINT | YES | NULL | 親ジャンルID（自己参照FK） |
| level | INTEGER | NO | - | 階層レベル（1-5） |
| path | VARCHAR(255) | NO | - | パス（例: "1/5/23"） |
| display_order | INTEGER | NO | 0 | 表示順 |
| is_active | BOOLEAN | NO | TRUE | 有効フラグ |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | 作成日時 |

**インデックス**:
- PRIMARY KEY (id)
- INDEX idx_parent_id (parent_id)
- INDEX idx_path (path)
- INDEX idx_is_active (is_active)

**補足**:
- `parent_id` が NULL の場合は L1（最上位）
- `path` は階層検索の高速化用（例: "1/5/23" → L1のid=1配下のL2のid=5配下のL3のid=23）
- 最大5階層まで対応

**ID設計方針**:
- `id`は自動採番（AUTO_INCREMENT）を使用
- IDは単なる識別子として扱い、階層情報は含まない
- 階層情報は`parent_id`と`path`で管理
- `path`は`parent_id`から計算で生成（親ジャンルの`path` + "/" + 自分の`id`）
- 親ジャンル変更時は`path`を再計算（配下のジャンルも再帰的に更新が必要）

**初期データ例**:
```
L1: 申請系 (id=1, parent_id=NULL, path='1')
  L2: 経費申請 (id=2, parent_id=1, path='1/2')
    L3: 交通費 (id=3, parent_id=2, path='1/2/3')
    L3: 会議費 (id=4, parent_id=2, path='1/2/4')
  L2: 休暇申請 (id=5, parent_id=1, path='1/5')
L1: 開発系 (id=6, parent_id=NULL, path='6')
  L2: フロントエンド (id=7, parent_id=6, path='6/7')
  L2: バックエンド (id=8, parent_id=6, path='6/8')
L1: 総務系 (id=9, parent_id=NULL, path='9')
L1: 営業系 (id=10, parent_id=NULL, path='10')
```

---

### 3. Keyword（キーワードマスター）

ドキュメントに紐づくキーワード（動的生成）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主キー |
| name | VARCHAR(100) | NO | - | キーワード名（表示用） |
| normalized_name | VARCHAR(100) | NO | - | 正規化名（検索用、UNIQUE） |
| usage_count | INTEGER | NO | 0 | 使用回数 |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | 作成日時 |

**インデックス**:
- PRIMARY KEY (id)
- UNIQUE KEY uk_normalized_name (normalized_name)
- INDEX idx_usage_count (usage_count DESC)

**補足**:
- `normalized_name`: 小文字化、記号削除、スペース→ハイフン変換した値
  - 例: "React.js" → name="React.js", normalized_name="reactjs"
- 入力補完時に `usage_count` の降順でソート
- 運用しながらキーワードが自然に蓄積される

**正規化処理の例**:
```javascript
function normalizeKeyword(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
}
```

---

### 4. DocumentKeyword（ドキュメント-キーワード中間テーブル）

多対多の関連を管理

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主キー |
| document_id | BIGINT | NO | - | ドキュメントID（FK to Document） |
| keyword_id | BIGINT | NO | - | キーワードID（FK to Keyword） |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | 紐付け日時 |

**インデックス**:
- PRIMARY KEY (id)
- UNIQUE KEY uk_document_keyword (document_id, keyword_id)
- INDEX idx_keyword_id (keyword_id)

**補足**:
- 1つのドキュメントに複数のキーワードを紐付け可能
- 1つのキーワードは複数のドキュメントで使用可能
- UNIQUE制約により、同じ組み合わせの重複を防止

**なぜ中間テーブルが必要か**:
- 多対多の関係を正規化された形で表現
- 検索の高速化（インデックスが効く）
- データの整合性確保（CASCADE削除など）
- 将来の拡張性（weight, created_by などの追加が容易）

---

### 5. User（ユーザー）

作成者・閲覧者情報

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主キー |
| name | VARCHAR(100) | NO | - | 名前 |
| email | VARCHAR(255) | NO | - | メールアドレス（UNIQUE） |
| department | VARCHAR(100) | YES | NULL | 部署 |
| password_hash | VARCHAR(255) | YES | NULL | パスワードハッシュ（リリース2以降で使用） |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | 登録日時 |

**インデックス**:
- PRIMARY KEY (id)
- UNIQUE KEY uk_email (email)

**補足**:
- MVP時点では認証機能なし、簡易登録のみ（password_hashはNULL）
- リリース2以降で認証機能を実装予定（カラムは既に追加済み）

---

### 6. DocumentEvaluation（評価）

リリース2以降で実装予定

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主キー |
| document_id | BIGINT | NO | - | ドキュメントID（FK to Document） |
| user_id | BIGINT | NO | - | 評価したユーザーID（FK to User） |
| is_helpful | BOOLEAN | NO | - | 役立った=TRUE, そうでもない=FALSE |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | 評価日時 |

**インデックス**:
- PRIMARY KEY (id)
- UNIQUE KEY uk_document_user (document_id, user_id)
- INDEX idx_document_id (document_id)

**補足**:
- 1ユーザーにつき1ドキュメントに1回のみ評価可能
- 集計は定期バッチで `Document.helpful_count` に反映
- `Document.helpfulness_score` を更新

---

### 7. QA（Q&A）

リリース2以降で実装予定

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | BIGINT | NO | AUTO_INCREMENT | 主キー |
| document_id | BIGINT | NO | - | ドキュメントID（FK to Document） |
| question_user_id | BIGINT | NO | - | 質問者ID（FK to User） |
| question_text | TEXT | NO | - | 質問内容 |
| answer_text | TEXT | YES | NULL | 回答内容 |
| answer_user_id | BIGINT | YES | NULL | 回答者ID（FK to User） |
| status | ENUM('open','answered','closed') | NO | 'open' | ステータス |
| is_faq | BOOLEAN | NO | FALSE | FAQ化フラグ |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | 質問日時 |
| answered_at | TIMESTAMP | YES | NULL | 回答日時 |

**インデックス**:
- PRIMARY KEY (id)
- INDEX idx_document_id (document_id)
- INDEX idx_status (status)
- INDEX idx_is_faq (is_faq)

---

## 検索・ランキングロジック

### 基本検索

```sql
SELECT 
  d.id,
  d.title,
  d.content,
  g.name as genre_name,
  d.helpfulness_score,
  d.view_count
FROM Document d
JOIN Genre g ON d.genre_id = g.id
WHERE 
  d.status = 'published'
  AND (
    d.title LIKE CONCAT('%', :keyword, '%')
    OR EXISTS (
      SELECT 1 
      FROM DocumentKeyword dk
      JOIN Keyword k ON dk.keyword_id = k.id
      WHERE dk.document_id = d.id 
        AND k.normalized_name = LOWER(REPLACE(:keyword, ' ', '-'))
    )
  )
ORDER BY 
  d.helpfulness_score DESC,
  d.updated_at DESC
LIMIT 20;
```

### ジャンル階層検索

```sql
-- L1ジャンル「申請系」(id=1) 配下の全ドキュメント
SELECT d.*
FROM Document d
JOIN Genre g ON d.genre_id = g.id
WHERE (g.path LIKE '1/%' OR g.id = 1)
  AND d.status = 'published'
ORDER BY d.helpfulness_score DESC
LIMIT 20;
```

### 関連ドキュメント（キーワード類似度）

```sql
-- document_id=123 と関連するドキュメント
SELECT 
  d2.id,
  d2.title,
  d2.helpfulness_score,
  COUNT(dk2.keyword_id) as common_keywords
FROM Document d1
JOIN DocumentKeyword dk1 ON d1.id = dk1.document_id
JOIN DocumentKeyword dk2 ON dk1.keyword_id = dk2.keyword_id
JOIN Document d2 ON dk2.document_id = d2.id
WHERE 
  d1.id = 123
  AND d2.id != 123
  AND d2.status = 'published'
GROUP BY d2.id, d2.title, d2.helpfulness_score
ORDER BY 
  common_keywords DESC,
  d2.helpfulness_score DESC
LIMIT 10;
```

---

## 検討事項・未解決課題

### 1. キーワード入力数の制限
- **制限数**: 最大3個まで
- **実装**: フロントエンドとバックエンドの両方でバリデーションを実装
- **理由**: 関連度計算の精度向上と運用の簡素化

### 2. helpfulness_score の算出式
- **現在案**: `helpful_count / MAX(view_count, 1)`
- **代替案**: Wilson Score Interval（より安定）
- **判断**: シンプルな割り算でスタート、問題が出たら改善

### 3. 全文検索の実装方法
- **MVP**: タイトル（`LIKE`検索）+ キーワード（正規化名でのマッチング）
- **リリース2**: 本文も含めた全文検索（PostgreSQL Full-Text Search、pg_trgm拡張）
- **リリース3**: Elasticsearch導入検討

### 4. ジャンル階層の初期データ設計
- **L1案**: 申請系、開発系、総務系、営業系、その他
- **L2以降**: 運用開始後にチームでブラッシュアップ

### 5. キーワードの表記ゆれ対策（リリース2以降）
- 類似キーワード統合機能
- 管理画面での手動マージ
- 自動提案機能の検討

---

## 次のステップ

1. ✅ データ定義ドラフト完成
2. ⏳ ER図の作成（Mermaid形式）
3. ⏳ 樹形図可視化の実装調査
4. ⏳ プロトタイプとの整合性確認

---

## 変更履歴

- 2025-12-30 v0.1: 初版作成
- 2025-12-30 v0.2: キーワードマスターを動的生成方式に変更、中間テーブルの説明を追加
- 2026-01-05 v0.3: ジャンルID設計方針を決定（自動採番 + path管理方式）、初期データ例を更新
- 2026-01-05 v0.4: Userテーブルにpassword_hashカラム追加、キーワード入力数を3個に制限、検索対象をタイトル+キーワードに変更（本文検索はリリース2以降）
- 2026-01-05 v0.5: Documentテーブルにupdated_byカラム追加（最終更新者を記録）
