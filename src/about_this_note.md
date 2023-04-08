# このノートについて

このノートは、Markdown で書いて、Github を使って管理している。
また、リポジトリの情報が書き変わったら、Github Action で自動コンパイルを行い、Github Pages にデプロイして公開している。
コンパイルには、[mdbook](https://github.com/rust-lang/mdBook) というツールを使っている。

ここでは、このノートの環境構築をメモとして残そうと思う。

## 環境
**MacOS: 13.3**<br>
**cargo: 1.67.0**<br>
**mdbook: v0.4.28**<br>
**リポジトリ: [https://github.com/Kobayashi123/Note](https://github.com/Kobayashi123/Note)**<br>

## 1. Rust のインストール

私は、Rust が既に動くような環境だったため、このステップは飛ばした。
もし、Rust のセットアップがまだの場合は、[公式サイト(rust-lang.org)](https://www.rust-lang.org/tools/install) からインストールできる。

## 2. mdbook のインストール

mdbook のインストールは、Cargo を使って行う。
Cargo は、Rust のビルドシステム兼パッケージマネージャーであり、上記のように公式サイトから Rust をインストールした場合、既に使えるようになっている。

以下のコマンドを実行して、mdbook をインストールする。
これにより、```$ mdbook```でコマンドが使えるようになる。

```
$ cargo install mdbook
```

## 3. mdbook の雛形を作成する

mdbook の雛形を作成するには、以下のコマンドを実行する。

```
$ mdbook init
```

これで、以下のようなディレクトリ構成になる。

```
|-- book
|-- src
|   |-- SUMMARY.md
|   |-- chapter_1.md
|-- book.toml
```

*src/* の Markdownファイルを編集し、```$ mdbook build```を実行することで、*book/* に HTMLファイルが生成される。

## 4. Github に リポジトリを作成し、Github Pages を有効化する

Github に リポジトリを作成する。
今回は、[Note](https://github.com/Kobayashi123/Note) というリポジトリを作成し、```$ git push```を実行する。
その後、Github の Settings/Pages の Branch を None から main に変更することで、 Github Pages が有効になる。
同時に、Enforce HTTPS にチェックを入れることで、HTTPS に変更する。
これで、[https://Kobayashi123.github.io/Note/](https://Kobayashi123.github.io/Note/) でアクセスできるようになる。<br>

<img alt="github_pages_setting" src="image/about_this_pages/github_pages_setting.png" border="1">

## 5. ドメインを取得し、設定する

Namecheap でドメインを取得し、Github の Settings/Pages の Custom domain にドメインを設定する。<br>
これで、[https://kobayashi123.github.io/Note/](https://kobayashi123.github.io/Note/) だけでなく [https://moz-security.me/Note/](https://moz-security.me/Note/) でもアクセスできるようになる。<br>

<img alt="custom_domain_setting" src="image/about_this_pages/custom_domain_setting.png" border="1">

## 6. Github Action を設定する

Github の Settings/Pages の Source で Github Actions を選択する。
この設定により、Github の main ブランチが変更されるたびに、Github Action によって、```$ mdbook build``` が行われ、Github Pages にデプロイして公開してくれる。
Github Action の workflow は、[.github/workflows/mdbook.yml](https://github.com/Kobayashi123/Note/blob/main/.github/workflows/mdbook.yml) に記述してある。<br>

<img alt="github_action_setting" src="image/about_this_pages/github_action_setting.png" border="1">
