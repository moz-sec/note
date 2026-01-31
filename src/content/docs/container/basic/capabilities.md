---
title: Capabilities
---

権限を細分化して、プロセスに付与する。

例）1024番未満ポートは特権が必要 → CAP_NET_BIND_SERVICE というケーパビリティを付与するだけ

getpcaps(1) でプロセスに対してどのようなCapabilityが付与されているか確認できる。
また、pscap(1) で全てのプロセスに対してどのようなCapabilityが付与されているか確認できる。
