import { it, expect, describe } from "vitest";
import { h } from "vue";
import { Router, Route } from "../src/index";
import { memoryLocation } from "../src/memory-location";
import { mount, flushPromises } from "@vue/test-utils";

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

  it("renders component/slot only when path matches", async () => {
    const { hook, navigate } = memoryLocation({ path: "/users" });

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () => h(Route, { path: "/users" }, () => h("div", "Users Page")),
      },
    });

    await flushPromises();
    expect(wrapper.text()).toContain("Users Page");

    navigate("/other");
    await flushPromises();
    expect(wrapper.text()).not.toContain("Users Page");

    wrapper.unmount();
  });

  it("nest prop creates nested routes with relative paths", async () => {
    const { hook, navigate } = memoryLocation({ path: "/posts/react-guide/table-of-contents" });

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () =>
          h(Route, { path: "/posts/:slug", nest: true }, () => [
            h("h1", "Post"),
            h(Route, { path: "/table-of-contents" }, () => h("div", "TOC")),
          ]),
      },
    });

    await flushPromises();
    expect(wrapper.text()).toContain("Post");
    expect(wrapper.text()).toContain("TOC");

    wrapper.unmount();
  });
});
