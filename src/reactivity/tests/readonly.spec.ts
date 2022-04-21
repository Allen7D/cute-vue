import { readonly } from "../reactive";

describe("readonly", () => {
  it("test readonly", () => {
    // readonly不能被改写，不能set（不会触发依赖），也不必收集依赖
    const originalData = { foo: 1, bar: { baz: 2 } };
    const wrappedData = readonly(originalData);
    expect(wrappedData).not.toBe(originalData);
    expect(wrappedData.foo).toBe(1);
  });
});
