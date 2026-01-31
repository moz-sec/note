---
title: Container Runtime
---

Docker は以下のフローでコンテナを作成する。

1. Docker client が dockerd の REST API に対して、リクエスト（コマンド）を送信する。
2. dockerd は containerd といった High-level Runtime に対して、gRPC経由で実行すべきコンテナの情報を伝える。
3. containerd は runC といったLow-level Runtime に対して、JSON形式で、コンテナの情報を伝える。
4. Low-level Runtime は、コンテナを実行する。

もし、コンテナランタイムがHigh-level Runtime と Low-level Runtime に分かれていなければ、クライアントからのリクエストの受付からコンテナイメージの管理、実行コンテナの管理、コンテナの起動といった全てを行うものになってしまい、好ましくないアーキテクチャになる。

そのため、２つのランタイムに分けている。

## 1. High-level Runtime (CRI Runtime)

クライアントからのリクエストの受付やコンテナイメージの管理、Low-level Runtime に対するコンテナの実行依頼などを行う。

- containerd
- CRI-O

## 2. Low-level Runtime (OCI Runtime)

OSの機能を利用して、コンテナを実行する責務を担当する。
初期実装は、runC だが、脆弱性がいくつか見つかり、かつ特権コンテナを実行できてしまうなどの問題があったため、runCをベースにした新しい実装が登場した。

- runC
- gVisor (Google): gVisorプロセスがゲストカーネルを展開
- Firecracker (AWS): **microVM**を採用
- Kata Containers
- Nabla Containers (IBM): **Unikernel**を採用

![コンテナランタイムの構成](https://moz-security.me/Note/image/container/container_runtime.png)

### gVisor

インストール方法は[こちら](https://gvisor.dev/docs/user_guide/install/)

以下のように、**--runtime=runsc**とすることで、gVisorを使うことができる。

```bash
docker run --rm -it --runtime=runsc ubuntu:20.04
```

### Sysbox

インストール方法は[こちら](https://github.com/nestybox/sysbox/blob/master/docs/user-guide/install-package.md#sysbox-user-guide-installation-with-the-sysbox-package)

以下のように、**--runtime=sysbox-runc**とすることで、Sysboxを使うことができる。

```bash
docker run --rm -it --rumtime=sysbox-runc ubuntu:20.04
```

### Kata Containers

```bash
wget https://github.com/kata-containers/kata-containers/releases/download/3.8.0/kata-static-3.8.0-arm64.tar.xz
sudo tar xJf kata-static-3.8.0-arm64.tar.xz -C /
```
