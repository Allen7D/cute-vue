import { h } from "../../lib/diy-vue.esm.js";

import ArrayToText from "./ArrayToText.js";
import TextToText from "./TextToText.js";
import ArrayToArray1 from "./ArrayToArray1.js";
import ArrayToArray2 from "./ArrayToArray2.js";
import ArrayToArray3_1 from "./ArrayToArray3_1.js";
import ArrayToArray3_2 from "./ArrayToArray3_2.js";
import ArrayToArray4_1 from "./ArrayToArray4_1.js";
import ArrayToArray4_2 from "./ArrayToArray4_2.js";
import ArrayToArray5_1 from "./ArrayToArray5_1_0.js";
import ArrayToArray5_1_1 from "./ArrayToArray5_1_1.js";
import ArrayToArray5_2 from "./ArrayToArray5_2.js";
import ArrayToArray5_3 from "./ArrayToArray5_3.js";
import ArrayToArray5_4 from "./ArrayToArray5_4.js";
import ArrayToArray6 from "./ArrayToArray6.js";

export default {
  name: "App",
  setup() {},

  render() {
    return h("div", { tId: 1 }, [
      h("h4", {}, "更新 Children"),
      h("p", { class: "line" }),
      // 老的是 array 新的是 text 或者 老的是 text 新的是 array
      h(ArrayToText),
      h("p", { class: "line" }),
      // 老的是 text 新的是 text
      h(TextToText),
      h("p", { class: "line" }),
      // 老的是 array 新的是 array
      h(ArrayToArray1),
      h("p", { class: "line" }),
      h(ArrayToArray2),
      h("p", { class: "line" }),
      h(ArrayToArray3_1),
      h("p", { class: "line" }),
      h(ArrayToArray3_2),
      h("p", { class: "line" }),
      h(ArrayToArray4_1),
      h("p", { class: "line" }),
      h(ArrayToArray4_2),
      h("p", { class: "line" }),
      h(ArrayToArray5_1),
      h("p", { class: "line" }),
      h(ArrayToArray5_1_1),
      h("p", { class: "line" }),
      h(ArrayToArray5_2),
      h("p", { class: "line" }),
      h(ArrayToArray5_3),
      h("p", { class: "line" }),
      h(ArrayToArray5_4),
      h("p", { class: "line" }),
      h(ArrayToArray6),
    ]);
  },
};
