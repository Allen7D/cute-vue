// 组件 provide 和 inject 功能
import { h, provide, inject } from "../../lib/cute-vue.esm.js";

const Provider = {
  name: "Provider",
  setup() {
    provide("foo", "fooVal");
    provide("bar", "barVal");
  },
  render() {
    return h("div", {}, [h("p", {}, "Provider"), h(ProviderTwo)]);
  },
};

const ProviderTwo = {
  name: "ProviderTwo",
  setup() {
    provide("foo", "fooTwo"); // 不能影响父组件的 provide 值（因为还有其他兄弟组件），只影响子孙组件
    const foo = inject("foo"); // 父组件的 provide 值

    return {
      foo,
    };
  },
  render() {
    return h("div", {}, [
      h("p", {}, `ProviderTwo foo: ${this.foo}`),
      h(Consumer),
    ]);
  },
};

const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");

    return {
      foo,
      bar,
    };
  },

  render() {
    return h("div", {}, `Consumer: ${this.foo} - ${this.bar}`);
  },
};

export const App = {
  name: "App",
  render() {
    return h("div", {}, [h("p", {}, "apiInject"), h(Provider)]);
  },

  setup() {
    return {};
  },
};
