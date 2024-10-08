# Hack

## nsenter

nsenter(1)を使うことで、コンテナのNamespaceでコマンドを実行することができる。

例えば、nginxコンテナにiproute2が入っていなかったとしても、ホスト側のipコマンドを使ってコンテナのIPアドレスを確認することができる。

```bash
$ sudo docker exec -it d4822853e05e /bin/bash
root@d4822853e05e:/# ip a
bash: ip: command not found

$ sudo docker inspect --format {{.State.Pid}} d4822853e05e
12699
$ sudo nsenter --target 12699 --net ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
7: eth0@if8: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default
    link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever
```
