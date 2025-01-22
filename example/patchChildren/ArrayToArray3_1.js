// 涉及 Diff 算法
// 老的是 Array --> 新的是 Array

import { ref, h } from "../../lib/diy-vue.esm.js";

// 3. 新的比老的长
//     创建新的
// 左侧
// (a b)
// (a b) c
// i = 2, e1 = 1, e2 = 2
const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
const nextChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C" }, "C"),
];

export default {
  name: "ArrayToArray3_1",
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
      h("div", {}, "Tips: 新的比老的长(左侧)，创建新的"),
      h("div", { class: "red" }, "prev: (a b) "),
      h("div", { class: "blue" }, "next: (a b) c"),
      self.isChange === true
        ? h("div", {}, nextChildren)
        : h("div", {}, prevChildren),
      h("button", { onClick: this.toggleClick }, "3.1. 新的比老的长(左侧)"),
    ]);
  },
};
