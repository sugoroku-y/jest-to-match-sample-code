# sample code sample different

```ts:./sample-code-sample.ts#1
// 存在するファイルの存在するハッシュを指定してるけど内容が違う
function lineno1(text: string, index: number): number {
  return text.slice(0, index).replace(/[^\n]+/g, '').length + 1;
}
```
