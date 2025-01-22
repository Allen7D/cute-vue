// 涉及 Diff 算法
// 老的是 Array --> 新的是 Array

import { ref, h } from "../../lib/diy-vue.esm.js";

// 6. 某个子节点没有 key 的场景
//  c 节点应该是 move 而不是删除之后重新创建的
// a (c b) d
// a (b c) d

const prevChildren = [
  h("p", { key: "A" }, "A"),
  h("p", {}, "C"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "D" }, "D"),
];

const nextChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", {}, "C"),
  h("p", { key: "D" }, "D"),
];

export default {
  name: "ArrayToArray6",
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
      h("div", {}, "Tips: C 没有 key 的场景"),
      h("div", { class: "red" }, "prev: a (c b) d"),
      h("div", { class: "blue" }, "next: a (b c) d"),
      self.isChange === true
        ? h("div", {}, nextChildren)
        : h("div", {}, prevChildren),
      h("button", { onClick: this.toggleClick }, "6. C 没有 key"),
    ]);
  },
};
