# コンテナ技術

## コンテナ技術とは

コンピュータシステムにおけるリソースを**コンテナ**と呼ばれる単位で分割し、仮想化する技術のことを指す。

VM型仮想化と比較して、コンテナ型仮想化は専用のゲストOSを持たないため、ホストOSのカーネルを共有するという特徴がある。

**そのため、コンテナ型仮想化はVM型仮想化に比べて、より軽量で高速に動作する。**

## コンテナランタイム

Docker は以下のフローでコンテナを実行する。

1. Docker client が dockerd の REST API に対して、リクエスト（コマンド）を送信する。
2. dockerd は **<Containerd, CRI-O, Flakti>** といった High-level Runtime に対して、gRPC経由で実行すべきコンテナの情報を伝える。
3. High-level Runtime は **<runc, runsc(gVisor), Kata Containers, runnc(Nabla Containers)>** といったLow-level Runtime に対して、JSON形式で、コンテナの情報を伝える。
4. Low-level Runtime は、コンテナを実行する。

もし High-level Runtime と Low-level Runtime に分かれていなければ、クライアントからのリクエストの受付からコンテナイメージの管理、実行コンテナの管理、コンテナの起動といった全てを行うものになってしまい、作業の分離という観点において、好ましくないアーキテクチャになる。

そこで、**High-level Runtime (CRI Runtime)** では、クライアントからのリクエストの受付やコンテナイメージの管理、Low-level Runtime に対するコンテナの実行依頼などを行う。

一方の、**Low-level Runtime (OCI Runtime)** では、OSの機能を利用して、コンテナを実行する責務を担当する。

## CI/CD

CI/CD とは、**Continuous Integration** と **Continuous Delivery** の略で、ソフトウェア開発におけるプロセスの一つである。

これを行うことで、手作業によるミスを防ぐことができる。

**CI(Continuous Integration)** では、アプリケーションの実装が終わるたびに、自動でテストやイメージビルドを行う。

**CD(Continuous Delivery)** では、CI でビルドしたイメージを、自動で実行環境にデプロイする。
