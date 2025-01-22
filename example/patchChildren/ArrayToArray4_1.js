// 涉及 Diff 算法
// 老的是 Array --> 新的是 Array

import { ref, h } from "../../lib/diy-vue.esm.js";

// 4. 老的比新的长
//     删除老的
// 左侧
// (a b) c
// (a b)
// i = 2, e1 = 2, e2 = 1
const prevChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C" }, "C"),
];
const nextChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];

export default {
  name: "ArrayToArray4_1",
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
      h("div", {}, "Tips: 老的比新的长(左侧)，删除老的"),
      h("div", { class: "red" }, "prev: (a b) c"),
      h("div", { class: "blue" }, "next: (a b)"),
      self.isChange === true
        ? h("div", {}, nextChildren)
        : h("div", {}, prevChildren),
      h("button", { onClick: this.toggleClick }, "4.1. 老的比新的长(左侧)"),
    ]);
  },
};
