import { type Ref, ref, watchEffect } from './vue-deps.js'

type Path = string

// array of callback subscribed to hash updates
const listeners = {
  v: [] as (() => void)[],
}

const onHashChange = () => {
  listeners.v.forEach((cb) => {
    cb()
  })
}

// we subscribe to `hashchange` only once when needed to guarantee that
// all listeners are called synchronously
const subscribeToHashUpdates = (callback: () => void): (() => void) => {
  // SSR check - don't subscribe to events on server
  if (typeof window === 'undefined' || typeof addEventListener === 'undefined') {
    listeners.v.push(callback)
    return () => {
      listeners.v = listeners.v.filter((i) => i !== callback)
    }
  }

  if (listeners.v.push(callback) === 1) addEventListener('hashchange', onHashChange)

  return () => {
    listeners.v = listeners.v.filter((i) => i !== callback)
    if (!listeners.v.length) removeEventListener('hashchange', onHashChange)
  }
}

// leading '#' is ignored, leading '/' is optional
const currentHashLocation = (): Path => {
  if (typeof window === 'undefined' || typeof location === 'undefined') {
    return '/'
  }
  return `/${location.hash.replace(/^#?\/?/, '')}`
}

export const navigate = <S = unknown>(
  to: Path,
  { state = null, replace = false }: { state?: S | null; replace?: boolean } = {}
): void => {
  // SSR check - don't navigate on server
  if (
    typeof window === 'undefined' ||
    typeof location === 'undefined' ||
    typeof history === 'undefined'
  ) {
    return
  }

  const [hash, search] = to.replace(/^#?\/?/, '').split('?')

  const newRelativePath = `${location.pathname}${search ? `?${search}` : location.search}#/${hash}`
  const oldURL = location.href
  const newURL = new URL(newRelativePath, location.origin).href

  if (replace) {
    history.replaceState(state, '', newRelativePath)
  } else {
    history.pushState(state, '', newRelativePath)
  }

  const event: Event =
    typeof HashChangeEvent !== 'undefined'
      ? new HashChangeEvent('hashchange', { oldURL, newURL })
      : new Event('hashchange')

  dispatchEvent(event)
}

// Vue version using ref + watchEffect
export const useHashLocation = ({
  ssrPath = '/',
}: {
  ssrPath?: Path
} = {}): [Ref<Path>, typeof navigate] => {
  const location = ref(typeof ssrPath !== 'undefined' ? ssrPath : currentHashLocation())

  watchEffect((onInvalidate) => {
    const callback = () => {
      location.value = currentHashLocation()
    }

    const unsubscribe = subscribeToHashUpdates(callback)

    onInvalidate(() => {
      unsubscribe()
    })
  })

  return [location, navigate]
}

;(useHashLocation as unknown as { hrefs: (href: Path) => string }).hrefs = (href: Path): string =>
  `#${href}`
