import { render } from "./renderer";
import { createVNode } from "./vnode";

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // rootContainer.innerHTML = rootComponent;
      const vnode = createVNode(rootComponent);

      render(vnode, rootContainer);
    },
  };
}
