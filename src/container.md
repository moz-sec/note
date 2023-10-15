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

各技術は、Linuxのカーネルに実現されているため、`$ man namespaces` や `$ man cgroup` などで詳細を確認できる。

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

### Linux機能でコンテナを作成する

以下のステップでコンテナを作成する。

1. 各種 Namespace を作成する。
2. ルートディレクトリを変更する。
3. cgroups でリソース制限を行う。
4. AppArmor

#### Namespaceの分離

Namespace の分離には、Linux コマンドの `clone(2)` または `unshare(2)` を用いる。

Linux Namespace は 以下のコマンドで確認できる。
また、`/proc/[PID]/ns` で、特定のプロセスがどの Namespace に属しているかを確認できる。

```bash
lsns # Namespaces 一覧を確認
```

Namespace の分離は以下のようにして行う。

```bash
unshare -imnpuC --fork /bin/bash
# -i: IPC Namespace の分離
# -m: Mount Namespace の分離
# -n: Network Namespace の分離
# -p: PID Namespace の分離
# -u: UTS Namespace の分離
# -C: Cgroup Namespace の分離
```

UTS Namespace は、ホスト名やドメイン名を分離する。
ホスト名を変更しても、元のホスト名は変更されないことが確認できる。(`>`は namespace内、`$`はホスト側でコマンドの入力)

```bash
> hostname # ホスト名を確認

> hostname hoge # ホスト名を変更

> exit # namespace から抜ける

$ hostname # ホスト名を確認
```

PID Namespace は、プロセスIDを分離する。
しかし、プロセスIDを確認した場合に、ホストのプロセスIDが表示されてしまう。
これは、ホスト側の procfs がマウントされている状態で、コンテナ側からこれが見えてしまうからである。

```bash
ps aux # プロセスIDを確認
```

これは、以下のようにして、procfs を新たにマウントし直せばよい。(`>`はnamespace内、`$`はホスト側でコマンドの入力)

```bash
> mount -t proc proc /proc # namespace 内で新たに procfs をマウントする
# or
unshare -imnpuC --mount-proc --fork /bin/bash # unshare コマンドでマウントもできる
```

こうすることで、namespace 内のプロセスIDのみが表示される。

**特に、PID 1 が `/sbin/init` から `/bin/bash` に変わっていることが確認できる。**

#### ルートディレクトリの変更

