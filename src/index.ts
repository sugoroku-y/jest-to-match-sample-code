import assert from 'assert';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';

function getLineNo(text: string, index: number): number {
  let lineno = 1;
  for (
    let lf = -1;
    (lf = text.indexOf('\n', lf + 1)) >= 0 && lf < index;
    ++lineno
  );
  return lineno;
}

// サンプルコードの場所を検索する正規表現(文書用)
const PATTERN_IN_MD =
  /(?<!(?<=^|\r?\n)[ \t]*~~~(?:md|markdown)[ \t]*\r?\n)(?<=^|\r?\n)[ \t]*```ts:((\.\.?\/.+?\.ts)(?:#.*\S)?)[ \t]*\r?\n((?:.*\r?\n)*?)[ \t]*```[ \t]*(?=$|\r?\n)/g;
// サンプルコードの場所を検索する正規表現(ソースファイル用)
const PATTERN_IN_TS =
  /(?<=^|\r?\n)[ \t]*\/\/[ \t]*```ts:(#.*\S)[ \t]*\r?\n((.*\r?\n)*?)[ \t]*\/\/[ \t]*```[ \t]*(?=$|\r?\n)/g;

expect.extend({
  toMatchSampleCode(
    this: jest.MatcherContext,
    received: string,
  ): jest.CustomMatcherResult {
    if (this.isNot) {
      throw new Error(`.not.toMatchSampleCode is unsupported.`);
    }

    let count = 0;
    const messages: string[] = [];
    // 文書のパス(テストのソースからの相対パスを解消)
    const targetPath = resolve(dirname(this.testPath), received);
    // 文書の内容
    const target = readFileSync(targetPath, 'utf8');
    // ソースファイルのパスと内容のキャッシュ
    const cache: Partial<Record<string, string>> = {};
    PATTERN_IN_MD.lastIndex = 0;
    let match;
    // 文書の中からサンプルコードを検索
    while ((match = PATTERN_IN_MD.exec(target)) !== null) {
      const { index, 1: key, 2: pathname, 3: actual } = match;
      // 正規表現にマッチしていればindex、key、pathname、actualは存在している
      assert(index !== undefined && key && pathname && actual !== undefined);
      ++count;
      // 行番号
      const lineno = getLineNo(target, index);
      try {
        // ソースファイルは文書からの相対パス
        const expect = (() => {
          if (key in cache) {
            return cache[key];
          }
          const text = readFileSync(
            resolve(dirname(targetPath), pathname),
            'utf8',
          );
          if (key === pathname) {
            // ハッシュの指定がなければソースファイル全体
            return (cache[key] = text);
          }
          // 指定があればハッシュとのマップを構築
          PATTERN_IN_TS.lastIndex = 0;
          while ((match = PATTERN_IN_TS.exec(text)) !== null) {
            const [, hash, code] = match;
            // 正規表現にマッチしたらhashとcodeは常に存在している
            assert(hash && code !== undefined);
            cache[pathname + hash] = code;
          }
          return cache[key];
        })();
        if (expect === undefined) {
          messages.push(`The sample code not found for ${key}
  at ${targetPath}:${lineno}`);
          continue;
        }
        // 期待値のインデント
        const expectIndent = expect.match(/^[ \t]+/)?.[0] ?? '';
        // 実効値のインデント
        const actualIndent = actual.match(/^[ \t]+/)?.[0] ?? '';
        // 期待値がインデントされているかどうか(1行目の先頭に空白かタブがないか、空行を除くすべての行が先頭行と同じ空白文字で始まっている)
        const expectIndented =
          !expectIndent ||
          !new RegExp(`^(?!$|${expectIndent})`, 'm').test(expect);
        // 実効値がインデントされているかどうか
        const actualIndented =
          !actualIndent ||
          !new RegExp(`^(?!$|${actualIndent})`, 'm').test(actual);
        // 期待値を実効値のインデントに合わせる
        const adjustExpect =
          expectIndent !== actualIndent && expectIndented && actualIndented
            ? expect.replace(
                new RegExp(`^(?!$)${expectIndent}`, 'gm'),
                actualIndent,
              )
            : expect;
        // 一致していればこのサンプルコードはOK
        if (adjustExpect === actual) {
          continue;
        }
        // 一致していなければ差分を返す
        messages.push(`Difference: ${key}
  at ${targetPath}:${lineno}
${
  this.utils.diff(
    // 表示される行番号が文書上のものと合うように補正
    `${'\n'.repeat(+lineno)}${adjustExpect}`,
    `${'\n'.repeat(+lineno)}${actual}`,
    {
      expand: false,
      contextLines: 3,
    },
  ) ??
  // istanbul ignore next
  ''
}`);
        continue;
      } catch (ex: unknown) {
        // istanbul ignore next
        messages.push(`${ex instanceof Error ? ex.message : String(ex)}
  at ${targetPath}:${lineno}`);
        continue;
      }
    }
    if (messages.length === 0 && count === 0) {
      return {
        pass: false,
        message: () => `Sample code not found in ${targetPath}`,
      };
    }
    return {
      pass: messages.length === 0,
      message: () => messages.join('\n'),
    };
  },
});

type ErrorMessage<MESSAGE extends string> = [] & MESSAGE;

type Equal<A, B> = (<T>(a: A) => T extends A ? 1 : 2) extends <T>(
  a: B,
) => T extends B ? 1 : 2
  ? true
  : false;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R, T> {
      toMatchSampleCode(
        ...args: T extends `${'.' | '..'}/${string}.md`
          ? []
          : T extends `${string}.md`
          ? ErrorMessage<'パスは./か../から開始してください'>
          : T extends `${'.' | '..'}/${string}`
          ? ErrorMessage<'拡張子は.mdにしてください'>
          : T extends string
          ? Equal<T, string> extends true
            ? ErrorMessage<'パスにはas constを付けてください'>
            : ErrorMessage<'パスは./か../から開始し、拡張子は.mdにしてください'>
          : ErrorMessage<'expectにはMarkDownドキュメントのパスを文字列で指定してください'>
      ): R;
    }
  }
}
