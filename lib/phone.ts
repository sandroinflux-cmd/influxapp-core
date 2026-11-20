export function compactPhone(input: string) {
  return input.replace(/[\s()-]/g, '')
}

/** Georgian mobile: 5XXXXXXXX or +9955XXXXXXXX */
export function isGeorgianMobilePhone(input: string) {
  const compact = compactPhone(input)
  return /^5\d{8}$/.test(compact) || /^\+9955\d{8}$/.test(compact)
}

/** Public mask, e.g. 599123489 -> 5XX *** X89 */
export function maskGeorgianPhone(input: string) {
  const compact = compactPhone(input || '')
  const local = compact.startsWith('+995')
    ? compact.slice(4)
    : compact.startsWith('995')
      ? compact.slice(3)
      : compact

  if (!/^5\d{8}$/.test(local)) return null
  return `${local[0]}XX *** X${local.slice(-2)}`
}