ルートディレクトリを変更することで、コンテナ内のファイルシステムを分離する。
ファイルシステムは、何でもいいが、今回は、Alpine Linux のファイルシステムを利用する。
[Alpine Linux](https://alpinelinux.org/downloads/) の "MINI ROOT FILESYSTEM" から、`rootfs.tar.gz` をダウンロードし、展開する。

```bash
mkdir /mnt/alpine-rootfs && cd /mnt/alpine-rootfs
wget https://dl-cdn.alpinelinux.org/alpine/v3.18/releases/x86_64/alpine-minirootfs-3.18.4-x86_64.tar.gz
tar xvf alpine-minirootfs-3.18.4-x86_64.tar.gz
rm alpine-minirootfs-3.18.4-x86_64.tar.gz
```

ルートディレクトリを変更するには、`chroot(2)` または `pivot_root(2)` を用いる。
このコマンドを実行すると、子プロセスも対象にして、ルートディレクトリを変更できる。

これを `unshare` と組み合わせて使う。(`>`はnamespace内、`$`はホスト側でコマンドの入力)

```bash
$ unshare -imnpuC --fork chroot /mnt/alpine-rootfs /bin/sh

> mount -t proc proc /proc # namespace 内で新たに procfs をマウントする
```

`chroot` でもよいが、セキュリティ上の観点から `pivot_root`が使用されることが多い。
これは、`chroot` でルートディレクトリを変更したとしても、プロセスが *CAP_SYS_CHROOT ケーパビリティ* を持っていれば、元のルートディレクトリにアクセスできてしまうためである。

次のようなプログラムを用意してコンパイルし、chroot の中で実行すると、元のルートディレクトリにアクセスできてしまう。(`>`はnamespace内、`$`はホスト側でコマンドの入力`)

```c
#include <stdio.h>
#include <sys/stat.h>
#include <sys/types.h>

void main()
{
 mkdir("test",0);
 chroot("test");
 chroot("../../../../../../../../../../");
 execv("/bin/bash");
}
```

```bash
$ gcc -o jailbreak jailbreak.c
$ mv jailbreak /mnt/alpine-rootfs/bin

> /bin/jailbreak # jailbreak を実行
```

そこで、ここからは `pivot_root` を用いて、ルートディレクトリの変更を行う。

```bash
export NEW_ROOT=/mnt/alpine-rootfs
mkdir -p $NEW_ROOT/.put_old
unshare -imnpuC --fork sh -c \
    "mount --bind $NEW_ROOT $NEW_ROOT && \
    mount -t proc proc $NEW_ROOT/proc && \
    pivot_root $NEW_ROOT $NEW_ROOT/.put_old && \
    umount -l /.put_old && \
    cd / && \
    exec /bin/sh"
```

pivot_root で 作成した環境では、`jailbreak` を実行しても、元のルートディレクトリにアクセスできないことが確認できる。

#### cgroups でリソース制限

*/sys/fs/cgroup* 配下にディレクトリを作成し、制限したいサブシステムのファイルに必要な情報を書き込む。
今回は、プロセス数を制限する。ホスト側で実行することに注意する。

```bash
mkdir /sys/fs/cgroup/my-container
echo 30 > /sys/fs/cgroup/my-container/pids.max # プロセス数を30に制限
ps auxf # unshareで実行している /bin/sh のプロセスIDを確認
echo [pid_of_unshare_sh] > /sys/fs/cgroup/my-container/cgroup.procs # プロセスIDを指定
```

fork爆弾を実行して、検証してみる。(`>`はnamespace内、`$`はホスト側でコマンドの入力)

```bash
> bomb(){ bomb|bomb & };bomb # fork爆弾を実行
    /bin/sh: can not fork: Resource temporarily unavailable # 途中でforkできなくなる

$ cat /sys/fs/cgroup/my-container/pids.current # プロセス数を確認、30で頭打ちになっていることを確認
```

#### AppArmor で強制アクセス制御

まず、AppArmor のプロファイル作成を簡単にするためのツールをインストールする。

```bash
sudo apt install apparmor-notify apparmor-utils
```

次に、AppArmor のプロファイルを作成する。
`aa-easyprof` コマンドを用いて、プロファイルのテンプレートを作成する。
プロファイルは、`/etc/apparmor.d/` 配下に作成する。

作成したプロファイルは、`apparmor-parser`コマンドで有効になるが、この状態で my-container.sh を実行すると、Permission denied となる。
これは、AppArmorでまだどのリソースにもアクセスを許可していないからである。

```bash
sudo sh -c "aa-easyprof /home/moz/container/my-container.sh > /etc/apparmor.d/home.moz.container.my-container.sh"

sudo apparmor_parser -r /etc/apparmor.d/home.moz.container.my-container.sh # プロファイルを有効化
sudo ./my-container.sh
    ./my-container.sh: Permission denied # プロファイルによって、実行が制限されている
```

ここからは、`aa-logprof`を使って、プロファイルを修正する。(`>`はnamespace内、`$`はホスト側でコマンドの入力)
しかし、これでもまだ mountの部分で、Permission denied となる。

```bash
$ aa-complain my-container.sh # プロファイルを complain モードにする（リソースへのアクセスをブロックしない）
$ ./my-container.sh # 実行して、どのリソースにアクセスしようとしているかを確認する
> / exit # namespace から抜ける

$ aa-logprof # プロファイルを修正する（コンテナ作成に必要な権限を許可する）
$ aa-enforce my-container.sh # プロファイルを enforce モードにする（リソースへのアクセスをブロックする）
$ sudo ./my-container.sh
    unshare: cannot change root filesystem propagation: Permission denied
```

これは、AppArmor が、`/proc` に対して、`mount` を許可していないためである。
ログを確認して、手動でプロファイルを修正する。

```bash
cat /var/log/syslog
    ・・・ apparmor="DENIED" operation="mount" info="failed mntpnt match" error=-13 ・・・

cat /etc/apparmor.d/home.moz.container.my-container.sh # 最終的に以下のようになる
    include <tunables/global>

    # vim:syntax=apparmor
    # AppArmor policy for my-container.sh
    # ###AUTHOR###
    # ###COPYRIGHT###
    # ###COMMENT###
    # No template variables specified

    /home/shun/container/my-container.sh {
      include <abstractions/base>
      include <abstractions/consoles>
    
      mount,
      umount,
      pivot_root,

      capability sys_admin,
    
      /usr/bin/dash mrix,
      /usr/bin/unshare mrix,
      /usr/bin/mount mrix,
      /usr/bin/umount mrix,
      /usr/sbin/pivot_root mrix,
      /bin/busybox mrix,

      /home/shun/container/my-container.sh r,
      owner /etc/ld.so.cache r,
    }
```

これでコンテナは起動するが、コンテナ内で何も実行できない。
そこで、ルートディレクトリ配下は読み取り限定でアクセスでする。きるようにしつつ、セキュリティ的に危険のあるファイルへのアクセスを制限する。
今回は、`/proc/kcore` へのアクセスを拒否する。(`>`はnamespace内、`$`はホスト側でコマンドの入力)

```bash
$ cat /etc/apparmor.d/home.moz.container.my-container.sh
    include <tunables/global>

    /home/shun/container/my-container.sh {
      include <abstractions/base>
      include <abstractions/consoles>
    
      mount,
      umount,
      pivot_root,
      file,

      capability sys_admin,
    
      deny /bin/** wl,
      deny /boot/** wl,
      deny /dev/** wl,
      deny /etc/** wl,
      deny /home/** wl,
      deny /lib/** wl,
      deny /lib64/** wl,
      deny /media/** wl,
      deny /mnt/** wl,
      deny /opt/** wl,
      deny /proc/** wl,
      deny /root/** wl,
      deny /sbin/** wl,
      deny /srv/** wl,
      deny /tmp/** wl,
      deny /sys/** wl,
      deny /usr/** wl,
    
      deny @{PROC}/kcore rwklx,
    
      /home/shun/container/my-container.sh r,
      owner /etc/ld.so.cache r,
    }

$ sudo apparmor_parser -r /etc/apparmor.d/home.moz.container.my-container.sh
$ sudo ./my-container.sh
> cat /proc/kcore
    cat: can not open '/proc/kcore': Permission denied
```
