import { readonly, isReadonly, isProxy } from "../reactive";

describe("readonly", () => {
  it("test readonly", () => {
    // readonly不能被改写，不能set（不会触发依赖），也不必收集依赖
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
    expect(isReadonly(wrapped)).toBe(true);
    expect(isReadonly(original)).toBe(false);
    expect(isReadonly(wrapped.bar)).toBe(true);
    expect(isReadonly(original.bar)).toBe(false);
    expect(isProxy(wrapped)).toBe(true);
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
