// 涉及 Diff 算法
// 老的是 Array --> 新的是 Array

import { ref, h } from "../../lib/cute-vue.esm.js";

// 5. 对比中间的部分
//    1. 创建新的 （在老的里面不存在，新的里面存在）
//    2. 删除老的  (在老的里面存在，新的里面不存在)
//    3. 移动 (节点存在于新的和老的里面，但是位置变了)

// 5.1.1.
// a b (c e d) f g
// a b (e c) f g
// 中间部分，老的比新的多， 那么多出来的直接就可以被干掉(优化删除逻辑)

const prevChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C", id: "c-prev", class: "red" }, "C"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "D" }, "D"),
  h("p", { key: "F" }, "F"),
  h("p", { key: "G" }, "G"),
];

const nextChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "C", id: "c-next", class: "blue" }, "C"),
  h("p", { key: "F" }, "F"),
  h("p", { key: "G" }, "G"),
];

export default {
  name: "ArrayToArray5_1_1",
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
      h(
        "div",
        { key: "tip" },
        "Tips: 中间部分，老的比新的多， 那么多出来的直接就可以被干掉(优化删除逻辑)"
      ),
      h("div", { key: "prev", class: "red" }, "prev: a b (c e d) f g"),
      h("div", { key: "next", class: "blue" }, "next: a b (e c) f g"),
      self.isChange === true
        ? h("div", { key: "ctx" }, nextChildren)
        : h("div", { key: "ctx" }, prevChildren),
      h("button", { key: "btn", onClick: this.toggleClick }, "5.1.1 删除老的"),
    ]);
  },
};
