import { it, expect, describe } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { h, defineComponent } from 'vue'
import { Router, Route, Switch, useParams } from '../src/index'
import { memoryLocation } from '../src/memory-location'

const Child = defineComponent({
  name: 'Child',
  setup() {
    const params = useParams()
    return () => h('div', { id: 'child' }, `child:${params.value.locale ?? ''}`)
  },
})

describe('nested routing with parent RegExp and child static path', () => {
  it('matches /:locale(2)/test with RegExp pattern and exposes named group locale', async () => {
    const { hook, navigate } = memoryLocation({ path: '/' })

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () =>
          h(Switch, null, () => [
            h(
              Route,
              { path: new RegExp('^/(?<locale>[a-zA-Z]{2})(?=/|$)'), nest: true },
              () => [h(Route, { path: '/test', component: Child })]
            ),
            h(Route, null, () => h('div', { id: 'nf' }, 'nf')),
          ]),
      },
    })

    await flushPromises()

    // 1) Should not match at root
    expect(wrapper.find('#child').exists()).toBe(false)
    expect(wrapper.find('#nf').exists()).toBe(true)

    // 2) Navigate to valid locale route
    navigate('/ru/test')
    await flushPromises()
    expect(wrapper.find('#child').exists()).toBe(true)
    expect(wrapper.find('#child').text()).toContain('child:ru')

    // 3) Invalid locale should not match
    navigate('/ru11/test')
    await flushPromises()
    expect(wrapper.find('#child').exists()).toBe(false)
    expect(wrapper.find('#nf').exists()).toBe(true)

    // 4) Another valid locale
    navigate('/en/test')
    await flushPromises()
    expect(wrapper.find('#child').exists()).toBe(true)
    expect(wrapper.find('#child').text()).toContain('child:en')

    wrapper.unmount()
  })

  it('matches /:locale([a-zA-Z]{2})/test with string pattern and exposes locale param', async () => {
    const { hook, navigate } = memoryLocation({ path: '/' })

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () =>
          h(Switch, null, () => [
            h(
              Route,
              { path: '/:locale([a-zA-Z]{2})', nest: true },
              () => [h(Route, { path: '/test', component: Child })]
            ),
            h(Route, null, () => h('div', { id: 'nf' }, 'nf')),
          ]),
      },
    })

    await flushPromises()

    // 1) Should not match at root
    expect(wrapper.find('#child').exists()).toBe(false)
    expect(wrapper.find('#nf').exists()).toBe(true)

    // 2) Navigate to valid locale route
    navigate('/ru/test')
    await flushPromises()
    expect(wrapper.find('#child').exists()).toBe(true)
    expect(wrapper.find('#child').text()).toContain('child:ru')

    // 3) Invalid locale should not match
    navigate('/ru11/test')
    await flushPromises()
    expect(wrapper.find('#child').exists()).toBe(false)
    expect(wrapper.find('#nf').exists()).toBe(true)

    // 4) Another valid locale
    navigate('/en/test')
    await flushPromises()
    expect(wrapper.find('#child').exists()).toBe(true)
    expect(wrapper.find('#child').text()).toContain('child:en')

    wrapper.unmount()
  })
})


