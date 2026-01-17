# Azure Database for MySQL セットアップ手順

このドキュメントでは、Azure Database for MySQLのリソース作成からデータベースセットアップまでの手順を説明します。

## 前提条件

- Azure サブスクリプションがあること
- Azure Portal にアクセスできること
- Azure App Serviceが既に作成されていること（ファイアウォールルール設定に必要）

---

## 1. Azure Database for MySQL リソースの作成

### 1.1. Azure Portalでのリソース作成

1. [Azure Portal](https://portal.azure.com/) にログイン
2. リソースの作成 → 「Azure Database for MySQL」を検索
3. **「単一サーバー」または「フレキシブルサーバー」** を選択
   - **推奨**: フレキシブルサーバー（より柔軟な設定が可能）
   - **注意**: 単一サーバーは将来廃止予定

### 1.2. 基本設定

#### 基本タブ
- **サブスクリプション**: 使用するサブスクリプションを選択
- **リソースグループ**: 既存のリソースグループまたは新規作成
  - App Serviceと同じリソースグループを使用することを推奨
- **サーバー名**: 一意の名前（例: `kunyomi-mysql-server`）
- **リージョン**: App Serviceと同じリージョンを選択（通信レイテンシーを最小化）
- **MySQL バージョン**: 8.0 を推奨
- **ワークロード タイプ**: 「開発/テスト」または「本番環境」を選択
- **コンピューティング + ストレージ**: 
  - **開発/テスト**: B1ms（1 vCore、2GB RAM）程度でOK
  - **本番環境**: 要件に応じて調整（B2s以上推奨）

#### ネットワークタブ
- **接続方法**: 
  - **パブリック アクセス**: App Serviceからの接続に必要
  - **プライベート アクセス**: より安全だが、設定が複雑
- **ファイアウォール規則**: 
  - **「Azure サービスにアクセスを許可」**: ✅ チェック
  - **ルール**: 後でApp ServiceのアウトバウンドIPアドレスを追加（手順2参照）

#### セキュリティタブ
- **管理者ログイン名**: サーバー管理者のユーザー名（例: `kunyomiadmin`）
- **パスワード**: 強力なパスワードを設定
  - **重要**: パスワードは安全な場所に保存（後で接続文字列作成に必要）

#### 確認および作成
- 設定を確認し、「作成」をクリック
- デプロイ完了まで数分かかります（5-10分程度）

---

## 2. ファイアウォールルールの設定

### 2.1. App ServiceのアウトバウンドIPアドレスの確認

1. Azure Portalで **App Service** リソースを開く
2. **「設定」→「プロパティ」** を選択
3. **「送信 IP アドレス」** を確認（複数ある場合は全て）

### 2.2. ファイアウォールルールの追加

1. Azure Portalで **Azure Database for MySQL** リソースを開く
2. **「設定」→「ネットワーク」** を選択
3. **「ファイアウォール規則」** タブで以下を追加：
   - **ルール名**: `AppService-Outbound-IP-1` など
   - **開始 IP アドレス**: App ServiceのアウトバウンドIPアドレス（最初の1つ）
   - **終了 IP アドレス**: 同じアドレス
4. App ServiceのアウトバウンドIPアドレスが複数ある場合は、それぞれ追加
5. **「保存」** をクリック

**注意**: 一時的にローカルから接続テストする場合は、一時的に自分のIPアドレスも追加可能ですが、**テスト完了後は必ず削除**してください。

---

## 3. データベースの作成

### 3.1. 接続文字列の取得

1. Azure Portalで **Azure Database for MySQL** リソースを開く
2. **「設定」→「接続文字列」** を選択
3. **「ADO.NET」** タブから接続文字列をコピー
   - 形式: `Server=kunyomi-mysql-server.mysql.database.azure.com;Port=3306;Database={your_database};Uid={your_username};Pwd={your_password};`

### 3.2. MySQL コマンドラインまたはツールで接続

#### オプション1: Azure Cloud Shellから接続
1. Azure Portalの上部にある **Cloud Shell** アイコンをクリック
2. **Bash** を選択
3. 以下のコマンドで接続：

```bash
mysql -h kunyomi-mysql-server.mysql.database.azure.com -u kunyomiadmin -p
```

パスワードを入力後、MySQLコマンドラインが起動します。

#### オプション2: ローカルMySQLクライアントから接続
- **MySQL Workbench**、**DBeaver**、**TablePlus** などのツールを使用
- 接続情報:
  - **ホスト**: `kunyomi-mysql-server.mysql.database.azure.com`
  - **ポート**: `3306`
  - **ユーザー名**: サーバー管理者名（例: `kunyomiadmin`）
  - **パスワード**: 設定したパスワード

### 3.3. データベースの作成

MySQLコマンドラインまたはツールで以下を実行：

```sql
CREATE DATABASE {database_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
```

**確認**: 作成したデータベース名がリストに表示されればOK

---

## 4. 接続文字列の構築（Python/FastAPI用）

SQLAlchemy（PyMySQL）用の接続文字列形式：

```
mysql+pymysql://{username}:{password}@{server_name}.mysql.database.azure.com:3306/{database_name}
```

**例**:
```
mysql+pymysql://kunyomiadmin:YourPassword@kunyomi-mysql-server.mysql.database.azure.com:3306/kunyomi_db
```

**重要**: 
- パスワードに特殊文字が含まれる場合は、URLエンコードが必要な場合があります
- この接続文字列は **Azure App Serviceの環境変数** として設定します（後続手順参照）

---

## 5. 接続テスト（オプション）

ローカル環境から接続をテストする場合：

### 5.1. 一時的なファイアウォールルールの追加
1. Azure PortalでMySQLサーバーの **「ネットワーク」** を開く
2. 現在のIPアドレスを追加（「現在のクライアントIPアドレスを追加」をクリック）
3. 保存

### 5.2. ローカル環境での接続テスト

```bash
cd backend
# .envファイルに接続文字列を設定（一時的）
echo "DATABASE_URL=mysql+pymysql://{username}:{password}@{host}.mysql.database.azure.com:3306/{database_name}" > .env
```
**注意**: `{username}`, `{password}`, `{host}`, `{database_name}` を実際の値に置き換えてください。

# 仮想環境をアクティベート
source venv/bin/activate

# 接続テスト（Pythonスクリプト）
python -c "from app.db import engine; from sqlalchemy import text; conn = engine.connect(); result = conn.execute(text('SELECT 1')); print('Connection OK!' if result.fetchone() else 'Connection Failed'); conn.close()"
```

**成功例**:
```
Connection OK!
```

### 5.3. 一時的なファイアウォールルールの削除
1. Azure PortalでMySQLサーバーの **「ネットワーク」** を開く
2. 追加した自分のIPアドレスのルールを削除
3. 保存

---

## 6. 次のステップ

データベースセットアップが完了したら、以下を実施：

1. **Azure App Serviceの環境変数設定**（`DATABASE_URL`を設定）
2. **データベースマイグレーションの実行**（Alembicを使用）
3. **初期データの投入**（ジャンルマスターなど）

詳細は [Azure App Service デプロイ手順](./azure_deployment.md) を参照してください。

---

## トラブルシューティング

### 接続エラー: `Can't connect to MySQL server`

**原因**: ファイアウォールルールが正しく設定されていない

**解決方法**:
- App ServiceのアウトバウンドIPアドレスがファイアウォールルールに追加されているか確認
- 「Azure サービスにアクセスを許可」が有効になっているか確認

### 接続エラー: `Access denied for user`

**原因**: ユーザー名またはパスワードが間違っている

**解決方法**:
- 接続文字列のユーザー名とパスワードを確認
- パスワードに特殊文字が含まれる場合は、URLエンコードが必要な場合があります

### データベースが見つからない: `Unknown database`

**原因**: データベースが作成されていない

**解決方法**:
- MySQLコマンドラインまたはツールでデータベースを作成（手順3参照）

---

## 参考リンク

- [Azure Database for MySQL 公式ドキュメント](https://learn.microsoft.com/ja-jp/azure/mysql/)
- [FastAPI + Azure App Service デプロイガイド](https://learn.microsoft.com/ja-jp/azure/app-service/quickstart-python)
- [SQLAlchemy 接続文字列の形式](https://docs.sqlalchemy.org/en/20/core/engines.html#database-urls)

