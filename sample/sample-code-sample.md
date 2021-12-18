# sample code check

```ts:./sample-code-sample.ts#1
function lineno1(text: string, index: number): number {
  return text.slice(0, index).replace(/[^\n]+/g, '').length + 1;
}
```

```ts:./sample-code-sample.ts#2
function lineno2(text: string, index: number): number {
  let lineno = 1;
  for (
    let lf = -1;
    (lf = text.indexOf('\n', lf + 1)) >= 0 && lf < index;
    ++lineno
  );
  return lineno;
}
```

```ts:./sample-code-sample.ts#3
  function lineno3(text: string, index: number): number {
    let lineno = 1;
    for (const match of text.matchAll(/\n/g)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (match.index! >= index) {
        break;
      }
      ++lineno;
    }
    return lineno;
  }
```

```ts:./sample-code-sample-whole.ts
declare function testFunc(a: string, b: number, c: boolean): void;

testFunc('abc', 123, true);
// @ts-expect-error numberに文字列を指定するとエラー
testFunc('abc', '123', true);
// @ts-expect-error booleanに数値を指定するとエラー
testFunc('abc', 123, 1);
```
