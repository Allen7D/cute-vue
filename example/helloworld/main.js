import { createApp, reactive } from "../../lib/cute-vue.esm.js";

const project = reactive({
  title: "Cute Vue",
});

createApp(`<h1>${project.title}</h1>`).mount(document.querySelector("#app"));
