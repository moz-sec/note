# eBPF

## Setup

[bcc/INSTALL.md](https://github.com/iovisor/bcc/blob/master/INSTALL.md#kernel-configuration)と[Kernelnewbies:KernelBuild](https://kernelnewbies.org/KernelBuild) に従う。

カーネルコンフィグレーションは、`make oldconfig`で既存の設定を引き継ぎ、一部設定を変更する。

```bash
sudo apt-get install libncurses5-dev gcc make git exuberant-ctags bc libssl-dev

curl -O https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.7.9.tar.xz
tar Jxvf linux-6.7.9.tar.xz

cd linux-6.7.9
make oldconfig
vim .config
    CONFIG_BPF=y
    CONFIG_BPF_SYSCALL=y
    # [optional, for tc filters]
    CONFIG_NET_CLS_BPF=m
    # [optional, for tc actions]
    CONFIG_NET_ACT_BPF=m
    CONFIG_BPF_JIT=y
    # [for Linux kernel versions 4.1 through 4.6]
    CONFIG_HAVE_BPF_JIT=y
    # [for Linux kernel versions 4.7 and later]
    CONFIG_HAVE_EBPF_JIT=y
    # [optional, for kprobes]
    CONFIG_BPF_EVENTS=y
    # Need kernel headers through /sys/kernel/kheaders.tar.xz
    CONFIG_IKHEADERS=y

make -j`nproc`
sudo make modules_install
sudo make install

sudo reboot
uname -r
```

カーネルバージョンが変わっていることを確認し、BCCをインストールする。

```bash
# For Jammy (22.04)
sudo apt install -y zip bison build-essential cmake flex git libedit-dev \
  libllvm14 llvm-14-dev libclang-14-dev python3 zlib1g-dev libelf-dev libfl-dev python3-setuptools \
  liblzma-dev libdebuginfod-dev arping netperf iperf

git clone https://github.com/iovisor/bcc.git
mkdir bcc/build; cd bcc/build
cmake ..
make
sudo make install
cmake -DPYTHON_CMD=python3 .. # build python3 binding
pushd src/python/
make
sudo make install
popd
```
