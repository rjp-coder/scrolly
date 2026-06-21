// Quote characters to strip from an inferred title — straight and smart/curly variants.
const QUOTE_CHARS = `"'“”‘’`

const TITLE_MAX_LENGTH = 60

/**
 * Infers a song title from pasted lyrics: takes the first non-empty line,
 * strips surrounding quotes, and returns '' if the line looks too long
 * to plausibly be a title (rather than a first line of lyrics).
 */
export function inferTitleFromText(text) {
  if (!text) return ''
  const firstLine = text.split('\n').find((line) => line.trim().length > 0) || ''
  const trimmed = firstLine.trim()
  if (!trimmed || trimmed.length > TITLE_MAX_LENGTH) return ''

  const quoteClass = QUOTE_CHARS
  const stripped = trimmed
    .replace(new RegExp(`^[${quoteClass}]+`), '')
    .replace(new RegExp(`[${quoteClass}]+$`), '')
    .trim()

  return stripped
}

/**
 * Inserts an extra blank line after every single line break, while leaving
 * existing blank lines (paragraph breaks) untouched, so spacing only grows
 * where lines were tightly packed.
 */
export function expandLineBreaks(text) {
  if (!text) return text
  return text.replace(/\n(?!\n)/g, '\n\n')
}
