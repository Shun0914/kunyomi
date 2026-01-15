# Azure App Service 環境変数設定手順

このドキュメントでは、Azure App Serviceに環境変数を設定する手順を説明します。

---

## 前提条件

- Azure Portal にアクセスできること
- Azure App Serviceリソースが既に作成されていること
- データベース接続情報が準備できていること

---

## 設定する環境変数

### バックエンド（FastAPI）用

| 環境変数名 | 値 | 説明 |
|----------|-----|------|
| `DATABASE_URL` | `mysql+pymysql://{username}:{password}@{host}.mysql.database.azure.com:3306/{database_name}` | データベース接続文字列 |

**重要**: パスワードに特殊文字が含まれる場合は、URLエンコードが必要な場合があります。

---

## 手順: Azure Portalで環境変数を設定

### Step 1: App Serviceリソースを開く

1. [Azure Portal](https://portal.azure.com/) にログイン
2. 左側のメニューから **「App Services」** を選択
3. 設定したいApp Serviceリソースをクリック

### Step 2: 設定画面を開く

1. App Serviceの左側メニューで **「設定」** セクションを展開
2. **「構成」** をクリック

### Step 3: アプリケーション設定を追加

1. **「+ 新しいアプリケーション設定」** ボタンをクリック
2. 以下の情報を入力：
   - **名前**: `DATABASE_URL`
   - **値**: 
     ```
     mysql+pymysql://{username}:{password}@{host}.mysql.database.azure.com:3306/{database_name}
     ```
     **注意**: `{username}`, `{password}`, `{host}`, `{database_name}` を実際の値に置き換えてください。
   - **デプロイ スロット設定**: 通常はチェックなし（必要に応じて設定）
3. **「OK」** をクリック

### Step 4: 設定を保存

1. 画面の上部にある **「保存」** ボタンをクリック
2. **「続行」** をクリックして確認
3. 保存が完了するまで待機（数秒〜1分程度）

**重要**: 設定を保存すると、App Serviceが自動的に再起動されます。

---

## 設定の確認方法

### 方法1: Azure Portalで確認

1. App Serviceの **「設定」→「構成」** を開く
2. **「アプリケーション設定」** タブを確認
3. `DATABASE_URL` が表示されていることを確認

### 方法2: App Serviceのログで確認（非推奨）

**注意**: セキュリティ上、環境変数の値（特にパスワード）をログに出力しないようにしてください。

---

## トラブルシューティング

### 設定が反映されない

**原因**: App Serviceが再起動されていない

**解決方法**:
1. 設定を保存した後、数分待つ
2. App Serviceの **「概要」→「再起動」** をクリックして手動で再起動

### データベース接続エラーが発生する

**原因**: 接続文字列が間違っている、またはファイアウォールルールが設定されていない

**解決方法**:
1. 接続文字列の値が正しいか確認（ユーザー名、パスワード、ホスト、データベース名）
2. Azure Database for MySQLのファイアウォールルールを確認
   - App Serviceの **「設定」→「プロパティ」** で **「送信 IP アドレス」** を確認
   - MySQLサーバーの **「設定」→「ネットワーク」** で、App ServiceのアウトバウンドIPアドレスが許可されているか確認

### パスワードに特殊文字が含まれる場合

パスワードに `@`, `#`, `%`, `&` などの特殊文字が含まれる場合は、URLエンコードが必要です。

**例**:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`

パスワードに特殊文字が含まれない場合は、そのまま使用できます。

---

## 次のステップ

環境変数の設定が完了したら：

1. **データベースマイグレーションの実行**（Alembic）
2. **初期データの投入**（ジャンルマスターなど）
3. **アプリケーションの動作確認**

詳細は [Azure App Service デプロイ手順](./azure_deployment.md) を参照してください。

---

## 参考リンク

- [Azure App Service アプリ設定の構成](https://learn.microsoft.com/ja-jp/azure/app-service/configure-common)
- [環境変数の管理](https://learn.microsoft.com/ja-jp/azure/app-service/configure-common#configure-app-settings)

