# コンテナ技術

## コンテナ技術とは

### VM型仮想化との違い

コンピュータシステムにおけるリソースを**コンテナ**と呼ばれる単位で分割し、仮想化する技術のことを指す。

これにより、OSは同じでも複数の独立したアプリケーション実行環境を作成することができる。

コンテナ型仮想化は専用のゲストOSを持たないため、ホストOSのカーネルを共有するという特徴がある。

したがって、別のOSのマシンを動かすには、VM型仮想化を用いる必要がある。

|           | 仮想マシン（VM） | コンテナ                      |
|-----------| -------------- | ---------------------------  |
|  起動時間  |      遅い       | **早い**                      |
|  リソース  |      多い       | **少ない**                    |
|  集積密度  |      低い       | **高い**                      |
| 分離レベル |      **高い**   | 場合による（コンテナの実装に依存） |

![VM型仮想化とコンテナ型仮想化の比較](https://moz-security.me/Note/image/container/compare_vm_container.png)

### コンテナランタイム

Docker は以下のフローでコンテナを作成する。

1. Docker client が dockerd の REST API に対して、リクエスト（コマンド）を送信する。
2. dockerd は containerd といった High-level Runtime に対して、gRPC経由で実行すべきコンテナの情報を伝える。
3. containerd は runC といったLow-level Runtime に対して、JSON形式で、コンテナの情報を伝える。
4. Low-level Runtime は、コンテナを実行する。

もし コンテナランタイムがHigh-level Runtime と Low-level Runtime に分かれていなければ、クライアントからのリクエストの受付からコンテナイメージの管理、実行コンテナの管理、コンテナの起動といった全てを行うものになってしまい、好ましくないアーキテクチャになる。

そこで、以下の２つのランタイムに分けている。

#### 1. High-level Runtime (CRI Runtime)

クライアントからのリクエストの受付やコンテナイメージの管理、Low-level Runtime に対するコンテナの実行依頼などを行う。

- containerd
- CRI-O

#### 2. Low-level Runtime (OCI Runtime)

OSの機能を利用して、コンテナを実行する責務を担当する。
初期実装は、runC だが、脆弱性がいくつか見つかり、かつ特権コンテナを実行できてしまうなどの問題があったため、runCをベースにした新しい実装が登場した。

- runC
- gVisor (Google): gVisorプロセスがゲストカーネルを展開
- Firecracker (AWS): **microVM**を採用
- Kata Containers
- Nabla Containers (IBM): **Unikernel**を採用

![コンテナランタイムの構成](https://moz-security.me/Note/image/container/container_runtime.png)

## コンテナの仕組みと要素技術

### レイヤ構造

ファイルシステムに対して、変更された差分を**レイヤ**として扱い、それを一つにまとめたものがコンテナイメージである。
ファイルシステムの変更差分は、tar形式で保存されており、コンテナ作成時に各レイヤを重ね合わせる。

### Linuxのコンテナ関連技術

各技術は、Linuxのカーネルに実現されているため、`$ man namespaces` などで詳細を確認できる。

1. **Namespaces**

    さまざまなリソースを分離する。
    Linux 5.6 以降では、**Cgroup**, **IPC**, **Network**, **Mount**, **PID**, **Time**, **User**, **UTS** の8つのリソースを分離することができる。

    ```bash
    lsns # Namespaces 一覧を確認
    ```

    特定のプロセスがどの Namespace に属しているかは、`/proc/[PID]/ns` で確認できる。

2. **Capabilities**

    権限を細分化して、プロセスに付与する。

    例）1024番未満ポートは特権が必要 → CAP_NET_BIND_SERVICE というケーパビリティを付与するだけ

    ```bash
    getpcaps # どのような権限が付与されているか確認
    ```

3. **Cgroups**

    プロセスをグループ化して、そのグループに対してリソースの使用量を制限する。

    管理するリソースの種類を**サブシステム**と呼び、`/sys/fs/cgroup/cgroup.controllers` に利用できるサブシステムが記述されている。

4. **Seccomp**

    システムコールを制限する。

    Docker では、デフォルトで危険なシステムコールを制限している。[[1]](https://docs.docker.com/engine/security/seccomp/)

    Mode1: read, write, exit, sigreturn の 4つのみシステムコール制限が可能

    Mode2: (BPFにより)任意のシステムコール制限が可能 (Docker では、Mode2を採用)

5. **LSM(Linux Security Module)**

    MAC(Mandatory Access Control：強制アクセス制御)を提供する。

    プロセスに対して、アクセス制御を行う。

    **AppArmor(Ubuntu, Debian)** や **SELinux(RedHat, CentOS)** などといった実装がある。

    例）`/etc/apparmor.d/docker` に、Dockerコンテナに対するアクセス制御の設定が記述されており、仮に脆弱性をついてバイパスしてきても、AppAmorによってアクセスは制限される。
