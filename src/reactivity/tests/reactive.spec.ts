import { reactive } from "../reactive";

describe("reactive", () => {
  it("test reactive", () => {
    const originalData = { foo: 1 };
    const observedData = reactive(originalData);
    expect(observedData).not.toBe(originalData);
    expect(observedData.foo).toBe(1);
  });
});
