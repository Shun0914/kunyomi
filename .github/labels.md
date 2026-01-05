# ラベル一覧

## カテゴリ
- `frontend` - フロントエンド関連のIssue/PR
- `backend` - バックエンド関連のIssue/PR
- `documentation` - ドキュメント関連のIssue/PR

## 種類
- `task` - 開発タスク
- `bug` - バグ報告
- `enhancement` - 機能追加・改善

## 優先度（必要に応じて使用）
- `high-priority` - 優先度が高いタスク
- `low-priority` - 優先度が低いタスク

## 使い方
- IssueやPRを作成する際に、適切なラベルを付ける
- ラベルでフィルタリングして、関連するIssue/PRを探せる
- **ステータス管理はProjectsのカンバンボードで行う**

## ラベルの設定方法
GitHubのWeb UIで設定するか、以下のコマンドで一括作成：

```bash
# GitHub CLIが必要
gh label create frontend --color 0E8A16 --description "フロントエンド関連"
gh label create backend --color 1D76DB --description "バックエンド関連"
gh label create documentation --color 0052CC --description "ドキュメント関連"
gh label create task --color 7057FF --description "開発タスク"
gh label create bug --color D73A4A --description "バグ報告"
gh label create enhancement --color A2EEEF --description "機能追加・改善"
gh label create high-priority --color B60205 --description "優先度が高い"
gh label create low-priority --color FBCA04 --description "優先度が低い"
```

