import { it, expect, describe } from "vitest";
import { h } from "vue";
import { Router, Route } from "../src/index";
import { memoryLocation } from "../src/memory-location";
import { mount } from "@vue/test-utils";

describe("Route", () => {
  it("renders nothing when path does not match", () => {
    const { hook } = memoryLocation({ path: "/bar" });
    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () => h(Route, { path: "/foo" }, () => h("h1", "Should not render")),
      },
    });

    expect(wrapper.text()).toBe("");
  });

  it("always renders when path is empty", () => {
    const { hook } = memoryLocation({ path: "/anything" });
    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () => h(Route, {}, () => h("h1", "Always renders")),
      },
    });
    // Route without path should render
    expect(wrapper.exists()).toBe(true);
  });
});
