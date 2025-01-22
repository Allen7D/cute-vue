import { h } from "../../lib/diy-vue.esm.js";

const Foo = {
  setup(props, { emit }) {
    const handleEmitAdd = (argments) => {
      // 向父组件 emit
      emit("add", 1, 2); // 支持传参
      emit("add-foo"); // 支持xxx-yyy的写法
    };

    return {
      handleEmitAdd,
    };
  },
  render() {
    const btn = h(
      "button",
      {
        onClick: this.handleEmitAdd,
      },
      "处理 Emit"
    );
    const foo = h("p", {}, "foo");
    return h("div", {}, [foo, btn]);
  },
};

export default Foo;
