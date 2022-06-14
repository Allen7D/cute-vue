import { computed } from "../computed";
import { effect } from "../effect";
import { reactive, isReadonly } from "../reactive";
import { ref } from "../ref";

describe("reactivity/computed", () => {
  it("should return updated value", () => {
    const value = reactive({});
    const cValue = computed(() => value.foo);
    expect(cValue.value).toBe(undefined);
    value.foo = 1;
    expect(cValue.value).toBe(1);
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

  // computed 可以触发副作用
  it("should trigger effect", () => {
    const value = reactive({});
    const cValue = computed(() => value.foo);
    let dummy;
    effect(() => {
      dummy = cValue.value; // computed 在依赖收集
    });
    expect(dummy).toBe(undefined);
    value.foo = 1; // 触发顺序 value.foo ==> cValue ==> dummy
    expect(cValue.value).toBe(1);
    expect(dummy).toBe(1);
  });

  it("should work when chained", () => {
    const value = reactive({ foo: 0 });
    const c1 = computed(() => value.foo);
    const c2 = computed(() => c1.value + 1);
    expect(c2.value).toBe(1);
    expect(c1.value).toBe(0);
    value.foo++;
    expect(c2.value).toBe(2);
    expect(c1.value).toBe(1);
  });

  it("should trigger effect when chained", () => {
    const value = reactive({ foo: 0 });
    const getter1 = jest.fn(() => value.foo);
    const getter2 = jest.fn(() => {
      return c1.value + 1;
    });
    const c1 = computed(getter1);
    const c2 = computed(getter2);

    let dummy;
    effect(() => {
      dummy = c2.value;
    });
    expect(dummy).toBe(1);
    expect(getter1).toHaveBeenCalledTimes(1);
    expect(getter2).toHaveBeenCalledTimes(1);
    value.foo++;
    expect(dummy).toBe(2);
    // should not result in duplicate calls
    expect(getter1).toHaveBeenCalledTimes(2);
    expect(getter2).toHaveBeenCalledTimes(2);
  });

  it("should no longer update when stopped", () => {
    const value = reactive({});
    const cValue = computed(() => value.foo);
    let dummy;
    effect(() => {
      dummy = cValue.value;
    });
    expect(dummy).toBe(undefined);
    value.foo = 1;
    expect(dummy).toBe(1);

    cValue.effect.stop();
    value.foo = 2;
    expect(dummy).toBe(1);
  });

  // 支持 setter
  it("should support setter", () => {
    const n = ref(1);
    const plusOne = computed({
      get: () => n.value + 1,
      set: (val) => {
        n.value = val - 1;
      },
    });

    expect(plusOne.value).toBe(2);
    n.value++;
    expect(plusOne.value).toBe(3);

    plusOne.value = 0;
    expect(n.value).toBe(-1);
  });

  it("should trigger effect with setter", () => {
    const n = ref(1);
    const plusOne = computed({
      get: () => n.value + 1,
      set: (val) => {
        n.value = val - 1;
      },
    });

    let dummy;
    effect(() => {
      dummy = n.value;
    });
    expect(dummy).toBe(1);

    plusOne.value = 0;
    expect(dummy).toBe(-1);
  });

  it("should be readonly", () => {
    let a = { a: 1 };
    const x = computed(() => a);
    expect(isReadonly(x)).toBe(true);
    expect(isReadonly(x.value)).toBe(false); // x.value 是 { a: 1 } 是可写的
    expect(isReadonly(x.value.a)).toBe(false);
    const z = computed<typeof a>({
      get() {
        return a;
      },
      set(v) {
        a = v;
      },
    });
    expect(isReadonly(z)).toBe(false);
    expect(isReadonly(z.value)).toBe(false);
    expect(isReadonly(z.value.a)).toBe(false);
  });

  it("should expose value when stopped", () => {
    const x = computed(() => 1);
    x.effect.stop();
    expect(x.value).toBe(1);
  });
});
