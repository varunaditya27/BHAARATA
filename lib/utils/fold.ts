/** Case- and accent-insensitive form for matching, so "rajaraja" finds "Rājarāja". */
export function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
