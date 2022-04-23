import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
  it("test computed", () => {
    const user = reactive({
      age: 1,
    });

    const age = computed(() => {
      return user.age;
    });

    expect(age.value).toBe(1);
  });

  it("should compute lazily", () => {
    const value = reactive({
      foo: 1,
    });
    const getter = jest.fn(() => {
      return value.foo;
    });
    const cValue = computed(getter);

    // lazy
    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(1); // 只有在.value时，getter才被调用
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute again
    cValue.value; // 触发了getter
    expect(getter).toHaveBeenCalledTimes(1); // 再次触发，getter不会重复执行

    // should not compute until needed
    value.foo = 2; // 基于依赖收集
    expect(getter).toHaveBeenCalledTimes(1);

    // now it should compute
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
