import { computed, reactive, ref } from "../../reactivity";
import { watchEffect, watch } from "../apiWatch";
import { nextTick } from "../scheduler";

describe("api: watch", () => {
  // watchEffect
  it("effect", () => {
    const state = reactive({
      count: 0,
    });
    let dummy;

    watchEffect(() => {
      dummy = state.count;
    });
    expect(dummy).toBe(0);

    state.count++;
    nextTick(() => {
      expect(dummy).toBe(1);
    });
  });

  // 侦听器 watch 的数据源是一个具有返回值的 getter 函数
  it("watching single source: getter", () => {
    const state = reactive({ count: 0 });
    let dummy;

    watch(
      () => state.count,
      (count, prevCount) => {
        dummy = [count, prevCount];
      }
    );
    state.count++;
    nextTick(() => {
      expect(dummy).toMatchObject([1, 0]);
    });
  });

  // 侦听器 watch 数据源是一个 ref
  it("watching single source: ref", () => {
    const count = ref(0);
    let dummy;

    watch(count, (count, prevCount) => {
      dummy = [count, prevCount];
    });
    count.value++;
    nextTick(() => {
      expect(dummy).toMatchObject([1, 0]);
    });
  });

  // watch
  it("should not fire if watched getter result did not change", () => {
    const spy = jest.fn();
    const n = ref(0);
    watch(() => n.value % 2, spy);

    n.value++;
    nextTick(() => {
      expect(spy).toBeCalledTimes(1);
    });

    n.value += 2;
    nextTick(() => {
      // should not be called again because getter result did not change
      expect(spy).toBeCalledTimes(1);
    });
  });

  it("watching single source: computed ref", () => {
    const count = ref(0);
    const plus = computed(() => count.value + 1);
    let dummy;
    watch(plus, (count, prevCount) => {
      dummy = [count, prevCount];
    });
    count.value++;
    nextTick(() => {
      expect(dummy).toMatchObject([2, 1]);
    });
  });

  it("watching primitive with deep: true", () => {
    const count = ref(0);
    let dummy;
    watch(
      count,
      (c, prevCount) => {
        dummy = [c, prevCount];
      },
      {
        deep: true,
      }
    );
    count.value++;
    nextTick(() => {
      expect(dummy).toMatchObject([1, 0]);
    });
  });

  it("directly watching reactive object (with automatic deep: true)", () => {
    const src = reactive({
      count: 0,
    });
    let dummy;
    watch(src, ({ count }) => {
      dummy = count;
    });
    src.count++;
    nextTick(() => {
      expect(dummy).toBe(1);
    });
  });

  it("watching multiple sources", () => {
    const state = reactive({ count: 1 });
    const count = ref(1);
    const plus = computed(() => count.value + 1);

    let dummy;
    watch([() => state.count, count, plus], (vals, oldVals) => {
      dummy = [vals, oldVals];
    });

    state.count++;
    count.value++;

    nextTick(() => {
      expect(dummy).toMatchObject([
        [2, 2, 3],
        [1, 1, 2],
      ]);
    });
  });

  // 停止侦听
  it("stopping the watcher (effect)", () => {
    const state = reactive({ count: 0 });
    let dummy;

    const stop = watchEffect(() => {
      dummy = state.count;
    });
    expect(dummy).toBe(0);

    stop();
    state.count++;

    nextTick(() => {
      expect(dummy).toBe(0);
    });
  });

  it("watching multiple sources", () => {
    const state = reactive({ count: 1 });
    const count = ref(1);

    let dummy;
    watch([() => state.count, count], (vals, oldVals) => {
      dummy = [vals, oldVals];
    });

    state.count++;
    count.value++;
    nextTick(() => {
      expect(dummy).toMatchObject([
        [2, 2],
        [1, 1],
      ]);
    });
  });
});
