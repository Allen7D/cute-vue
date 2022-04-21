import { effect } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it("test effect", () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    // update data
    user.age++;
    expect(nextAge).toBe(12);
  });

  it("should return runner when call effect", () => {
    // effct(fn)会返回runenr函数，再次执行runner会再次执行fn，且runner()返回的是执行fn()的运行结果。
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return "foo";
    });

    expect(foo).toBe(11);
    const res = runner();
    expect(foo).toBe(12);
    expect(res).toBe("foo");
  });
});
