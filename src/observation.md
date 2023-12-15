# 監視

## Prometheus

[Prometheus](https://prometheus.io/)は、オープンソースのシステム監視・アラートツールである。

## Grafana

[Grafana](https://grafana.com/)は、オープンソースのデータ可視化ツールである。

## cAdvisor

Container監視には[cAdvisor](https://github.com/google/cadvisor)を使用する。

## Nginx

Prometheus と Grafana のダッシュボードを[Nginx](https://www.nginx.com/)でリバースプロキシする。

これにより、Prometheus と Grafana のポートを開ける必要がなくなり、加えて、HTTPS化も可能になる。

## 直接インストール

まずは、Prometheus をインストールする。

```bash
sudo apt install -y prometheus prometheus-node-exporter
```

```bash
sudo vim /etc/prometheus/prometheus.yml
```

```yaml

```

## 参考

- [サーバ監視基盤を作ってみた](https://docs.google.com/presentation/d/1T4bIZSqRuCFdDx-76PoSzvD6JZDlH9ZMZguVTr-wqro)
