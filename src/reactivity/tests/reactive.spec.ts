import { reactive, isReactive } from "../reactive";

describe("reactive", () => {
  it("test reactive", () => {
    const originalData = { foo: 1 };
    const observedData = reactive(originalData);
    expect(observedData).not.toBe(originalData);
    expect(observedData.foo).toBe(1);
    expect(isReactive(observedData)).toBe(true);
    expect(isReactive(originalData)).toBe(false);
  });
});
