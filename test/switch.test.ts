import { it, expect, describe } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { Router, Route, Switch } from "../src/index";
import { memoryLocation } from "../src/memory-location";

const testRouteRender = (initialPath, jsx) => {
  const { hook } = memoryLocation({ path: initialPath });
  return mount(Router, {
    props: { hook },
    slots: { default: jsx },
  });
};

it("works well when nothing is provided", () => {
  const wrapper = testRouteRender("/users/12", () =>
    h(Switch, null, () => null)
  );
  // When Switch has no matching children, it renders nothing
  expect(wrapper.text()).toBe("");
  wrapper.unmount();
});

it("always renders no more than 1 matched children", () => {
  const wrapper = testRouteRender("/users/12", () =>
    h(Switch, null, () => [
      h(Route, { path: "/users/home" }, () => h("h1")),
      h(Route, { path: "/users/:id" }, () => h("h2")),
      h(Route, { path: "/users/:rest*" }, () => h("h3")),
    ])
  );

  // Should only render the h2 that matches /users/:id
  const h1 = wrapper.find("h1");
  const h2 = wrapper.find("h2");
  const h3 = wrapper.find("h3");

  expect(h1.exists()).toBe(false);
  expect(h2.exists()).toBe(true);
  expect(h3.exists()).toBe(false);
  wrapper.unmount();
});

it("renders the default (catch-all) route when no route matches", () => {
  const wrapper = testRouteRender("/nowhere", () =>
    h(Switch, null, () => [
      h(Route, { path: "/users/:id" }, () => h("div", "User page")),
      h(Route, () => h("div", "404 Not Found")),
    ])
  );

  expect(wrapper.text()).toBe("404 Not Found");
  wrapper.unmount();
});

it("renders null when no default route is provided", () => {
  const wrapper = testRouteRender("/nowhere", () =>
    h(Switch, null, () => [h(Route, { path: "/users/:id" }, () => "User")]
    )
  );

  expect(wrapper.text()).toBe("");
  wrapper.unmount();
});

describe("Switch with nested routes", () => {
  it("matches nested routes", () => {
    const wrapper = testRouteRender("/users/123/profile", () =>
      h(Route, { path: "/users/:userId", nest: true }, () => [
        h("h1", "User"),
        h(Switch, null, () => [
          h(Route, { path: "/profile" }, () => h("div", "Profile")),
          h(Route, { path: "/settings" }, () => h("div", "Settings")),
        ]),
      ])
    );

    expect(wrapper.text()).toContain("User");
    expect(wrapper.text()).toContain("Profile");
    wrapper.unmount();
  });
});

it("supports catch-all routes with wildcard segments", () => {
  const wrapper = testRouteRender("/something-different", () =>
    h(Switch, null, () => [
      h(Route, { path: "/users" }, () => h("h1")),
      h(Route, { path: "/:anything*" }, () => h("h2")),
    ])
  );

  const h1 = wrapper.find("h1");
  const h2 = wrapper.find("h2");

  expect(h1.exists()).toBe(false);
  expect(h2.exists()).toBe(true);
  wrapper.unmount();
});

it("allows to specify which routes to render via `location` prop", () => {
  const wrapper = testRouteRender("/something-different", () =>
    h(Switch, { location: "/users" }, () => [
      h(Route, { path: "/users" }, () => "route"),
    ])
  );

  expect(wrapper.text()).toBe("route");
  wrapper.unmount();
});

it("renders first matching route only", () => {
  const wrapper = testRouteRender("/users/home", () =>
    h(Switch, null, () => [
      h(Route, { path: "/users", nest: true }, () => "users page"),
      h(Route, { path: "/users/:id" }, () => "user detail"),
      h(Route, { path: "/users/:rest*" }, () => "user catch-all"),
    ])
  );

  // Should match /users before /users/:id when using loose mode (nest: true)
  expect(wrapper.text()).toBe("users page");
  wrapper.unmount();
});

