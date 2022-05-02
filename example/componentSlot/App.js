import { h } from "../../lib/cute-vue.esm.js";
import { SingleSlot, ArraySlot, NameSlot, ScopeSlot } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App");
    // 将<p>这是slot</p> 作为<Foo></Foo>的children
    // template的写法为:
    // <SingleSlot>
    //   <p>这是slot</p>
    // </SingleSlot>
    const singleSlot = h(
      SingleSlot,
      {},
      {
        default: () => h("p", {}, "这是slot"),
      }
    );
    // <ArraySlot>
    //   <p>这是slot1</p>
    //   <p>这是slot2</p>
    // </ArraySlot>
    const arraySlot = h(
      ArraySlot,
      {},
      {
        default: () => [h("p", {}, "slot1"), h("p", {}, "slot2")],
      }
    );
    // <NameSlot>
    //   <template v-slot:header>
    //     <p>具名插槽: header</p>
    //   </template>

    //   <p>具名插槽: defaultLeft</p>
    //   <p>具名插槽: defaultRight</p>

    //   <template v-slot:footer>
    //     <p>具名插槽: footer</p>
    //   </template>
    // </NameSlot>
    const nameSlot = h(
      NameSlot,
      {},
      {
        header: () => h("p", {}, "header"),
        footer: () => h("p", {}, "footer"),
        default: () => [
          h("span", {}, "defaultLeft、"),
          h("span", {}, "defaultRight"),
        ],
      }
    );

    // 作用域插槽
    // <template slot-scope="age">
    //   <div>My age is {{age}}</div>
    // </template>
    const scopeSlot = h(
      ScopeSlot,
      {},
      {
        default: ({ age }) => [h("div", {}, "My age is " + age)],
      }
    );

    return h("div", {}, [app, singleSlot, arraySlot, nameSlot, scopeSlot]);
  },

  setup() {
    return {};
  },
};
