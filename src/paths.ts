type Path = string

/*
 * Transforms `path` into its relative `base` version
 * If base isn't part of the path provided returns absolute path e.g. `~/app`
 */
const _relativePath = (base: Path, path: Path): Path =>
  !path.toLowerCase().indexOf(base.toLowerCase()) ? path.slice(base.length) || '/' : `~${path}`

/**
 * When basepath is `undefined` or '/' it is ignored (we assume it's empty string)
 */
const baseDefaults = (base: string = ''): Path => (base === '/' ? '' : base)

export const absolutePath = (to: Path, base: Path): Path =>
  to[0] === '~' ? to.slice(1) : baseDefaults(base) + to

export const relativePath = (base: Path = '', path: Path): Path =>
  _relativePath(decodePath(baseDefaults(base)), decodePath(path))

/*
 * Removes leading question mark
 */
const stripQm = (str: string): string => (str[0] === '?' ? str.slice(1) : str)

/*
 * decodes escape sequences such as %20
 */
const decodePath = (str: string): string => {
  try {
    return decodeURI(str)
  } catch (_e) {
    // fail-safe mode: if string can't be decoded do nothing
    return str
  }
}

export const sanitizeSearch = (search: string): string => decodePath(stripQm(search))
