# サーバー構築

KVM を使ってサーバーを構築する方法を書く。

まずは、使いたい OS の isoファイル をダウンロードしておく。

私は、GUI でも操作できるように、Ubuntu Desktop 22.04.2 LTS を使用する。

isoファイルは、[公式サイト(jp.ubuntu.com)](https://jp.ubuntu.com/download)からダウンロードできる。

## ssh 設定

OSのインストールが終わり、起動したら、以下のコマンドを実行して、パッケージを更新する。

```bash
sudo apt update # パッケージ一覧を更新
sudo apt upgrade # パッケージを更新
sudo apt autoremove # 不要なパッケージを削除
```

その後、以下のコマンドを実行して、ssh でアクセスできるようにする。

```bash
sudo apt install openssh-server # openssh-serverのインストール
sudo systemctl status ssh # sshの状態を確認
```

これにより、ユーザー名+ホスト名 もしくは ユーザー名+IPアドレス で ssh による外部からのアクセスができるようになる。

```bash
ssh server@192.168.0.10 # パスワード認証でログインする
```

ssh での認証を、公開鍵認証に変更する。

```bash
ssh-keygen -t ed25519 -f server # 公開鍵の作成
ssh-copy-id -i server.pub server@192.168.0.10 # 作成した公開鍵を送る
```

```bash
sudo vim /etc/ssh/sshd_config # sshdの設定ファイルを編集
> PermitRootLogin no # 管理者権限でログインできないようにする
> PubkeyAuthentication yes # 公開鍵認証を有効にする
> PasswordAuthentication no # パスワード認証を無効にする

$ sudo systemctl restart sshd # sshデーモンを再起動
```

## ユーザ管理

### ユーザ追加

```bash
sudo adduser {ユーザ名} # ユーザ作成
sudo gpasswd -a {ユーザ名} sudo # 管理者権限を付与
```

### ユーザ削除

```bash
sudo userdel {ユーザ名} # ユーザ削除
sudo userdel -r {ユーザ名} # ユーザ削除、ディレクトリも
```

### パスワード変更

```bash
sudo passwd {ユーザ名} # パスワード変更
```

### ユーザ名変更

```bash
sudo usermod -l {新しいユーザ名} {旧ユーザ名} # ユーザ名変更
```

### ユーザの所属グループ変更

```bash
sudo groupmod -l {グループ名} {ユーザ名} # 所属グループ変更
```

### ホームディレクトリ変更

```bash
sudo usermod -d {ホームディレクトリのパス} -m {ユーザ名} # ホームディレクトリ変更
ex: sudo usermod -d /home/{ユーザ名} -m {ユーザ名}
```

### ユーザロック

`passwd`コマンドを使って、ユーザをロックし、使えなくすることができる。

※ 管理者権限のあるものなら、`su`コマンドで、ロックされたユーザになることができる。

```bash
sudo passwd -l {ユーザ名} # ユーザロック
sudo passwd -u {ユーザ名} # ユーザアンロック
```

### `su`コマンドの制限

pam_wheel.so を使う。

pam_wheel.so は、`su` コマンドを利用できるユーザを、wheel グループに所属するユーザに限定する。

```bash
sudo vim /etc/pam.d/su
> auth required pam_wheel.so use_uid # コメントアウトを消して、pam_wheel.soを有効にする
```

### `sudo`コマンドの制限

`visudo`コマンド または、 */etc/sudoers* を編集する。

実行コマンドに応じて、許可を出すこともできる。

```bash
sudo vim /etc/sudoers
> {ユーザ名} ALL=(ALL) ALL # {ユーザ名}に sudo コマンドの実行を許可する
> {ユーザ名} ALL=(ALL) /sbin/iptables # このように書けば、iptablesのみ実行を許可する
```

## ログ管理

Linux のシステムログは **syslog** の設定で */var/log* 配下に保存されている。

## パケットフィルタリング

Linux に実装されたパケットフィルタリング機能として、`iptables`がある。

しかし、これは自由度が高いため、最初は、より設定を簡単化した`ufw`を使うのがいい(実際には、`ufw`をフロントエンドとして、バックエンドでは、`iptables`のコマンドを生成して叩いている)。

```bash
sudo ufw status # 状態の確認(active が有効 , inactive が停止) 

sudo ufw enable # ufwの起動
sudo ufw disable # ufwの停止
sudo ufw app list # ufwアプリケーションプロファイルを一覧表示

### プロトコルを記載しない場合 TCP/UDP 両方が設定) ### 
sudo ufw allow 22/tcp # 22番ポートのTCPのみ許可
sudo ufw allow 80 # 80番ポートのTCP・UDPどちらも許可

sudo ufw status numbered # 設定の確認
sudo ufw delete 1 # 設定(1番目のルール)の削除
sudo ufw reload # 設定の反映
```
