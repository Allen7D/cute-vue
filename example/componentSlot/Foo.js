import { h, renderSlots } from "../../lib/diy-vue.esm.js";

export const SingleSlot = {
  setup() {
    return {};
  },
  render() {
    const foo = h("p", {}, "1、单个插槽");
    return h("div", {}, [foo, renderSlots(this.$slots, "default")]);
  },
};

// 支持slot为多个
export const ArraySlot = {
  setup() {
    return {};
  },
  render() {
    const foo = h("p", {}, "2、多个插槽");
    return h("div", {}, [foo, renderSlots(this.$slots, "default")]);
  },
};

export const NameSlot = {
  setup() {
    return {};
  },
  render() {
    const foo = h("p", {}, "3、具名插槽");
    return h("div", {}, [
      foo,
      renderSlots(this.$slots, "header"),
      renderSlots(this.$slots, "default"),
      renderSlots(this.$slots, "footer"),
    ]);
  },
};

export const ScopeSlot = {
  setup() {
    return {};
  },
  render() {
    const foo = h("p", {}, "4、作用域插槽");
    const age = 18;
    return h("div", {}, [
      foo,
      renderSlots(this.$slots, "default", {
        age,
      }),
    ]);
  },
};
