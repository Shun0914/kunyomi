# ジャンルマスターデータ定義

## 方針

- 一般的な会社業務を想定したジャンル構造
- 階層は最大3階層まで（L1 → L2 → L3）
- MVP用のシンプルな構造（完璧は求めない）
- 後から追加・変更可能

## ジャンル構造

### L1: 申請系
- **id**: 1
- **path**: "1"
- **level**: 1
- **display_order**: 1

#### L2: 経費申請
- **id**: 2
- **parent_id**: 1
- **path**: "1/2"
- **level**: 2
- **display_order**: 1

##### L3: 交通費
- **id**: 3
- **parent_id**: 2
- **path**: "1/2/3"
- **level**: 3
- **display_order**: 1

##### L3: 会議費
- **id**: 4
- **parent_id**: 2
- **path**: "1/2/4"
- **level**: 3
- **display_order**: 2

##### L3: その他経費
- **id**: 5
- **parent_id**: 2
- **path**: "1/2/5"
- **level**: 3
- **display_order**: 3

#### L2: 休暇申請
- **id**: 6
- **parent_id**: 1
- **path**: "1/6"
- **level**: 2
- **display_order**: 2

#### L2: その他申請
- **id**: 7
- **parent_id**: 1
- **path**: "1/7"
- **level**: 2
- **display_order**: 3

---

### L1: 開発系
- **id**: 8
- **path**: "8"
- **level**: 1
- **display_order**: 2

#### L2: API開発
- **id**: 9
- **parent_id**: 8
- **path**: "8/9"
- **level**: 2
- **display_order**: 1

#### L2: データベース設計
- **id**: 10
- **parent_id**: 8
- **path**: "8/10"
- **level**: 2
- **display_order**: 2

#### L2: フロントエンド開発
- **id**: 11
- **parent_id**: 8
- **path**: "8/11"
- **level**: 2
- **display_order**: 3

#### L2: デプロイ・運用
- **id**: 12
- **parent_id**: 8
- **path**: "8/12"
- **level**: 2
- **display_order**: 4

#### L2: テスト
- **id**: 13
- **parent_id**: 8
- **path**: "8/13"
- **level**: 2
- **display_order**: 5

#### L2: コードレビュー
- **id**: 14
- **parent_id**: 8
- **path**: "8/14"
- **level**: 2
- **display_order**: 6

#### L2: その他
- **id**: 15
- **parent_id**: 8
- **path**: "8/15"
- **level**: 2
- **display_order**: 7

---

### L1: 総務・人事系
- **id**: 16
- **path**: "16"
- **level**: 1
- **display_order**: 3

#### L2: 入退社手続き
- **id**: 17
- **parent_id**: 16
- **path**: "16/17"
- **level**: 2
- **display_order**: 1

#### L2: 福利厚生
- **id**: 18
- **parent_id**: 16
- **path**: "16/18"
- **level**: 2
- **display_order**: 2

#### L2: その他
- **id**: 19
- **parent_id**: 16
- **path**: "16/19"
- **level**: 2
- **display_order**: 3

---

### L1: 営業・マーケティング系
- **id**: 20
- **path**: "20"
- **level**: 1
- **display_order**: 4

#### L2: 営業プロセス
- **id**: 21
- **parent_id**: 20
- **path**: "20/21"
- **level**: 2
- **display_order**: 1

#### L2: マーケティング施策
- **id**: 22
- **parent_id**: 20
- **path**: "20/22"
- **level**: 2
- **display_order**: 2

---

### L1: 財務・経理系
- **id**: 23
- **path**: "23"
- **level**: 1
- **display_order**: 5

#### L2: 会計処理
- **id**: 24
- **parent_id**: 23
- **path**: "23/24"
- **level**: 2
- **display_order**: 1

#### L2: 予算管理
- **id**: 25
- **parent_id**: 23
- **path**: "23/25"
- **level**: 2
- **display_order**: 2

---

### L1: その他
- **id**: 26
- **path**: "26"
- **level**: 1
- **display_order**: 6

## データ投入時の注意事項

- すべてのジャンルは`is_active = True`で投入
- `created_at`は現在時刻を使用
- IDは自動採番だが、初期データ投入時は明示的に指定（既存データとの整合性のため）

## 今後の拡張

- 実際の運用に合わせてジャンルを追加・変更可能
- Alembicマイグレーションで管理
- 必要に応じてL4、L5階層も追加可能

