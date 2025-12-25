/**
 * Normaliza término de búsqueda para GROQ
 * GROQ match requiere wildcards para búsqueda parcial
 */
export function normalizeSearchTerm(term: string): string {
  // Limpiar espacios extra
  const cleaned = term.trim();

  if (!cleaned) {
    return '';
  }

  // Agregar wildcards para búsqueda parcial
  // "next" -> "*next*"
  return `*${cleaned}*`;
}

/**
 * Valida que el término sea válido
 * Mínimo 2 caracteres, máximo 100
 */
export function isValidSearchTerm(term: string): boolean {
  const cleaned = term.trim();
  return cleaned.length >= 2 && cleaned.length <= 100;
}

/**
 * Highlight de términos en texto
 * Retorna array de objetos { text, highlight }
 */
export function highlightSearchTerm(
  text: string,
  searchTerm: string
): { text: string; highlight: boolean }[] {
  if (!searchTerm || !text) {
    return [{ text, highlight: false }];
  }

  const normalizedSearch = searchTerm.trim().replaceAll('*', '');
  const regex = new RegExp(`(${escapeRegExp(normalizedSearch)})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part) => ({
    text: part,
    highlight: regex.test(part),
  }));
}

/**
 * Escape caracteres especiales de regex
 */
function escapeRegExp(string: string): string {
  return string.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

/**
 * Genera mensaje de stats de búsqueda
 */
export function getSearchStatsMessage(
  total: number,
  searchTerm: string,
  categoryName?: string
): string {
  const cleanTerm = searchTerm.replaceAll('*', '');

  if (total === 0) {
    if (categoryName) {
      return `No se encontraron resultados para "${cleanTerm}" en ${categoryName}`;
    }
    return `No se encontraron resultados para "${cleanTerm}"`;
  }

  const plural = total === 1 ? 'resultado' : 'resultados';

  if (categoryName) {
    return `${total} ${plural} para "${cleanTerm}" en ${categoryName}`;
  }

  return `${total} ${plural} para "${cleanTerm}"`;
}
