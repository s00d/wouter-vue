/**
 * Common types for wouter-vue components
 */
export type ComponentSetupContext = {
    slots: {
        default?: (() => unknown) | ((params: any) => unknown);
    };
    attrs?: Record<string, unknown>;
};
