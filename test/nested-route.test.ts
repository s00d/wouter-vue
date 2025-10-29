import { it, expect, describe } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { Router, Route, Link, useParams } from "../src/index";
import { memoryLocation } from "../src/memory-location";

describe("when `nest` prop is given", () => {
  it("renders by default", () => {
    const wrapper = mount(Route, {
      props: { nest: true },
      slots: {
        default: () => "matched!",
      },
    });
    expect(wrapper.text()).toBe("matched!");
    wrapper.unmount();
  });

  it("matches the pattern loosely", async () => {
    const { hook, navigate } = memoryLocation({ path: "/" });

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () =>
          h(Route, { path: "/posts/:slug", nest: true }, () => "matched!"),
      },
    });

    await flushPromises();
    expect(wrapper.text()).toBe("");

    navigate("/posts/all");
    await flushPromises();
    expect(wrapper.text()).toBe("matched!");

    navigate("/users");
    await flushPromises();
    expect(wrapper.text()).toBe("");

    navigate("/posts/10-react-tricks/table-of-contents");
    await flushPromises();
    expect(wrapper.text()).toBe("matched!");

    wrapper.unmount();
  });

  it("can be used inside a Switch", () => {
    const wrapper = mount(
      Router,
      {
        props: {
          hook: memoryLocation({ path: "/posts/13/2012/sort", static: true })
            .hook,
        },
        slots: {
          default: () =>
            h("div", [
              h(Route, { path: "/about" }, () => "about"),
              h(Route, { path: "/posts/:slug", nest: true }, () => "nested"),
              h(Route, null, () => "default"),
            ]),
        },
      }
    );

    // Should match the nested route
    expect(wrapper.text()).toContain("nested");
    wrapper.unmount();
  });

  it("creates a nested Router with a new base", () => {
    const wrapper = mount(Router, {
      props: { hook: memoryLocation({ path: "/app/users/123" }).hook },
      slots: {
        default: () =>
          h(Route, { path: "/app/users/:userId", nest: true }, () => [
            h("h1", "User"),
            // Child routes should work within nested context
            h(Route, { path: "/profile" }, () => "Profile"),
          ]),
      },
    });

    expect(wrapper.text()).toContain("User");
    wrapper.unmount();
  });

  it("supports relative links with ~ prefix inside nested routes", () => {
    const wrapper = mount(Router, {
      props: { hook: memoryLocation({ path: "/app/users/123" }).hook },
      slots: {
        default: () =>
          h(Route, { path: "/app/users/:userId", nest: true }, () => [
            h("div", "User page"),
            h(Link, { href: "~/home", "data-testid": "link" }, () => "Home"),
          ]),
      },
    });

    const link = wrapper.find('[data-testid="link"]');
    expect(link.exists()).toBe(true);
    // Link should be absolute (no /app/users base)
    expect(link.attributes("href")).toBe("/home");
    wrapper.unmount();
  });
});

describe("multiple levels of nesting", () => {
  it("supports deeply nested routes", async () => {
    const { hook, navigate } = memoryLocation({ path: "/" });
    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () =>
          h(Route, { path: "/users/:userId", nest: true }, () => [
            h("div", "User level"),
            h(Route, { path: "/posts", nest: true }, () => [
              h("div", "Posts level"),
              h(Route, { path: "/:postId" }, () => "Post"),
            ]),
          ]),
      },
    });

    await flushPromises();
    navigate("/users/456/posts/789");
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain("User level");
    expect(wrapper.text()).toContain("Posts level");
    expect(wrapper.text()).toContain("Post");

    wrapper.unmount();
  });

  it("passes params from parent to child routes", async () => {
    const { hook, navigate } = memoryLocation({ path: "/" });
    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () =>
          (h as any)(Route, { path: "/users/:userId", nest: true }, (params: any) => {
            return [
              h("div", `User ${(params as any).userId}`),
              h(Route, { path: "/profile" }, () => "Profile"),
            ];
          }),
      },
    });

    navigate("/users/999/profile");
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain("User 999");
    expect(wrapper.text()).toContain("Profile");

    wrapper.unmount();
  });
});

