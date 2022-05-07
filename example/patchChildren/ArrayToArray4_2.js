// 涉及 Diff 算法
// 老的是 Array --> 新的是 Array

import { ref, h } from "../../lib/cute-vue.esm.js";

// 4. 老的比新的长
//     删除老的
// 右侧
// a (b c)
// (b c)
// i = 0, e1 = 0, e2 = -1

const prevChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C" }, "C"),
];
const nextChildren = [h("p", { key: "B" }, "B"), h("p", { key: "C" }, "C")];

// 5. 对比中间的部分
//    1. 创建新的 （在老的里面不存在，新的里面存在）
//    2. 删除老的  (在老的里面存在，新的里面不存在)
//    3. 移动 (节点存在于新的和老的里面，但是位置变了)
//         - 使用最长子序列来优化

export default {
  name: "ArrayToArray4_2",
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
      h("div", {}, "Tips: 老的比新的长(右侧)，删除老的"),
      h("div", { class: "red" }, "prev: a (b c)"),
      h("div", { class: "blue" }, "next: (b c)"),
      self.isChange === true
        ? h("div", {}, nextChildren)
        : h("div", {}, prevChildren),
      h("button", { onClick: this.toggleClick }, "4.2. 老的比新的长(右侧)"),
    ]);
  },
};
