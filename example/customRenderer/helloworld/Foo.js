import { h } from "../../lib/cute-vue.esm.js";

const Foo = {
  render() {
    return h("div", {}, "count: " + this.count);
  },

  setup(props) {
    console.log("props", props);
  },
};

export default Foo;
