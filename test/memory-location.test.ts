import { it, expect, describe } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { memoryLocation } from "../src/memory-location";

describe("memoryLocation", () => {
  it("returns a hook with initial path", async () => {
    const { hook } = memoryLocation({ path: "/initial" });
    let locationRef;

    const TestComponent = {
      setup() {
        const [location] = hook();
        locationRef = location;
        return { location };
      },
      template: "<div>{{ location }}</div>",
    };

    const wrapper = mount(TestComponent);
    await flushPromises();

    expect(locationRef.value).toBe("/initial");
    wrapper.unmount();
  });

  it("navigates to a new path", async () => {
    const { hook, navigate } = memoryLocation({ path: "/initial" });
    let locationRef;

    const TestComponent = {
      setup() {
        const [location] = hook();
        locationRef = location;
        return { location };
      },
      template: "<div>{{ location }}</div>",
    };

    const wrapper = mount(TestComponent);
    await flushPromises();

    navigate("/new-path");
    await flushPromises();

    expect(locationRef.value).toBe("/new-path");
    wrapper.unmount();
  });

  it("records history when record is true", () => {
    const { history, navigate } = memoryLocation({
      path: "/start",
      record: true,
    });

    navigate("/step1");
    navigate("/step2");

    expect(history).toEqual(["/start", "/step1", "/step2"]);
  });

  it("does not navigate when static is true", async () => {
    const { hook, navigate } = memoryLocation({
      path: "/initial",
      static: true,
    });
    let locationRef;

    const TestComponent = {
      setup() {
        const [location] = hook();
        locationRef = location;
        return { location };
      },
      template: "<div>{{ location }}</div>",
    };

    const wrapper = mount(TestComponent);
    await flushPromises();

    navigate("/should-not-change");
    await flushPromises();

    expect(locationRef.value).toBe("/initial");
    wrapper.unmount();
  });
});

