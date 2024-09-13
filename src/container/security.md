# Container Security

## Sysdig

インストール方法は、[こちら](https://github.com/draios/sysdig/wiki/How-to-Install-Sysdig-for-Linux)

```bash
curl -s https://download.sysdig.com/DRAIOS-GPG-KEY.public | sudo apt-key add -  
sudo curl -s -o /etc/apt/sources.list.d/draios.list https://download.sysdig.com/stable/deb/draios.list  
sudo apt-get update
sudo apt-get -y install linux-headers-$(uname -r)
sudo apt-get -y install sysdig
sysdig --version
```

## Falco

インストール方法は、[こちら](https://falco.org/docs/installation/)

- falco.yaml: Falcoの設定ファイル
- falco_rules.yaml: Falcoのデフォルトルール
- falco_rules.local.yaml: Falcoのカスタムルール

```txt
$ cat /etc/falco/falco_rules.local.yaml
# Your custom rules!
- macro: is_container
  condition: container.id != host

- list: suspicious_process
  items: [ps, sleep]

- rule: spawn_suspicious_process_in_container
  desc: Notice spawn suspicious process within a container
  condition: evt.type = execve and evt.dir = < and is_container and proc.name in (suspicious_process)
  output: Spawn suspicious process in a container (container_id=%container.id container_name=%container.name process=%proc.name parent=%proc.pname cmdline=%proc.cmdline)
  priority: WARNING
```
