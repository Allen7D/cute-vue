import { h } from "../../lib/diy-vue.esm.js";

export const App = {
  setup() {
    // 元素的位置 和 宽高
    return {
      x: 10,
      y: 10,
      width: 100,
      height: 200,
    };
  },
  render() {
    return h("rect", {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    });
  },
};
