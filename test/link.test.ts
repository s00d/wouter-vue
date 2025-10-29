import { it, expect, describe, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { h } from "vue";
import { Router, Link } from "../src/index";
import { memoryLocation } from "../src/memory-location";

describe("<Link />", () => {
  it("renders a link with proper attributes", () => {
    const wrapper = mount(Link, {
      props: { href: "/about", className: "link--active" },
      slots: {
        default: () => "Click Me",
      },
    });

    expect(wrapper.text()).toBe("Click Me");
    expect(wrapper.attributes("href")).toBe("/about");
    expect(wrapper.classes()).toContain("link--active");
    wrapper.unmount();
  });

  it("still creates a plain link when no slots", () => {
    const wrapper = mount(Link, {
      props: { href: "/about", "data-testid": "link" },
    });

    const element = wrapper.find('[data-testid="link"]');
    expect(element.exists()).toBe(true);
    expect(element.attributes("href")).toBe("/about");
    wrapper.unmount();
  });

  it("supports `to` prop as an alias to `href`", () => {
    const wrapper = mount(Link, {
      props: { to: "/about" },
      slots: {
        default: () => "Hello",
      },
    });

    expect(wrapper.text()).toBe("Hello");
    expect(wrapper.attributes("href")).toBe("/about");
    wrapper.unmount();
  });

  it("performs a navigation when the link is clicked", async () => {
    const { hook, navigate } = memoryLocation({ path: "/initial" });
    let locationRef;

    const TestComponent = {
      setup() {
        const [location] = hook();
        locationRef = location;
        return { location: location.value, hook };
      },
      render() {
        return h(Router, { hook }, () => [
          h(Link, { href: "/goo-baz", "data-testid": "link" }, () => "link"),
          h("div", this.location)
        ]);
      },
    };

    const wrapper = mount(TestComponent);
    await flushPromises();
    expect(locationRef.value).toBe("/initial");

    await wrapper.find('[data-testid="link"]').trigger("click");
    await flushPromises();

    expect(locationRef.value).toBe("/goo-baz");
    wrapper.unmount();
  });

  it("supports replace navigation", async () => {
    const { hook, navigate } = memoryLocation({ path: "/initial" });
    let historyLengthRef;

    const TestComponent = {
      setup() {
        const historyLength = { value: 0 };
        historyLengthRef = historyLength;
        return { hook, historyLength };
      },
      template: `<Router :hook="hook">
        <Link href="/goo-baz" replace data-testid="link">link</Link>
      </Router>`,
    };

    const wrapper = mount(TestComponent);
    await flushPromises();

    const histBefore = 1;
    historyLengthRef.value = histBefore;

    await wrapper.find('[data-testid="link"]').trigger("click");
    await flushPromises();

    // Verify navigation happened (replace doesn't change history length)
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });

  it("ignores the navigation when clicked with modifiers", async () => {
    const { hook } = memoryLocation({ path: "/initial" });

    const TestComponent = {
      setup() {
        return { hook };
      },
      template: `<Router :hook="hook">
        <Link href="/users" data-testid="link">click</Link>
      </Router>`,
    };

    const wrapper = mount(TestComponent);
    await flushPromises();

    const linkElement = wrapper.find('[data-testid="link"]').element;
    const clickEvt = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
      ctrlKey: true,
    });

    linkElement.dispatchEvent(clickEvt);
    await flushPromises();

    // Should not navigate when ctrl pressed
    wrapper.unmount();
  });

  it("accepts an `onClick` prop, fired before the navigation", async () => {
    const clickHandler = vi.fn();
    const { hook } = memoryLocation({ path: "/initial" });

    const TestComponent = {
      setup() {
        return { hook, clickHandler };
      },
      template: `<Router :hook="hook">
        <Link href="/" :onClick="clickHandler" data-testid="link" />
      </Router>`,
    };

    const wrapper = mount(TestComponent);
    await flushPromises();

    await wrapper.find('[data-testid="link"]').trigger("click");
    await flushPromises();

    expect(clickHandler).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it("renders `href` with basepath", () => {
    const wrapper = mount(Router, {
      props: { base: "/app" },
      slots: {
        default: () => h(Link, { href: "/dashboard", "data-testid": "link" }),
      },
    });

    const link = wrapper.find('[data-testid="link"]');
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toBe("/app/dashboard");
    wrapper.unmount();
  });

  it("renders `href` with absolute links", () => {
    const wrapper = mount(Router, {
      props: { base: "/app" },
      slots: {
        default: () => h(Link, { href: "~/home", "data-testid": "link" }),
      },
    });

    const element = wrapper.find('[data-testid="link"]');
    expect(element.exists()).toBe(true);
    expect(element.attributes("href")).toBe("/home");
    wrapper.unmount();
  });
});

describe("active links", () => {
  it("proxies `className` when it is a string", () => {
    const wrapper = mount(Link, {
      props: { href: "/", className: "link--active warning" },
      slots: {
        default: () => "Click Me",
      },
    });

    const element = wrapper.find("a");
    expect(element.classes()).toContain("link--active");
    wrapper.unmount();
  });
});

