import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/ShapeFlags";
import { Fragment, Text } from "./vnode";
import { createAppAPI } from "./createApp";
import { EMPTY_OBJ } from "../shared";
import { effect } from "../reactivity";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    createText: hostCreateText,
    setElementText: hostSetElementText,
    remove: hostRemove,
  } = options;

  /**
   *
   * @param vnode 虚拟节点
   * @param container 容器元素（挂载点）
   */
  function render(vnode, container) {
    // patch 中会进行递归处理
    patch(null, vnode, container, null);
  }

  /**
   * patch(打补丁)，分为挂载和更新。
   * 包括区分 Component 的处理和 Element 的处理，增加了对 Fragment 和 Text 的处理。
   * @param n1 旧节点
   * @param n2 新节点
   * @param container 容器元素（挂载点）
   * @param parentComponent 父组件（相对于当前组件）
   */
  function patch(n1, n2, container, parentComponent) {
    const { type, shapeFlag } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }

  function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2.children, container, parentComponent);
  }

  function processText(n1, n2, container) {
    const { children } = n2;
    const textNode = (n2.el = hostCreateText(children));
    container.append(textNode);
  }

  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      patchElement(n1, n2, container, parentComponent);
    }
  }

  function patchElement(n1, n2, container, parentComponent) {
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;

    const el = (n2.el = n1.el);

    patchChildren(n1, n2, el, parentComponent);
    patchProps(el, oldProps, newProps);
  }

  function patchChildren(n1, n2, container, parentComponent) {
    const { shapeFlag: prevShapeFlag, children: c1 } = n1; // 旧子节点
    const { shapeFlag, children: c2 } = n2; // 新子节点

    // 基于新节点的情况来区分: 文本节点、一组子节点、没有子节点
    // 情况一: 新子节点的类型是「文本节点」
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 旧子节点为「一组子节点」，需要逐个卸载
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
      // 情况二: 新子节点的类型是「一组子节点」
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新旧子节点都是「一组子节点」，涉及 Diff 算法
        // 非 Diff 算法（暴力处理: 先全部卸载，再重新挂载）
        unmountChildren(c1);
        mountChildren(c2, container, parentComponent);
      } else {
        hostSetElementText(container, ""); // 将容器清空
        mountChildren(c2, container, parentComponent); // 将新的「一组子节点」逐个挂载
      }
      // 情况三: 新节点不存在
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      } else {
        hostSetElementText(container, "");
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      // 新增属性
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];

        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        // 移除属性
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null);
          }
        }
      }
    }
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
      mountChildren(vnode.children, el, parentComponent);
    }

    // 处理 props
    if (props) {
      for (const key in props) {
        const val = props[key];
        hostPatchProp(el, key, null, val);
      }
    }
    hostInsert(el, container);
  }

  function mountChildren(children, container, parentComponent) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent);
    });
  }

  function processComponent(n1, n2, container, parentComponent) {
    // 组件初始化 or 组件更新
    mountComponent(n2, container, parentComponent); // 组件初始化
  }

  // 挂载组件
  function mountComponent(initailVnode, container, parentComponent) {
    const instance = createComponentInstance(initailVnode, parentComponent); // 创建组件实例对象
    setupComponent(instance); // 初始化组件
    setupRenderEffect(instance, initailVnode, container); // 处理组件的依赖
  }

  function setupRenderEffect(instance, initailVnode, container) {
    effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance;
        // 1、调用render，获取vnode(子组件
        // 渲染的不是App实例，而是 render 函数内部的 Element 的值
        const subTree = (instance.subTree = instance.render.call(proxy)); // 虚拟节点树
        // 2. 触发生命周期 beforeMount hook
        // TODO
        // 3. 调用patch，初始化子组件（递归）
        patch(null, subTree, container, instance); // 再进行 Component 和 Element 的判断（递归）
        // 4. 触发生命周期 mounted hook
        // TODO
        initailVnode.el = subTree.el;
        instance.isMounted = true;
      } else {
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;
        instance.subTree = subTree;
        patch(prevSubTree, subTree, container, instance);
      }
    });
  }

  return {
    // 当前的 renderer.ts 改为提供一个组合函数，需要接收「自定义渲染器的实现细节」
    // runtime-dom/index.ts 提供自定义渲染器的细节
    // 在 runtime-dom/index.ts 组合出自定义渲染器（重要）
    // createAppAPI 的核心还是提供 mount 和 render
    createApp: createAppAPI(render),
  };
}
