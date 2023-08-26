# Webブラウザ自作

## 公式ドキュメント

- [HTML Standard](https://html.spec.whatwg.org/)
- [Dom Standard](https://dom.spec.whatwg.org/)

## Webブラウザの機能

大きく3つに分けることができる

1. **Web ページを表示するための機能**
2. **Web ページの動的性のための機能**
3. **Web ブラウジングのための機能**

## Webページを表示する

HTMLファイルを取得した場合、以下のような処理を行う。

1. HTML・CSS を処理して以下の2つを構成する。
    - **Document Object Model(DOM)**
    - **CSS Object Model（CSSOM）**

    これらは、HTML 文字列と CSS 文字列に対して字句解析と構文解析を施すことにより構成される。

2. DOM と CSSOM から**レンダリングツリー（Rendering Tree）**を生成する。

    レンダリングツリーとは、ブラウザ内部での中間表現である。

3. レンダリングツリーを**レイアウト（Layout）**する。

    レンダリングツリー内の要素の画面内での位置はこのレイアウトにより決定される。

4. レイアウト結果を画面に**ペイント（Paint）**する。

    実際に描画する。

## Web ページの動的に処理する

Web ブラウザによる JavaScript の実行のために、ブラウザは専用の実行エンジンを使う。例として、Chromium は **V8** 、Firefox は **SpiderMonkey** という JavaScript 実行エンジンを利用している。

JavaScript は Web ページ の情報と連動して実行される必要があり、JavaScript から DOM にアクセスできるなどの形で、Web ページには動的性がもたらされる。

このJavaScript エンジンと Web ブラウザの連携のために、Web ブラウザは DOM API や Fetch API といった JavaScript エンジン に対していくつかのインターフェイスを提供している。

また、このようなインターフェイスの定義は **Web IDL** と呼ばれる言語で記述される。JavaScript と Web ブラウザを繋げるコードは **バインディング（Binding）**などと呼ばれ、その一部は、Web IDL をもとに生成されている。

## HTMLのパース処理

1. バイト列をトークナイザ（tokernizer）の入力に変換する ← 符号化されているバイト列をHTML文字列にデコードする
2. **Tokenization stage**(字句解析のイメージ): 1の出力をトークナイザでトークン列に変換する
3. **Tree construction stage**(構文解析のイメージ): 2の出力から DOM ツリーを構築する

Servoでは、[html5ever](https://doc.servo.org/script/dom/servoparser/struct.ServoParser.html) クレートを開発している

### HTMLパース処理の難しさ

多少マークアップが雑でも Web ページの利用に支障が出ないように、HTML が非常にゆるい文法を採用している。

たとえ、タグが省略されていたとしても、再入処理を行うことで、HTMLが正しく解釈されるようにしなければならない。
