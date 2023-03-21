# jest-to-match-sample-code

toMatchSampleCodeは、MDファイルの中に書かれているサンプルコードが、tsファイルに書かれている内容と一致しているかを確認するカスタムマッチャーです。

## 使い方

テストケースの中で以下のように書いておきます。

```ts:./test/main.test.ts#1
expect('../README.md').toMatchSampleCode();
```

※`expect`にはテストケースのソースファイルからの相対パスを指定してください。

mdファイルには以下のように記述しておきます。

~~~md
```ts:./sample.ts#2

//  ...

```
~~~

※ソースファイルのパスはmdファイルからの相対パスで記述してください。

ソースファイルの方には以下のように記述しておきます。

```ts
// ```ts:#2

// ...

// ```
```

mdファイルに書かれたソースファイルのパスの後ろに書かれている`#～`の部分が`` // ```ts:#～ `` の`#～`と一致するものを検索し、見つかったものと内容を比較します。

見つからない場合はエラーになります。

もしソースファイル全体をサンプルコードとして扱う場合には

~~~markdown
```ts:./sample-code-sample-whole.ts

// ...

```
~~~

のように`#～`無しで記述します。
