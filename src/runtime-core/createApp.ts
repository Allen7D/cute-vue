// 构建 render
import { createVNode } from "./vnode";

export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // rootContainer.innerHTML = rootComponent;
        const vnode = createVNode(rootComponent);

        render(vnode, rootContainer);
      },
    };
  };
}
