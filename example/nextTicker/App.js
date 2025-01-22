import {
  h,
  ref,
  getCurrentInstance,
  nextTick,
} from "../../lib/diy-vue.esm.js";

export default {
  name: "App",
  setup() {
    const count = ref(1);
    const instance = getCurrentInstance();

    function onClick() {
      for (let i = 0; i < 100; i++) {
        count.value = i;
      }

      console.log(instance);
      debugger; // 此时 debugger 中 DOM（对应的 instance ）还未更新。
      // nextTick 将回调推迟到下一个 DOM 更新周期之后执行。
      // https://v3.cn.vuejs.org/api/global-api.html#nexttick
      nextTick(() => {
        console.log(instance);
      });
    }

    // async function onClick() {
    //   for (let i = 0; i < 100; i++) {
    //     count.value = i;
    //   }
    //   console.log(instance);
    //   debugger;
    //   await nextTick();
    //   console.log(instance);
    // }

    return {
      count,
      onClick,
    };
  },
  render() {
    const button = h("button", { onClick: this.onClick }, "update");
    const p = h("p", {}, "count:" + this.count);

    return h("div", {}, [button, p]);
  },
};
