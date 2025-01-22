import { h } from "../../lib/diy-vue.esm.js";
import Foo from "./Foo.js";

window.self = null; // 便于浏览器调试
export const App = {
  name: "App",
  // 用 render 代替 .vue 的 <template></template>
  render() {
    window.self = this;
    return h("div", {}, [
      h(
        "div",
        {
          id: "root",
          class: ["large"],
          onClick: () => console.log("click"),
          onMouseDown: () => console.log("mousedown"),
        },
        [
          h("span", { class: "red" }, "hi, "),
          h("span", { class: "blue" }, this.msg),
        ]
      ),
      h(Foo, {
        count: 1,
      }),
    ]);
  },

  setup() {
    return {
      msg: "diy-vue",
    };
  },
};
