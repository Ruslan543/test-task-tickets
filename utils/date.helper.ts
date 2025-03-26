export function isValidDate(date: unknown): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}
