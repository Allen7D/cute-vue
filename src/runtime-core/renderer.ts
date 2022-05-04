import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/ShapeFlags";
import { Fragment, Text } from "./vnode";
import { createAppAPI } from "./createApp";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    createText: hostCreateText,
  } = options;

  function render(vnode, container) {
    // patch 中会进行递归处理
    patch(vnode, container, null);
  }

  // patch(打补丁)，分为挂载和更新，也包括区分 Component 的处理和 Element 的处理。
  function patch(vnode, container, parentComponent) {
    const { type, shapeFlag } = vnode;
    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent);
        break;
      case Text:
        processText(vnode, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parentComponent);
        }
        break;
    }
  }

  function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode, container, parentComponent);
  }

  function processText(vnode, container) {
    const { children } = vnode;
    const textNode = (vnode.el = hostCreateText(children));
    container.append(textNode);
  }

  function processElement(vnode, container, parentComponent) {
    mountElement(vnode, container, parentComponent);
  }

  // 挂载标签元素，通过递归来构建一棵节点树
  function mountElement(vnode, container, parentComponent) {
    const el = (vnode.el = hostCreateElement(vnode.type)); // 此处 type 类型为 string，表示普通标签元素

    const { children, shapeFlag, props } = vnode;

    // 处理 children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 单一子节点，且为string，就是文本节点
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent);
    }

    // 处理 props
    if (props) {
      for (const key in props) {
        const val = props[key];
        hostPatchProp(el, key, val);
      }
    }
    hostInsert(el, container);
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((v) => {
      patch(v, container, parentComponent);
    });
  }

  function processComponent(vnode, container, parentComponent) {
    // 组件初始化 or 组件更新
    mountComponent(vnode, container, parentComponent); // 组件初始化
  }

  // 挂载组件
  function mountComponent(initailVnode, container, parentComponent) {
    // 创建组件实例对象
    const instance = createComponentInstance(initailVnode, parentComponent);
    // 初始化组件
    setupComponent(instance);
    //
    setupRenderEffect(instance, initailVnode, container);
  }

  function setupRenderEffect(instance, initailVnode, container) {
    const { proxy } = instance;
    // 1、调用render，获取vnode(子组件
    // 渲染的不是App实例，而是 render 函数内部的 Element 的值)
    const subTree = instance.render.call(proxy); // 虚拟节点树
    // 2. 触发生命周期 beforeMount hook
    // TODO
    // 3. 调用patch，初始化子组件（递归）
    patch(subTree, container, instance); // 再进行 Component 和 Element 的判断（递归）
    // 4. 触发生命周期 mounted hook
    // TODO
    initailVnode.el = subTree.el;
  }

  return {
    // 当前的 renderer.ts 改为提供一个组合函数，需要接收「自定义渲染器的实现细节」
    // runtime-dom/index.ts 提供自定义渲染器的细节
    // 在 runtime-dom/index.ts 组合出自定义渲染器（重要）
    // createAppAPI 的核心还是提供 mount 和 render
    createApp: createAppAPI(render),
  };
}
