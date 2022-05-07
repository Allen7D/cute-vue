// 涉及 Diff 算法
// 老的是 Array --> 新的是 Array

import { ref, h } from "../../lib/cute-vue.esm.js";

// 5. 对比中间的部分
//    1. 创建新的 （在老的里面不存在，新的里面存在）
//    2. 删除老的  (在老的里面存在，新的里面不存在)
//    3. 移动 (节点存在于新的和老的里面，但是位置变了)

// 5.4. 综合例子
// a b (c d e z) f g
// a b (d c y e) f g

// 此处，每次渲染前都对 prevChildren 和 nextChildren 进行复制，避免删除操作会影响原始数据。

const prevChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C" }, "C"),
  h("p", { key: "D" }, "D"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "Z" }, "Z"),
  h("p", { key: "F" }, "F"),
  h("p", { key: "G" }, "G"),
];

const nextChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "D" }, "D"),
  h("p", { key: "C" }, "C"),
  h("p", { key: "Y" }, "Y"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "F" }, "F"),
  h("p", { key: "G" }, "G"),
];

export default {
  name: "ArrayToArray5_4",
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
      h("div", { key: "tip" }, "Tips: 综合例子"),
      h("div", { key: "prev", class: "red" }, "prev: a b (c d e z) f g"),
      h("div", { key: "next", class: "blue" }, "next: a b (d c y e) f g"),
      self.isChange === true
        ? h("div", { key: "ctx" }, [...nextChildren])
        : h("div", { key: "ctx" }, [...prevChildren]),
      h("button", { key: "btn", onClick: this.toggleClick }, "5.4. 综合例子"),
    ]);
  },
};
