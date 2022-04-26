import { h } from "../../lib/cute-vue.esm.js";

export const App = {
  // 用 render 代替 .vue 的 <template></template>
  render() {
    return h(
      "div",
      {
        id: "root",
        class: ["large"],
      },
      [
        h("span", { class: "red" }, "hi, "),
        h("span", { class: "blue" }, "cute-vue"),
      ]
    );
  },

  setup() {
    return {
      msg: "cute-vue",
    };
  },
};
