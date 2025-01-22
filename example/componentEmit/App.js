import { h } from "../../lib/diy-vue.esm.js";
import Foo from "./Foo.js";

export const App = {
  name: "App",
  render() {
    return h("div", {}, [
      h("div", {}, "App"),
      h(Foo, {
        // 接收参数
        onAdd(a, b) {
          console.log("on add", a, b);
        },
        // emit 中支持 add-foo 格式
        onAddFoo() {
          console.log("on add foo");
        },
      }),
    ]);
  },

  setup() {
    return {
      msg: "diy-vue",
    };
  },
};
