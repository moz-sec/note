# 高速通信技術

## OS と NIC の特性

同じ帯域幅であれば、パケットサイズが小さいほど、大量のパケットを送ることができる。ただし、パケットが増えるほど、処理するヘッダも増加し、LinuxカーネルのTCP/IP処理のオーバーヘッドが増加する。[1]

でも、データのサイズが比較的小さい場合が多いのが現実である。結果として、TCP/IPスタックがボトルネックとなり、スループットが低下する。

また、カーネルのTCP/IPスタックを利用するには、システムコールの呼び出しが必要である。`READ(2)`や`WRITE(2)`がこれにあたるが、システムコールを頻繁に呼び出すとこれもオーバーヘッドになる。

## システムコールを減らす

ユーザ・カーネル空間の間に共有メモリを用意し、カーネル内で専用のカーネルスレッドがこれを読み取って、カーネル機能を実行する。これにより、`syscall(2)`によるコンテキスト切り替えをなくすことができる。

100pまで

## 参考

- [MegaPipe: A New Programming Interface for Scalable Network I/O](https://www.usenix.org/conference/osdi12/technical-sessions/presentation/han)
- [NICの高速化とシステムソフトウェア研究](https://seminar-materials.iijlab.net/iijlab-seminar/iijlab-seminar-20231017.pdf)
