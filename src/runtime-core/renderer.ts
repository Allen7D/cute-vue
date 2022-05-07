import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/ShapeFlags";
import { Fragment, isSameVNodeType, Text } from "./vnode";
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
    patch(null, vnode, container, null, null);
  }

  /**
   * patch(打补丁)，分为挂载和更新。
   * 包括区分 Component 的处理和 Element 的处理，增加了对 Fragment 和 Text 的处理。
   * @param n1 旧节点
   * @param n2 新节点
   * @param container 容器元素（挂载点）
   * @param parentComponent 父组件（相对于当前组件）
   * @param anchor 容器中的锚点，用于插入
   */
  function patch(n1, n2, container, parentComponent, anchor) {
    const { type, shapeFlag } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processText(n1, n2, container) {
    const { children } = n2;
    const textNode = (n2.el = hostCreateText(children));
    container.append(textNode);
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;

    const el = (n2.el = n1.el);

    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
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
        // Diff 算法
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      } else {
        hostSetElementText(container, ""); // 将容器清空
        mountChildren(c2, container, parentComponent, anchor); // 将新的「一组子节点」逐个挂载
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

  /**
   * 双端 Diff 算法
   * Vue2 对应的代码 https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js#L404
   * @param c1 旧节点的 children
   * @param c2 新节点的 children
   * @param container 容器
   * @param parentComponent 父组件
   * @param parentAnchor
   */
  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    const l1 = c1.length;
    const l2 = c2.length;
    // 四个索引值
    let oldStartIdx = 0;
    let oldEndIdx = l1 - 1;
    let newStartIdx = 0;
    let newEndIdx = l2 - 1;
    // 四个索引指向的 vnode 节点
    let oldStartVNode = c1[oldStartIdx];
    let oldEndVNode = c1[oldEndIdx];
    let newStartVNode = c2[newStartIdx];
    let newEndVNode = c2[newEndIdx];

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      // 判断旧的双端的首位节点是否存在
      // 如果为 undefined，则说明该节点已经被处理过了，直接跳到下一个位置
      if (!oldStartVNode) {
        oldStartVNode = c1[++oldStartIdx];
      } else if (!oldEndVNode) {
        oldEndVNode = c1[--oldEndIdx];
      } else if (oldStartVNode.key === newStartVNode.key) {
        // 第一步: oldStartVNode 和 newStartVNode 比较
        // 节点在新的顺序中仍然位于顶部，不需要移动 DOM
        patch(oldStartVNode, newStartVNode, container, parentComponent, null);
        // 更新索引，并指向下一个位置
        oldStartVNode = c1[++oldStartIdx];
        newStartVNode = c2[++newStartIdx];
      } else if (oldEndVNode.key === newEndVNode.key) {
        // 第二步: oldEndVNode 和 newEndVNode 比较
        // 节点在新的顺序中仍然位于尾部，不需要移动 DOM
        patch(oldEndVNode, newEndVNode, container, parentComponent, null);
        // 更新索引，并指向下一个位置
        oldEndVNode = c1[--oldEndIdx];
        newEndVNode = c2[--newEndIdx];
      } else if (oldStartVNode.key === newEndVNode.key) {
        // 第三步: oldStartVNode 和 newEndVNode 比较
        patch(oldStartVNode, newEndVNode, container, parentComponent, null);
        // 节点在新的顺序中位于尾部，需要移动 DOM 到（旧的）双端区域的尾部
        const anchor = oldEndVNode.el.nextSibling; // 双端区域的尾部
        hostInsert(newEndVNode.el, container, anchor); // 将 DOM 从双端区域的顶部移动到双端区域尾部
        // 更新索引，并指向下一个位置
        oldStartVNode = c1[++oldStartIdx];
        newEndVNode = c2[--newEndIdx];
      } else if (oldEndVNode.key === newStartVNode.key) {
        // 第四步: oldEndVNode 和 newStartVNode 比较
        patch(oldEndVNode, newStartVNode, container, parentComponent, null);
        // 移动 DOM
        const anchor = oldStartVNode.el;
        hostInsert(newStartVNode.el, container, anchor);
        // 更新索引值，并指向下一个位置
        oldEndVNode = c1[--oldEndIdx];
        newStartVNode = c2[++newStartIdx];
      } else {
        // 在新旧双端的首尾节点，没有匹配到，则进入「旧的一组子节点」中遍历，查到与 newStartVNode 相同 key 值的节点
        // 此外，需判断 vnode 可以为 undefined
        const idxInOld = c1.findIndex((vnode) => {
          return vnode && vnode.key === newStartVNode.key;
        });
        if (idxInOld > -1) {
          const vnodeToMove = c1[idxInOld]; // 需要移动的旧的节点
          patch(vnodeToMove, newStartVNode, container, parentComponent, null);
          const anchor = oldStartVNode.el; // oldStartVNode.el 是（旧的）双端的顶部
          // 将 vnodeToMove.el 移动到 旧的双端的前面
          hostInsert(vnodeToMove.el, container, anchor);
          c1[idxInOld] = undefined; // 旧双端内部的节点被移动到双端之外，以后不在需要移动，因此需要设为undefined
        } else {
          // 新增
          const anchor = oldStartVNode.el; // 因为 newStartVNode 位于新的双端的顶部，所以要新增在旧的双端的顶部
          patch(null, newStartVNode, container, parentComponent, anchor);
        }
        newStartVNode = c2[++newStartIdx];
      }
    }

    // 循环结束后，检查索引值的情况
    // 如果新的双端未结束: newStartIdx <= newEndIdx
    // 新增操作
    if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
      for (let i = newStartIdx; i <= newEndIdx; i++) {
        let anchor = c2[newEndIdx + 1] ? c2[newEndIdx + 1].el : null; // c2[newEndIdx + 1] 是已经被处理过的节点，其对应的真实 DOM 可以用来作为锚点
        patch(null, c2[i], container, parentComponent, anchor);
      }
    } else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
      // 如果旧的双端未结束: oldStartIdx <= oldEndIdx
      // 移除操作
      for (let i = oldStartIdx; i <= oldEndIdx; i++) {
        unmount(c1[i]);
      }
    }
  }

  function unmount(vnode) {
    if (vnode.type === Fragment) {
      vnode.children.forEach((c) => unmount(c));
      return;
    }
    hostRemove(vnode.el);
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
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
  function mountElement(vnode, container, parentComponent, anchor) {
    const el = (vnode.el = hostCreateElement(vnode.type)); // 此处 type 类型为 string，表示普通标签元素

    const { children, shapeFlag, props } = vnode;

    // 处理 children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 单一子节点，且为string，就是文本节点
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor);
    }

    // 处理 props
    if (props) {
      for (const key in props) {
        const val = props[key];
        hostPatchProp(el, key, null, val);
      }
    }
    hostInsert(el, container, anchor);
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    // 组件初始化 or 组件更新
    mountComponent(n2, container, parentComponent, anchor); // 组件初始化
  }

  // 挂载组件
  function mountComponent(initailVnode, container, parentComponent, anchor) {
    const instance = createComponentInstance(initailVnode, parentComponent); // 创建组件实例对象
    setupComponent(instance); // 初始化组件
    setupRenderEffect(instance, initailVnode, container, anchor); // 处理组件的依赖
  }

  function setupRenderEffect(instance, initailVnode, container, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance;
        // 1、调用render，获取vnode(子组件
        // 渲染的不是App实例，而是 render 函数内部的 Element 的值
        const subTree = (instance.subTree = instance.render.call(proxy)); // 虚拟节点树
        // 2. 触发生命周期 beforeMount hook
        // TODO
        // 3. 调用patch，初始化子组件（递归）
        patch(null, subTree, container, instance, anchor); // 再进行 Component 和 Element 的判断（递归）
        // 4. 触发生命周期 mounted hook
        // TODO
        initailVnode.el = subTree.el;
        instance.isMounted = true;
      } else {
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;
        instance.subTree = subTree;
        patch(prevSubTree, subTree, container, instance, anchor);
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
