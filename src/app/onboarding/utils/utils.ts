export function generateElementText(
  type: string,
  options: Record<string, string>[],
): string {
  return options.find((val) => val.type === type).text;
}
