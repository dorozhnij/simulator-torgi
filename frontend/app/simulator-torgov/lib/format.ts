export function formatRub(value: number) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
}

export function formatM2(value: number) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " м²";
}

export function formatSotok(value: number) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " сот.";
}

export function formatSotokWord(value: number) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " соток";
}

