# Namespace

さまざまなリソースを分離する。
Linux 5.6 以降では、**Cgroup**, **IPC**, **Network**, **Mount**, **PID**, **Time**, **User**, **UTS** の8つのリソースを分離することができる。

lsns(1) でNamespaceを確認できる。

特定のプロセスがどの Namespace に属しているかは、`/proc/[PID]/ns` で確認できる。
