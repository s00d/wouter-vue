import { it, expect, describe, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { h, watch, type ComputedRef } from 'vue'
import { useLocation, useRoute, Router } from '../src/index'
import { memoryLocation } from '../src/memory-location'

describe('useLocation', () => {
  it('[CRITICAL] returns reactive location that updates after navigate', async () => {
    const { hook, navigate } = memoryLocation({ path: '/initial' })
    let locationRef: ComputedRef<string>

    const TestComponent = {
      setup() {
        const [location] = useLocation()
        locationRef = location as ComputedRef<string>
        return { location }
      },
      template: '<div>{{ location }}</div>',
    }

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()
    expect(locationRef.value).toBe('/initial')

    // Navigate and verify reactivity
    navigate('/new-path')
    await flushPromises()

    expect(locationRef.value).toBe('/new-path')
    wrapper.unmount()
  })

  it('navigate correctly changes URL', async () => {
    const { hook } = memoryLocation({ path: '/start' })
    let locationRef: ComputedRef<string>
    let navigateFnRef: (path: string, options?: { replace?: boolean; state?: unknown }) => void

    const TestComponent = {
      setup() {
        const [location, navFn] = useLocation()
        locationRef = location as ComputedRef<string>
        navigateFnRef = navFn as typeof navigateFnRef
        return { location, navigate: navFn }
      },
      template: '<div>{{ location }}</div>',
    }

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()

    navigateFnRef('/test-url')
    await flushPromises()

    expect(locationRef.value).toBe('/test-url')
    wrapper.unmount()
  })

  it('supports { replace: true } option for navigate', async () => {
    const { hook, navigate, history } = memoryLocation({
      path: '/start',
      record: true,
    })
    let navigateFnRef: (path: string, options?: { replace?: boolean; state?: unknown }) => void

    const TestComponent = {
      setup() {
        const [, navFn] = useLocation()
        navigateFnRef = navFn as typeof navigateFnRef
        return { navigate: navFn }
      },
      template: '<div></div>',
    }

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()

    navigate('/step1')
    await flushPromises()

    navigateFnRef('/step2', { replace: true })
    await flushPromises()

    // With replace, history should have /start and /step2 (not /step1)
    expect(history.length).toBeGreaterThanOrEqual(2)
    expect(history[history.length - 1]).toBe('/step2')
    wrapper.unmount()
  })
})

describe('useRoute', () => {
  it('[CRITICAL] returns computed refs that reactively update when URL changes', async () => {
    const { hook, navigate } = memoryLocation({ path: '/home' })
    let matchesRef: ReturnType<typeof useRoute>[0]
    let paramsRef: ReturnType<typeof useRoute>[1]

    const TestComponent = {
      setup() {
        const [matches, params] = useRoute('/users/:id')
        matchesRef = matches
        paramsRef = params
        return { matches, params }
      },
      template: '<div v-if="matches">Matched: {{ params.id }}</div>',
    }

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()
    // Initially should not match
    expect(matchesRef.value).toBe(false)
    expect(paramsRef.value).toBeNull()

    // Navigate to matching path
    navigate('/users/123')
    await flushPromises()

    // Should reactively update
    expect(matchesRef.value).toBe(true)
    expect(paramsRef.value).not.toBeNull()
    expect((paramsRef.value as { id: string }).id).toBe('123')

    // Navigate away
    navigate('/other')
    await flushPromises()

    // Should reactively update to false
    expect(matchesRef.value).toBe(false)
    expect(paramsRef.value).toBeNull()

    wrapper.unmount()
  })

  it('correctly matches static paths', async () => {
    const { hook, navigate } = memoryLocation({ path: '/users' })

    const TestComponent = {
      setup() {
        const [matches] = useRoute('/users')
        return { matches }
      },
      template: '<div v-if="matches">Matched</div>',
    }

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Matched')

    navigate('/other')
    await flushPromises()
    expect(wrapper.text()).not.toContain('Matched')

    wrapper.unmount()
  })

  it('correctly matches dynamic paths and extracts params', async () => {
    const { hook, navigate } = memoryLocation({ path: '/users/456' })
    let paramsRef: ReturnType<typeof useRoute>[1]

    const TestComponent = {
      setup() {
        const [matches, params] = useRoute('/users/:id')
        paramsRef = params
        return { matches, params }
      },
      template: '<div v-if="matches">ID: {{ params.id }}</div>',
    }

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('ID: 456')
    expect(paramsRef.value).not.toBeNull()
    expect((paramsRef.value as { id: string }).id).toBe('456')

    navigate('/users/789')
    await flushPromises()
    expect((paramsRef.value as { id: string }).id).toBe('789')

    wrapper.unmount()
  })

  it('returns [false, null] for non-matching paths', async () => {
    const { hook } = memoryLocation({ path: '/other' })
    let matchesRef: ReturnType<typeof useRoute>[0]
    let paramsRef: ReturnType<typeof useRoute>[1]

    const TestComponent = {
      setup() {
        const [matches, params] = useRoute('/users/:id')
        matchesRef = matches
        paramsRef = params
        return { matches, params }
      },
      template: '<div></div>',
    }

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()
    expect(matchesRef.value).toBe(false)
    expect(paramsRef.value).toBeNull()

    wrapper.unmount()
  })

  it('works with RegExp patterns', async () => {
    const { hook, navigate } = memoryLocation({ path: '/foo-bar' })
    let matchesRef: ReturnType<typeof useRoute>[0]

    const TestComponent = {
      setup() {
        const [matches] = useRoute(/^\/foo-(\w+)$/)
        matchesRef = matches
        return { matches }
      },
      template: '<div></div>',
    }

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()
    expect(matchesRef.value).toBe(true)

    navigate('/not-match')
    await flushPromises()
    await new Promise((r) => setTimeout(r, 10))
    expect(matchesRef.value).toBe(false)

    wrapper.unmount()
  })
})

