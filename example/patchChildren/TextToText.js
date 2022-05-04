// 老的是 Text --> 新的是 Text
import { ref, h } from "../../lib/cute-vue.esm.js";

const prevChildren = "oldChild";
const nextChildren = "newChild";

export default {
  name: "TextToText",
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
      h("button", { onClick: this.toggleClick }, "Text 间切换"),
    ]);
  },
};
