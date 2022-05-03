import { h, getCurrentInstance } from "../../lib/cute-vue.esm.js";

export const Foo = {
  name: "Foo",
  setup() {
    const instance = getCurrentInstance();
    console.log("Foo instance:", instance);
    return {};
  },
  render() {
    return h("div", {}, "foo");
  },
};
