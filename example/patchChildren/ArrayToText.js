// 老的是 Array --> 新的是 Text
// 或者
// 老的是 Text --> 新的是 Array

import { ref, h } from "../../lib/diy-vue.esm.js";

const prevChildren = [h("div", {}, "A"), h("div", {}, "B")]; // 老的是 Array
const nextChildren = "newChild"; // 新的是 Text

export default {
  name: "ArrayToText",
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
      self.isChange === true
        ? h("div", {}, nextChildren)
        : h("div", {}, prevChildren),
      h("button", { onClick: this.toggleClick }, "Array 与 Text 切换"),
    ]);
  },
};
