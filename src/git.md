# Git

## 基本コマンド

```bash
git init # ローカルリポジトリの初期化
git remote add origin {GithubのURL} # リモートリポジトリとの紐付け
git push -u origin main
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

### 参考

## Github リポジトリ

リポジトリの設定は、基本的に以下のようにする。

### Features

1. **Discussion 有効**

    GitHub上で課題などについて、メンバと議論するための機能

   - GitHub Discussions： 仕様や処理方式などの議論、方針決め
   - GitHub Issues: 方針決定後の作業の管理・分類

### Pull Request

2. **Allow rebase merging 無効**

    merge commitではなくrebaseされる

3. **Always suggest updating pull request branches 有効**

    Pull Request作成後に、ベースブランチが更新された場合、ソースブランチの更新を提案してくれる

4. **Automatically delete head branches 有効**

    Pull Requestをマージすると、ソースブランチを自動的に削除

### Pushes

5. **Limit how many branches and tags can be updated in a single push 有効**

    複数のブランチが一度のpushでまとめて更新される場合、ブロックする機能

### Code Review Limits

6. **Limit to users explicitly granted read or higher access 有効**

    Pull Requestの「承認」「変更要求」を明示的に許可したユーザだけが行えるようにする

## Github Actions

.github/workflows/{YAMLファイル} に、GitHub Actions で実行するワークフローを定義する。

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
