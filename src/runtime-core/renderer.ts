import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/ShapeFlags";

export function render(vnode, container) {
  // patch 中会进行递归处理
  patch(vnode, container);
}

// patch(打补丁)，分为挂载和更新，也包括区分 Component 的处理和 Element 的处理。
function patch(vnode, container) {
  const { shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container);
  }
}

function processElement(vnode, container) {
  mountElement(vnode, container);
}

// 挂载标签元素，通过递归来构建一棵节点树
function mountElement(vnode, container) {
  const el = (vnode.el = document.createElement(vnode.type)); // 此处 type 类型为 string，表示普通标签元素

  const { children, shapeFlag, props } = vnode;

  // 处理 children
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // 单一子节点，且为string，就是文本节点
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChild(vnode, el);
  }

  // 处理 props
  if (props) {
    for (const key in props) {
      const val = props[key];
      // 判断以on开头的注册事件
      if (/^on[A-Z]/.test(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, props[key]);
      } else {
        el.setAttribute(key, val);
      }
    }
  }
  container.append(el);
}

function mountChild(vnode, container) {
  vnode.children.forEach((v) => {
    patch(v, container);
  });
}

function processComponent(vnode, container) {
  // 组件初始化 or 组件更新
  mountComponent(vnode, container); // 组件初始化
}

// 挂载组件
function mountComponent(initailVnode, container) {
  // 创建组件实例对象
  const instance = createComponentInstance(initailVnode);
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
  patch(subTree, container); // 再进行 Component 和 Element 的判断（递归）
  // 4. 触发生命周期 mounted hook
  // TODO
  initailVnode.el = subTree.el;
}
