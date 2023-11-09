# Git

## gitコマンド

### リポジトリの作成

```bash
git init # ローカルリポジトリの初期化
git remote add origin {GithubのURL} # リモートリポジトリとの紐付け
git push -u origin main
```

### ブランチの作成と切り替え

```bash
git branch # ブランチの一覧を表示
git branch {ブランチ名} # ブランチの作成（現在のブランチから派生）
git branch {新ブランチ名} {派生元ブランチ名} # ブランチの作成（指定したブランチから派生）

git switch {ブランチ名} # ブランチの切り替え
git switch -c {ブランチ名} # ブランチを作成し、切り替え
git switch -c {新ブランチ名} {派生元ブランチ名} # 指定したブランチから派生して、ブランチを作成し、切り替え
```

### ブランチの差分を取る

```bash
git diff {ブランチ名A} {ブランチ名B} # ローカルブランチの比較
git diff origin/{ブランチ名A} {ブランチ名B} # リモートブランチとの比較
git diff origin/{ブランチ名A} {ブランチ名B} --shortstat # 更新行数を表示
```

### リモートURLの変更

```bash
git remote -v # 現在のリモートURLを確認
git remote set-url origin {新 URL} # リモートURLの変更
```

### patchの作成と適用

```bash
git diff > {patchファイル名} # patchの作成
git diff HEAD^~1 > {patchファイル名} # コミットの範囲を指定して差分をとり、patchを作成
patch -p1 < {patchファイル名} # patchの適用
```

## コミットメッセージ

私は、コミットメッセージを以下のように書く。
これは、何を行ったのかがわかりやすければ何でもいい。

*フォーマット: `<Type（必須）>: <Emoji> #<Issue Number（必須）> <Title（必須）>`*

*例）`feat: :sparkles: #123 ログイン機能の実装をする`*

*→ `feat: ✨ #123 ログイン機能の実装をする`*

### Type 一覧

- **chore**: タスクファイルなどプロダクションに影響のない修正
- **docs**: ドキュメントの更新
- **feat**: ユーザー向けの機能の追加や変更
- **fix**: ユーザー向けの不具合の修正
- **refactor**: リファクタリングを目的とした修正
- **style**: フォーマットなどのスタイルに関する修正
- **test**: テストコードの追加や修正
- **config**: 構成変更

## Githubの設定

### Features

- Discussion **有効**

GitHub上で課題などについて、メンバと議論するための機能

GitHub Discussionsでは、仕様や処理方式などの議論、方針決めを行い、GitHub Issuesでは、方針決定後の作業の管理・分類を行うために使う。

### Pull Request

- Allow rebase merging **無効**

merge commitではなくrebaseされる

- Always suggest updating pull request branches **有効**

Pull Request作成後に、ベースブランチが更新された場合、ソースブランチの更新を提案してくれる

- Automatically delete head branches **有効**

Pull Requestをマージすると、ソースブランチを自動的に削除

### Pushes

- Limit how many branches and tags can be updated in a single push **有効**

複数のブランチが一度のpushでまとめて更新される場合、ブロックする機能

### Code Review Limits

- Limit to users explicitly granted read or higher access **有効**

Pull Requestの「承認」「変更要求」を明示的に許可したユーザだけが行えるようにする

## Github Actions

*.github/workflows/{YAMLファイル}* に、GitHub Actions で実行するワークフローを定義する。

```yaml
name: CI

on:
  push:
    branches:
      - main

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        
      - name: Setup
        uses: actions/setup-go@v2
        with:
          go-version: ^1.18

  test:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Test
        run: cd week2/app && go test

  docker-build-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v1
        
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v1

      - name: Login to DockerHub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v2
        with:
          context: week2/app/
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/security-minicamp-22-sample-app:${{ github.sha }}
```
