import {
  h,
  ref,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
} from "../../lib/diy-vue.esm.js";

export const App = {
  name: "App",
  setup() {
    onBeforeMount(() => {
      printInfo("onBeforeMount");
    });
    onMounted(() => {
      printInfo("onMounted");
    });
    //
    onBeforeUpdate(() => {
      printInfo("onBeforeUpdate");
    });
    onUpdated(() => {
      printInfo("onUpdated");
    });

    function printInfo(lifecycle) {
      console.log("lifecycle: ", lifecycle);
    }

    //
    const count = ref(0);
    function handleClickCount() {
      count.value += 1;
    }

    return { count, handleClickCount };
  },

  render() {
    return h("div", {}, [
      h("p", {}, "apiLifecycle"),
      h("div", {}, `count: ${this.count}`),
      h("button", { onClick: this.handleClickCount }, "+1"),
    ]);
  },
};
