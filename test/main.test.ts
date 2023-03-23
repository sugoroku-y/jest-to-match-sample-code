import '../src';

function regexp(...args: [TemplateStringsArray, ...unknown[]]): RegExp {
  return new RegExp(
    args[0].raw
      .map(e => e.replace(/\r?\n/g, '\r?\n'))
      .reduce(
        (r, e, i) =>
          `${r}${String(args[i]).replace(
            /[.*+?^=!:${}()|[\]/\\]/g,
            '\\$&',
          )}${e}`,
      ),
  );
}

describe('sample code', () => {
  test('README.md', () => {
    // ```ts:#1
    expect('../README.md').toMatchSampleCode();
    // ```
  });
  test('sample-code-sample.md', () => {
    expect('../sample/sample-code-sample.md').toMatchSampleCode();
  });
  test('sample-code-sample-not-exist-file.md', () => {
    expect(() => {
      expect(
        '../sample/sample-code-sample-not-exist-file.md',
      ).toMatchSampleCode();
    }).toThrow('ENOENT: no such file or directory, open');
  });
  test('sample-code-sample-not-exist-hash.md', () => {
    expect(() => {
      expect(
        '../sample/sample-code-sample-not-exist-hash.md',
      ).toMatchSampleCode();
    }).toThrow(
      'The sample code not found for ./sample-code-sample.ts#not-exist',
    );
  });
  test('sample-code-sample-different.md', () => {
    expect(() => {
      expect('../sample/sample-code-sample-different.md').toMatchSampleCode();
    }).toThrow(regexp`^Difference:\s*${'./sample-code-sample.ts#1'}
[ \t]*at[ \t]*.*${'sample-code-sample-different.md:3'}
[\s\S]*
(?:\x1b\[\d+m)?.*(?:\x1b\[\d+m)?
(?:\x1b\[\d+m)?${'+ // 存在するファイルの存在するハッシュを指定してるけど内容が違う'}(?:\x1b\[\d+m)?
(?:\x1b\[\d+m)?  `);
  });
});

describe('error', () => {
  test('not', () => {
    expect(() => {
      expect('../README.md').not.toMatchSampleCode();
    }).toThrow('.not.toMatchSampleCode is unsupported.');
  });
  test('no sample', () => {
    expect(() => {
      expect('../sample/sample-code-sample-no-sample.md').toMatchSampleCode();
    }).toThrow('Sample code not found in ');
  });
});
