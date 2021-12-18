import { readFileSync } from 'fs';
import { performance } from 'perf_hooks';

// ```ts:#1
function lineno1(text: string, index: number): number {
  return text.slice(0, index).replace(/[^\n]+/g, '').length + 1;
}
// ```

// ```ts:#2
function lineno2(text: string, index: number): number {
  let lineno = 1;
  for (
    let lf = -1;
    (lf = text.indexOf('\n', lf + 1)) >= 0 && lf < index;
    ++lineno
  );
  return lineno;
}
// ```

// ```ts:#3
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
// ```

class Data {
  times = 0;
  total = 0;
  get average() {
    return this.times ? this.total / this.times : 0;
  }
  add(elapse: number): void {
    ++this.times;
    this.total += elapse;
  }
}

const table: { [name: string]: Data } = {};

const linenos = [lineno1, lineno2, lineno3].map(f => {
  return (...args: Parameters<typeof f>) => {
    const data = (table[f.name] ??= new Data());
    const start = performance.now();
    try {
      return f(...args);
    } finally {
      data.add(performance.now() - start);
    }
  };
});

const text: string = readFileSync('package-lock.json', 'utf8');

for (let index = 0; index < text.length; ++index) {
  const results = linenos.map(lineno => lineno(text, index));
  if (results.some((e, _, a) => a[0] !== e)) {
    throw new Error(`results difference: ${index}:${results}`);
  }
}
for (const [name, { times, total, average }] of Object.entries(table)) {
  console.log(name, times, total, average);
}
