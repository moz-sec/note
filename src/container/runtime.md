# Container Runtime

## low-level container runtime

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
