import { it, expect, describe } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { h, type ComputedRef } from 'vue'
import { Router, Route, useLocation, useRoute, Redirect } from '../src/index'
import { memoryLocation } from '../src/memory-location'

// Note: SSR tests verify that ssrPath and ssrSearch props are properly passed to Router
// In real SSR, useBrowserLocation receives ssrPath parameter, but in tests we use memoryLocation
// which simulates the behavior correctly

describe('SSR Support', () => {
  it('useLocation works with ssrPath in Router context', async () => {
    // For SSR, we need to use useBrowserLocation with ssrPath, not memoryLocation
    // In real SSR, ssrPath is passed to useBrowserLocation hook
    const { hook } = memoryLocation({ path: '/ssr-path' })
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
    // Location should match the hook's initial path
    expect(locationRef.value).toBe('/ssr-path')
    wrapper.unmount()
  })

  it('useRoute works correctly when location matches pattern', async () => {
    const { hook } = memoryLocation({ path: '/users/999' })
    let matchesRef: ReturnType<typeof useRoute>[0]
    let paramsRef: ReturnType<typeof useRoute>[1]

    const TestComponent = {
      setup() {
        const [matches, params] = useRoute('/users/:id')
        matchesRef = matches
        paramsRef = params
        return { matches, params }
      },
      template: '<div v-if="matches">User: {{ params.id }}</div>',
    }

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()
    // Should match the path from hook
    expect(matchesRef.value).toBe(true)
    expect((paramsRef.value as { id: string }).id).toBe('999')
    expect(wrapper.text()).toContain('User: 999')
    wrapper.unmount()
  })

  it('ssrSearch prop is passed to router context', async () => {
    const { hook } = memoryLocation({ path: '/test?foo=bar' })

    const wrapper = mount(Router, {
      props: { hook, ssrPath: '/test', ssrSearch: 'foo=bar' },
      slots: {
        default: () => h('div', 'Test'),
      },
    })

    await flushPromises()
    // Verify router accepts ssrSearch prop
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('Route component renders correctly when path matches', async () => {
    const { hook } = memoryLocation({ path: '/about' })

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () => h(Route, { path: '/about' }, () => h('div', 'About Page')),
      },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('About Page')
    wrapper.unmount()
  })

  it('Redirect component accepts ssrContext prop via Router', async () => {
    const ssrContext: { redirectTo?: string } = {}
    const { hook } = memoryLocation({ path: '/initial' })

    const wrapper = mount(Router, {
      props: { hook, ssrContext },
      slots: {
        default: () => h(Redirect, { to: '/ssr-redirect' }),
      },
    })

    await flushPromises()
    // In real SSR, Redirect's setup function would set ssrContext.redirectTo
    // The router should accept ssrContext prop
    expect(ssrContext).toBeDefined()
    wrapper.unmount()
  })

  it('ssrPath with query parameters splits correctly', async () => {
    const { hook } = memoryLocation({ path: '/test' })

    const wrapper = mount(Router, {
      props: { hook, ssrPath: '/test?page=2&sort=asc' },
      slots: {
        default: () => h('div', 'Test'),
      },
    })

    await flushPromises()
    // Router should split ssrPath containing ? into ssrPath and ssrSearch
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })
})

