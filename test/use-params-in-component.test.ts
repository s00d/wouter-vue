import { it, expect, describe } from "vitest";
import { mount } from "@vue/test-utils";
import { h, computed } from "vue";
import { Router, Route, useParams } from "../src/index";
import { memoryLocation } from "../src/memory-location";

describe("useParams in components", () => {
  it("passes params to component using useParams", async () => {
    const { hook, navigate } = memoryLocation({ path: "/users/123" });
    
    const TestComponent = {
      setup() {
        const params = useParams() as any;
        return () => h("div", `User ID: ${(params.value as any).id || 'no-id'}`);
      },
    };

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () => h(Route, { path: "/users/:id" }, () => h(TestComponent)),
      },
    });

    await new Promise(r => setTimeout(r, 0));
    
    expect(wrapper.text()).toContain("User ID: 123");
    wrapper.unmount();
  });

  it("passes params via slot arguments", async () => {
    const { hook, navigate } = memoryLocation({ path: "/users/456" });
    
    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () => (h as any)(Route, { path: "/users/:id" }, (params: any) => 
          h("div", `User ID: ${(params as any).id || 'no-id'}`)
        ),
      },
    });

    await new Promise(r => setTimeout(r, 0));
    
    expect(wrapper.text()).toContain("User ID: 456");
    wrapper.unmount();
  });

  it("works with nested routes", async () => {
    const { hook, navigate } = memoryLocation({ path: "/" });
    
    const UserDetailComponent = {
      setup() {
        const params = useParams() as any;
        return () => h("div", `User: ${(params.value as any)?.userId || (params.value as any)?.user || 'no-user'}, Section: ${(params.value as any)?.section || 'no-section'}`);
      },
    };

    const wrapper = mount(Router, {
      props: { hook },
      slots: {
        default: () => h(Route, { path: "/users/:userId", nest: true }, () => [
          h(Route, { path: "/:section" }, () => h(UserDetailComponent)),
        ]),
      },
    });

    navigate("/users/789/profile");
    await new Promise(r => setTimeout(r, 10));
    
    expect(wrapper.text()).toContain("User: 789");
    expect(wrapper.text()).toContain("Section: profile");
    wrapper.unmount();
  });
});

