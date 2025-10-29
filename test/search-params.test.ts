import { it, expect, describe } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { h, type ComputedRef } from 'vue'
import { Router, useSearch, useSearchParams } from '../src/index'
import { memoryLocation } from '../src/memory-location'

describe('useSearch', () => {
  it('returns correct search string', async () => {
    const locationHook = memoryLocation({ path: '/test?foo=bar&baz=qux' })
    let searchRef: ReturnType<typeof useSearch>

    const TestComponent = {
      setup() {
        const search = useSearch()
        searchRef = search
        return { search }
      },
      template: '<div>{{ search }}</div>',
    }

    const wrapper = mount(Router, {
      props: { hook: locationHook.hook, searchHook: locationHook.searchHook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()
    expect(searchRef.value).toBe('foo=bar&baz=qux')
    wrapper.unmount()
  })

  it('is reactive and updates when URL search changes', async () => {
    const locationHook = memoryLocation({ path: '/test?old=value' })
    let searchRef: ReturnType<typeof useSearch>

    const TestComponent = {
      setup() {
        const search = useSearch()
        searchRef = search
        return { search }
      },
      template: '<div>{{ search }}</div>',
    }

    const wrapper = mount(Router, {
      props: { hook: locationHook.hook, searchHook: locationHook.searchHook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()
    expect(searchRef.value).toBe('old=value')

    locationHook.navigate('/test?new=value')
    await flushPromises()
    expect(searchRef.value).toBe('new=value')

    wrapper.unmount()
  })

  it('returns empty string when no search params', async () => {
    const locationHook = memoryLocation({ path: '/test' })
    let searchRef: ReturnType<typeof useSearch>

    const TestComponent = {
      setup() {
        const search = useSearch()
        searchRef = search
        return { search }
      },
      template: '<div>{{ search }}</div>',
    }

    const wrapper = mount(Router, {
      props: { hook: locationHook.hook, searchHook: locationHook.searchHook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()
    expect(searchRef.value).toBe('')
    wrapper.unmount()
  })
})

describe('useSearchParams', () => {
  it('returns URLSearchParams object', async () => {
    const locationHook = memoryLocation({ path: '/test?foo=bar&baz=qux' })
    let searchParamsRef: ComputedRef<URLSearchParams>

    const TestComponent = {
      setup() {
        const [searchParams] = useSearchParams()
        searchParamsRef = searchParams as ComputedRef<URLSearchParams>
        return { searchParams }
      },
      template: '<div>{{ searchParams.get("foo") }}</div>',
    }

    const wrapper = mount(Router, {
      props: { hook: locationHook.hook, searchHook: locationHook.searchHook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()
    expect(searchParamsRef.value.get('foo')).toBe('bar')
    expect(searchParamsRef.value.get('baz')).toBe('qux')
    wrapper.unmount()
  })

  it('setSearchParams correctly updates URL', async () => {
    const locationHook = memoryLocation({ path: '/test?old=value' })
    let searchRef: ReturnType<typeof useSearch>
    let setSearchParamsFn: (
      nextInit: URLSearchParams | Record<string, string> | ((params: URLSearchParams) => URLSearchParams),
      options?: { replace?: boolean; state?: unknown }
    ) => void

    const TestComponent = {
      setup() {
        const search = useSearch()
        searchRef = search
        const [, setSearchParams] = useSearchParams()
        setSearchParamsFn = setSearchParams as typeof setSearchParamsFn
        return { search, setSearchParams }
      },
      template: '<div>{{ search }}</div>',
    }

    const wrapper = mount(Router, {
      props: { hook: locationHook.hook, searchHook: locationHook.searchHook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()

    setSearchParamsFn({ new: 'value', another: 'param' })
    await flushPromises()

    // Check search string directly
    expect(searchRef.value).toContain('new=value')
    expect(searchRef.value).toContain('another=param')

    wrapper.unmount()
  })

  it('setSearchParams supports function updater', async () => {
    const locationHook = memoryLocation({ path: '/test?count=1' })
    let searchRef: ReturnType<typeof useSearch>
    let setSearchParamsFn: (
      nextInit: URLSearchParams | Record<string, string> | ((params: URLSearchParams) => URLSearchParams),
      options?: { replace?: boolean; state?: unknown }
    ) => void

    const TestComponent = {
      setup() {
        const search = useSearch()
        searchRef = search
        const [, setSearchParams] = useSearchParams()
        setSearchParamsFn = setSearchParams as typeof setSearchParamsFn
        return { search, setSearchParams }
      },
      template: '<div>{{ search }}</div>',
    }

    const wrapper = mount(Router, {
      props: { hook: locationHook.hook, searchHook: locationHook.searchHook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()

    setSearchParamsFn((params) => {
      const count = parseInt(params.get('count') || '0')
      params.set('count', String(count + 1))
      return params
    })
    await flushPromises()

    // Check search string directly
    expect(searchRef.value).toContain('count=2')
    wrapper.unmount()
  })

  it('setSearchParams supports replace option', async () => {
    const locationHook = memoryLocation({
      path: '/test?old=value',
      record: true,
    })
    let setSearchParamsFn: (
      nextInit: URLSearchParams | Record<string, string> | ((params: URLSearchParams) => URLSearchParams),
      options?: { replace?: boolean; state?: unknown }
    ) => void

    const TestComponent = {
      setup() {
        const [, setSearchParams] = useSearchParams()
        setSearchParamsFn = setSearchParams as typeof setSearchParamsFn
        return {}
      },
      template: '<div></div>',
    }

    const wrapper = mount(Router, {
      props: { hook: locationHook.hook, searchHook: locationHook.searchHook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()

    setSearchParamsFn({ new: 'value' }, { replace: true })
    await flushPromises()

    // History should be updated in place
    expect(locationHook.history?.[locationHook.history.length - 1]).toContain('new=value')
    wrapper.unmount()
  })
})

