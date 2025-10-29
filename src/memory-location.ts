import mitt from 'mitt'
import { type Ref, ref, watchEffect } from './vue-deps.js'

type Path = string
type SearchString = string

interface MemoryLocationOptions {
  path?: Path
  searchPath?: SearchString
  static?: boolean
  record?: boolean
}

type NavigateFn = (path: Path, options?: { replace?: boolean }) => void

/**
 * In-memory location that supports navigation
 */
export const memoryLocation = ({
  path = '/',
  searchPath = '',
  static: staticLocation,
  record,
}: MemoryLocationOptions = {}) => {
  let initialPath = path
  if (searchPath) {
    // join with & if path contains search query, and ? otherwise
    initialPath += path.split('?')[1] ? '&' : '?'
    initialPath += searchPath
  }

  let [currentPath, currentSearch = ''] = initialPath.split('?')
  const history: Path[] = [initialPath]
  const emitter = mitt<{ navigate: Path }>()

  const navigateImplementation: NavigateFn = (path: Path, { replace = false } = {}) => {
    if (record) {
      if (replace) {
        history.splice(history.length - 1, 1, path)
      } else {
        history.push(path)
      }
    }

    ;[currentPath, currentSearch = ''] = path.split('?')
    emitter.emit('navigate', path)
  }

  const navigate: NavigateFn = !staticLocation ? navigateImplementation : () => null

  const subscribe = (cb: (path: Path) => void): (() => void) => {
    emitter.on('navigate', cb)
    return () => emitter.off('navigate', cb)
  }

  // Vue version using ref + watchEffect
  const useMemoryLocation = (): [Ref<Path>, NavigateFn] => {
    const location = ref(currentPath)

    watchEffect((onInvalidate) => {
      const callback = () => {
        location.value = currentPath
      }

      const unsubscribe = subscribe(callback)

      onInvalidate(() => {
        unsubscribe()
      })
    })

    return [location, navigate]
  }

  // Vue version for search
  const useMemoryQuery = (): Ref<SearchString> => {
    const search = ref(currentSearch)

    watchEffect((onInvalidate) => {
      const callback = () => {
        search.value = currentSearch
      }

      const unsubscribe = subscribe(callback)

      onInvalidate(() => {
        unsubscribe()
      })
    })

    return search
  }

  function reset(): void {
    // clean history array with mutation to preserve link
    history.splice(0, history.length)

    navigateImplementation(initialPath)
  }

  return {
    hook: useMemoryLocation,
    searchHook: useMemoryQuery,
    navigate,
    history: record ? history : undefined,
    reset: record ? reset : undefined,
  }
}
