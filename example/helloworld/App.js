import { h } from "../../lib/cute-vue.esm.js";

window.self = null; // 便于浏览器调试
export const App = {
  // 用 render 代替 .vue 的 <template></template>
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        class: ["large"],
      },
      [
        h("span", { class: "red" }, "hi, "),
        h("span", { class: "blue" }, this.msg),
      ]
    );
  },

  setup() {
    return {
      msg: "cute-vue",
    };
  },
};
