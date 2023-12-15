# Kubernetes

## 環境構築

### ツールのインストール

マスター・ワーカーに関わらず，全てのノードに kubectl, kubeadm, kubelet をインストールする．
[1] に従って，インストールを行う．

```bash
sudo swapoff -a

sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gpg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

k8sに必要なコンテナランタイムをインストールする．
今回は，containerd を使用する．
[2] [3] に従って，インストールを行う．

```bash
# Ubuntu
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
# Debian
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y containerd.io
```

コンテナランタイムやカーネルモジュール，カーネルパラメータの設定を行う．
[4] に従って，設定の変更を行う．

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system

containerd config default > /etc/containerd/config.toml
vim /etc/containerd/config.toml
    [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
    ・・・
    [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
      SystemdCgroup = true
```

### マスターノードの設定

マスターノードの設定を行う．
[5] に従って，設定を行う．

```bash
kubeadm config images pull
sudo kubeadm init --pod-network-cidr=192.168.10.0/24
```

### ワーカーノードの設定

マスターノードの設定を行った際に，出力されたコマンドを入力する．

```bash
kubeadm join <control-plane-host>:<control-plane-port> --token <token> --discovery-token-ca-cert-hash sha256:<hash>
```

### ネットワークプラグインの設定

ネットワークプラグインの設定を行う．
[6] に従って，設定を行う．

```bash
helm repo add cilium https://helm.cilium.io/
helm install cilium cilium/cilium --version 1.14.5 --namespace kube-system
```

### 確認

全てのノードとポッドが正常に動作しているか確認する．

```bash
kubectl get nodes -A -o wide
kubectl get pods -A -o wide
```

## 参考

1. [kubeadm install](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)
2. [containerd install Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
3. [containerd install Debian](https://docs.docker.com/engine/install/debian/)
4. [kubernetes Container Runtime](https://kubernetes.io/docs/setup/production-environment/container-runtimes/#cgroup-drivers)
5. [kubeadm init](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)
6. [cilium install](https://docs.cilium.io/en/stable/installation/k8s-install-kubeadm/#installation-using-kubeadm)
