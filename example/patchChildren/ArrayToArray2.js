// 涉及 Diff 算法
// 老的是 Array --> 新的是 Array

import { ref, h } from "../../lib/cute-vue.esm.js";

// 2. 右侧的对比
// a (b c)
// d e (b c)
const prevChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C" }, "C"),
];
const nextChildren = [
  h("p", { key: "D" }, "D"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C" }, "C"),
];

export default {
  name: "ArrayToArray2",
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;

    const toggleClick = () => {
      isChange.value = !isChange.value;
    };

    return {
      isChange,
      toggleClick,
    };
  },
  render() {
    const self = this;

    return h("div", {}, [
      h("div", { key: "tip" }, "Tips: 右侧的对比"),
      h("div", { key: "prev", class: "red" }, "prev: a (b c)"),
      h("div", { key: "next", class: "blue" }, "next: d e (b c)"),
      self.isChange === true
        ? h("div", { key: "ctx" }, nextChildren)
        : h("div", { key: "ctx" }, prevChildren),
      h("button", { key: "btn", onClick: this.toggleClick }, "2. 右侧的对比"),
    ]);
  },
};
