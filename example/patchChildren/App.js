import { h } from "../../lib/cute-vue.esm.js";

import ArrayToText from "./ArrayToText.js";
import TextToText from "./TextToText.js";
import ArrayToArray from "./ArrayToArray.js";

export default {
  name: "App",
  setup() {},

  render() {
    return h("div", { tId: 1 }, [
      h("h4", {}, "更新 Children"),
      // 老的是 array 新的是 text 或者 老的是 text 新的是 array
      h(ArrayToText),
      // 老的是 text 新的是 text
      h(TextToText),
      // 老的是 array 新的是 array
      // h(ArrayToArray),
    ]);
  },
};
