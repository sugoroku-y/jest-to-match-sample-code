declare function testFunc(a: string, b: number, c: boolean): void;

testFunc('abc', 123, true);
// @ts-expect-error numberに文字列を指定するとエラー
testFunc('abc', '123', true);
// @ts-expect-error booleanに数値を指定するとエラー
testFunc('abc', 123, 1);
