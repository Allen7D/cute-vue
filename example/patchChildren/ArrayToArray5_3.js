// 涉及 Diff 算法
// 老的是 Array --> 新的是 Array

import { ref, h } from "../../lib/cute-vue.esm.js";

// 5. 对比中间的部分
//    1. 创建新的 （在老的里面不存在，新的里面存在）
//    2. 删除老的  (在老的里面存在，新的里面不存在)
//    3. 移动 (节点存在于新的和老的里面，但是位置变了)

// 5.3. 创建新的节点
// a b (c e) f g
// a b (e c d) f g
// d 节点在老的节点中不存在，新的里面存在，所以需要创建

const prevChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C" }, "C"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "F" }, "F"),
  h("p", { key: "G" }, "G"),
];

const nextChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "C" }, "C"),
  h("p", { key: "D" }, "D"),
  h("p", { key: "F" }, "F"),
  h("p", { key: "G" }, "G"),
];

export default {
  name: "ArrayToArray5_3",
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
      h("div", {}, "Tips: 创建新的节点"),
      h("div", { class: "red" }, "prev: a b (c e) f g"),
      h("div", { class: "blue" }, "next: a b (e c d) f g"),
      self.isChange === true
        ? h("div", {}, nextChildren)
        : h("div", {}, prevChildren),
      h("button", { onClick: this.toggleClick }, "5.3. 创建新的节点"),
    ]);
  },
};
