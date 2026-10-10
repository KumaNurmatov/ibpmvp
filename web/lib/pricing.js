/**
 * Во что обошёлся разбор.
 *
 * Цены — доллары за миллион токенов, по прейскуранту на октябрь 2026. Они
 * меняются: сверяйтесь с anthropic.com/pricing, прежде чем считать по ним
 * бюджет. Неизвестная модель даёт null, а не выдуманную сумму — лучше не
 * показать цену, чем показать неверную.
 */
export const PRICES = {
  "claude-opus-5-5": { input: 4, output: 20 },
  "claude-opus-5": { input: 5, output: 25 },
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
  "claude-fable-5-1": { input: 10, output: 50 },
};

/** Сложить токены по всем разобранным документам. */
export function totalUsage(extractions) {
  let input = 0, output = 0, counted = 0;
  for (const ex of extractions) {
    if (!ex?._usage) continue;
    input += ex._usage.input || 0;
    output += ex._usage.output || 0;
    counted++;
  }
  return { input, output, documents: counted };
}

/**
 * @returns {?{input: number, output: number, total: number}} доллары,
 * либо null, если цены на эту модель мы не знаем.
 */
export function cost(usage, model) {
  const price = PRICES[model];
  if (!price || !usage) return null;
  const input = (usage.input / 1e6) * price.input;
  const output = (usage.output / 1e6) * price.output;
  return { input, output, total: input + output };
}

/** «$0,24» — суммы здесь мелкие, поэтому два знака, а не четыре. */
export function formatUsd(value) {
  if (value === null || value === undefined) return "—";
  if (value > 0 && value < 0.01) return "<$0,01";
  return "$" + value.toFixed(2).replace(".", ",");
}

export function formatTokens(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".", ",")} тыс.`;
  return String(n);
}
