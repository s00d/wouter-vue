/**
 * AnimatedSwitch component for wouter-vue
 *
 * Wraps Switch component with Vue Transition for animated route transitions.
 */

import type { ComputedRef } from 'vue'
import { Transition, h, computed, provide as provideVue, unref } from 'vue'
import type { Path } from '../../types/location-hook'
import { useLocation, RouteDataKey, type RouteDataInput } from '../index'
import { Switch } from './Switch'
import type { ComponentSetupContext } from './types'

type AnimatedSwitchProps = {
  name?: string
  mode?: 'default' | 'out-in' | 'in-out'
  location?: Path
  data?: RouteDataInput
}

export const AnimatedSwitch = {
  name: 'AnimatedSwitch',
  props: {
    name: {
      type: String,
      default: 'fade',
    },
    mode: {
      type: String,
      default: 'out-in',
    },
    location: String,
    data: Object,
  },
  setup(props: AnimatedSwitchProps, { slots }: ComponentSetupContext) {
    const [location] = useLocation()

    // Provide reactive data context for children (before Switch)
    provideVue(RouteDataKey, computed(() => unref(props.data) || {}))

    return () => {
      const locationValue = (location as ComputedRef<Path>).value

      // Render Switch inside Transition
      // Apply key directly to Switch to avoid extra DOM wrapper
      return h(
        Transition,
        {
          name: props.name || 'fade',
          mode: props.mode || 'out-in',
        },
        () =>
          h(
            Switch,
            {
              key: locationValue,
              location: props.location,
              data: props.data,
            },
            slots
          )
      )
    }
  },
}

