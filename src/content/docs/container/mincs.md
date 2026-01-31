---
title: MINCS
---

参考:

- <https://qiita.com/mhiramat/items/5edd7eb479f9dca45b9c>
- <https://qiita.com/mhiramat/items/16fe5f55b4974656f6cb>
- <https://github.com/mhiramat/mincs>

Linux コンテナを作るシェルスクリプト MINCS の要点メモ。

やっていること

- Namespace の切り分け
- overlayfs による階層型 rootfs の準備
- /proc や /dev の準備
- chroot によるディレクトリの移行
- コンテナイメージの作成と管理

コンテナ作成フロー

1. unshare(1) で Namespace を分離（既存プロセスのコンテキストを切り離す。fork とは異なり新規プロセスは作らない）
2. mount(8)/umount(8) で overlay などマウントポイントを再整備
3. chroot(8) で新しい rootfs へ移行（exec(2) と組み合わせてプロセスを入れ替える運用が多い）

Namespace の分離メモ

- mount Namespace を分離しても、unshare(1) 直後は元の Namespace と同じマウント状態を引き継ぐ
- pid Namespace を分離しただけでは元の PID のまま。fork/exec 後に生まれる最初の子が新 Namespace の PID 1 になるため、/proc も同じ Namespace 内で再マウントしてから動かす

新しい rootfs の再構築

- `mount -t overlay -o upperdir=$UD,lowerdir=$BASEDIR,workdir=$WD overlay $NEWROOT` で overlayfs を作成
- /dev は devtmpfs をそのまま見せず、tmpfs を /dev に載せて最小限のデバイスだけ bind mount
- /proc と /sys は必要箇所を再 bind。/proc の一部は ro で親のものを bind し、危険な書き込みを防ぐ

chroot/pivot_root による rootfs の変更

- コンテナ内で chroot(8) を再度実行されると jailbreak になり得るため、capsh(1) などで CAP_SYS_CHROOT を事前に落としておく
- pivot_root(8) で元の rootfs を新環境内に退避し、マウントツリーを private にしてから lazy unmount で切り離す。pivot 後も元の rootfs を参照するプロセスがいると umount(8) できないため、rprivate で孤立させて安全に取り外す
- pivot_root を 2 回使う方法でも同様に切り離し可能
