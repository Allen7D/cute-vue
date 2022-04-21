import { readonly, isReadonly } from "../reactive";

describe("readonly", () => {
  it("test readonly", () => {
    // readonly不能被改写，不能set（不会触发依赖），也不必收集依赖
    const originalData = { foo: 1, bar: { baz: 2 } };
    const wrappedData = readonly(originalData);
    expect(wrappedData).not.toBe(originalData);
    expect(wrappedData.foo).toBe(1);
    expect(isReadonly(wrappedData)).toBe(true);
    expect(isReadonly(originalData)).toBe(false);
  });

  it("warn then call set", () => {
    console.warn = jest.fn();

    const user = readonly({
      age: 10,
    });
    user.age = 11; // 修改readonly的对象
    expect(console.warn).toBeCalled(); // 调用console.warn的地方，有没有被执行到
  });
});
