/**
 * Common types for wouter-vue components
 */

export type ComponentSetupContext = {
  slots: {
    default?: (() => unknown) | ((params: unknown) => unknown)
  }
  attrs?: Record<string, unknown>
}

