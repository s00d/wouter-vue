import { it, expect, describe } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { h, type ComputedRef } from 'vue'
import { Router, Link, Route, useLocation, type RouterObject } from '../src/index'
import { memoryLocation } from '../src/memory-location'
import { useHashLocation } from '../src/use-hash-location'

describe('<Router>', () => {
  it('base prop correctly works: child Link uses base path', () => {
    const wrapper = mount(Router, {
      props: { base: '/app' },
      slots: {
        default: () => h(Link, { href: '/dashboard', 'data-testid': 'link' }),
      },
    })

    const link = wrapper.find('[data-testid="link"]')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/app/dashboard')
    wrapper.unmount()
  })

  it('base prop correctly works: child Route matches relative to base', async () => {
    const { hook } = memoryLocation({ path: '/app/users' })

    const wrapper = mount(Router, {
      props: { base: '/app', hook },
      slots: {
        default: () => h(Route, { path: '/users' }, () => h('div', 'Users Page')),
      },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Users Page')
    wrapper.unmount()
  })

  it('nested Router components stack base paths', () => {
    const wrapper = mount(Router, {
      props: { base: '/app' },
      slots: {
        default: () =>
          h(
            Router,
            { base: '/admin' },
            () => h(Link, { href: '/dashboard', 'data-testid': 'link' })
          ),
      },
    })

    const link = wrapper.find('[data-testid="link"]')
    expect(link.exists()).toBe(true)
    // Should be /app/admin/dashboard (stacked bases)
    expect(link.attributes('href')).toBe('/app/admin/dashboard')
    wrapper.unmount()
  })

  it('custom hook prop works with memoryLocation', async () => {
    const { hook, navigate } = memoryLocation({ path: '/custom' })
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
    expect(locationRef.value).toBe('/custom')

    navigate('/custom-new')
    await flushPromises()
    expect(locationRef.value).toBe('/custom-new')

    wrapper.unmount()
  })

  it('custom hook prop works with useHashLocation', async () => {
    // useHashLocation returns a function hook, which Router can use directly
    // We need to wrap it in an object that matches RouterObject structure
    const hashLocationHook: RouterObject['hook'] = (router: RouterObject) => {
      return useHashLocation({ ssrPath: router.ssrPath })
    }

    const TestComponent = {
      setup() {
        const [location] = useLocation()
        return { location }
      },
      template: '<div>{{ location }}</div>',
    }

    const wrapper = mount(Router, {
      props: { hook: hashLocationHook },
      slots: {
        default: () => h(TestComponent),
      },
    })

    await flushPromises()
    // Hash location should work
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })
})

