# DNS

## DNSコンテンツサーバ

権威サーバとも呼ばれ、自身の管理するドメインに関する情報を提供する。

## DNSキャッシュサーバ

リゾルバとも呼ばれ、DNSコンテンツサーバから情報を取得し、キャッシュする。

### unbound

DNSキャッシュサーバではあるが、簡易的なコンテンツサーバとしても利用できるため、LAN（自宅ネットワーク）内のホストの名前解決にも利用できる。

```bash
sudo apt update
sudo apt install -y unbound
sudo systemctl status unbound
```

```bash
```
