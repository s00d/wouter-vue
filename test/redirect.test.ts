import { it, expect, describe } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { h, nextTick, type ComputedRef } from 'vue'
import { Router, Redirect, useLocation } from '../src/index'
import { memoryLocation } from '../src/memory-location'

describe('<Redirect>', () => {
  it('performs navigation to specified path on mount', async () => {
    const { hook } = memoryLocation({ path: '/initial' })
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
        default: () => [
          h(TestComponent),
          h(Redirect, { to: '/redirected' }),
        ],
      },
    })

    await flushPromises()
    await nextTick()

    expect(locationRef.value).toBe('/redirected')
    wrapper.unmount()
  })

  it('supports replace prop', async () => {
    const { hook, history } = memoryLocation({
      path: '/start',
      record: true,
    })
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
        default: () => [
          h(TestComponent),
          h(Redirect, { to: '/replaced', replace: true }),
        ],
      },
    })

    await flushPromises()
    await nextTick()
    // Wait a bit more for navigation to complete
    await new Promise((r) => setTimeout(r, 10))

    expect(locationRef.value).toBe('/replaced')
    // History should not have added new entry
    expect(history[history.length - 1]).toBe('/replaced')
    wrapper.unmount()
  })

  it('supports href prop as alias for to', async () => {
    const { hook } = memoryLocation({ path: '/initial' })
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
        default: () => [
          h(TestComponent),
          h(Redirect, { href: '/via-href' }),
        ],
      },
    })

    await flushPromises()
    await nextTick()
    // Wait a bit more for navigation to complete
    await new Promise((r) => setTimeout(r, 10))

    expect(locationRef.value).toBe('/via-href')
    wrapper.unmount()
  })
})

describe('<Redirect> SSR support', () => {
  it('sets ssrContext.redirectTo for SSR context', async () => {
    const ssrContext: { redirectTo?: string } = {}
    const { hook } = memoryLocation({ path: '/initial' })

    const wrapper = mount(Router, {
      props: { hook, ssrContext },
      slots: {
        default: () => h(Redirect, { to: '/ssr-redirect' } as Record<string, unknown>),
      },
    })

    // Wait for setup to complete
    await flushPromises()
    await nextTick()
    
    // SSR context should be updated
    expect(ssrContext.redirectTo).toBe('/ssr-redirect')
    wrapper.unmount()
  })
})

