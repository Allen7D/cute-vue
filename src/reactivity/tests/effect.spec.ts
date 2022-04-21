import { effect, stop } from "../effect";
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

  it("scheduler", () => {
    // 1. 通过 effect 的第二个参数 scheduler(一个fn)
    // 2. effect 第一次执行时，执行fn
    // 3. 当响应式对象 set 时(update)，不会执行fn，而是执行scheduler
    // 4. 但，当执行runner的时候，则会再次执行 fn
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    }); // 理解成声明一个函数
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled(); // scheduler还未执行
    expect(dummy).toBe(1); // 此前，effct的fn已执行了
    // should be called on first trigger
    obj.foo++; // 没有触发effct的fn，但触发了scheduler
    expect(scheduler).toHaveBeenCalled(); // scheduler已执行，且run=runner
    expect(dummy).toBe(1); // effct的fn没有执行
    run();
    expect(dummy).toBe(2); // effct的fn再次执行
  });

  it("stop", () => {
    let dummy;
    const obj = reactive({ props: 1 });
    const runner = effect(() => {
      dummy = obj.props;
    });
    obj.props = 2;
    expect(dummy).toBe(2);
    stop(runner); // 移除响应式对象中的对应的依赖，不再被触发
    obj.props = 3;
    expect(dummy).toBe(2); // 不再触发对应的依赖，所以结果不变

    runner(); // 再次执行runner，且再次触发依赖收集（类似于撤销了stop的效果）
    expect(dummy).toBe(3);

    obj.props = 4; // 触发了effct的fn
    expect(dummy).toBe(4);
  });

  it("onStop", () => {
    const obj = reactive({
      foo: 1,
    });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );

    stop(runner);
    expect(onStop).toBeCalledTimes(1); // 执行stop时触发onStop
  });
});
