import {
  h,
  getCurrentInstance,
  ref,
  watch,
  watchEffect,
  watchSyncEffect,
  watchPostEffect,
} from "../../lib/diy-vue.esm.js";

export const App = {
  name: "App",
  setup() {
    const syncCount = ref(1);
    const postCount = ref(1);
    const preCount = ref(1);
    const instance = getCurrentInstance();

    // 改动几次，监听几次
    watch(
      syncCount,
      () => {
        // sync 模式下， watch 的 cb 先于视图更新执行，debugger 暂停在 dom 更新之后
        // 但是，视图更新是异步的，所以此处获取的 instance 还是旧的
        // 需要结合 nextTick 获取到最新的视图
        console.log("sync instance:", instance);
        debugger;
      },
      {
        flush: "sync",
      }
    );

    // 只监听最后一次修改(异步队列)
    watch(
      postCount,
      () => {
        // post 模式下， watch 的 cb 后于视图更新执行，debugger 暂停在 dom 更新之后
        // 此处获取的 instance 是最新的
        console.log("post instance:", instance);
        debugger;
      },
      {
        flush: "post",
      }
    );

    // 只监听最后一次修改(异步队列)
    // 默认 flush: "pre"
    watch(preCount, () => {
      // pre 模式下， watch 的 cb 先于视图更新执行， debugger 暂停在 dom 更新之前
      // 此处获取的 instance 是旧的
      // 需要结合 nextTick 获取到最新的视图
      console.log("pre instance:", instance);
      debugger;
    });

    function onSyncClick() {
      syncCount.value++;
      syncCount.value++;
    }

    function onPostClick() {
      postCount.value++;
      postCount.value++;
    }

    function onPreClick() {
      preCount.value++;
      preCount.value++;
    }

    /**
     * watchSyncEffect、watchPostEffect、watchEffect 三者的效果与 watch 的三种模式下一致
     * 包括执行时机、执行次数、对于 dom 的操作。
     *
     * watchEffect 系列方法
     *    3个方法都会在 setup 执行时（初始化）都执行一次，第1次的执行顺序只与代码里的顺序有关（依赖收集）。
     *    此后响应执行时，监听顺序为 watchSyncEffect > watchEffect > watchPostEffect
     *
     * 以下都监听 syncCount 的改动，便于观察顺序。
     */
    // 改动几次，监听几次
    watchSyncEffect(() => {
      console.log("watchEffect syncCount", syncCount.value);
      console.log("watchEffect sync instance:", instance);
      debugger;
    });
    // 只监听最后一次修改(异步队列)
    watchPostEffect(() => {
      console.log("watchEffect postCount", syncCount.value);
      console.log("watchEffect post instance:", instance);
      debugger;
    });
    // 只监听最后一次修改(异步队列)
    // 默认 pre
    watchEffect(() => {
      console.log("watchEffect (pre)Count", syncCount.value);
      console.log("watchEffect (pre) instance:", instance);
      debugger;
    });

    return {
      syncCount,
      onSyncClick,
      postCount,
      onPostClick,
      preCount,
      onPreClick,
    };
  },
  render() {
    const span1 = h("span", {}, "sync:" + this.syncCount);
    const button1 = h("button", { onClick: this.onSyncClick }, "update sync");

    const span2 = h("span", {}, "post:" + this.postCount);
    const button2 = h("button", { onClick: this.onPostClick }, "update post");

    const span3 = h("span", {}, "pre:" + this.preCount);
    const button3 = h("button", { onClick: this.onPreClick }, "update pre");

    return h("div", {}, [
      h("div", {}, [button1, span1]),
      h("div", {}, [button2, span2]),
      h("div", {}, [button3, span3]),
    ]);
  },
};
