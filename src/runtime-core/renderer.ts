import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/ShapeFlags";
import { Fragment, isSameVNodeType, Text } from "./vnode";
import { shouldUpdateComponent } from "./componentUpdateUtils";
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
   * 快速 Diff 算法 （最长递增子序列）
   * Vue3 对应的代码 https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts#L1752
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
    const l2 = c2.length;
    let i = 0;
    let e1 = c1.length - 1; // prev ending index
    let e2 = l2 - 1; // next ending index

    // while 循环从前向后遍历，直到遇到新、旧不同 key 值的节点为止
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      i++;
    }

    // while 循环从后向前遍历，直到遇到新、旧不同 key 值的节点为止
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      e1--;
      e2--;
    }
    // i 与 e2 之间的节点（作为新节点）需要插入
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null; // c2 的 nextPos 如果存在，则 c2[nextPos].el 是已经处理过的节点，可以作为锚点
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    }
    // i 与 e1 之间的节点需要卸载
    else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    } else {
      // 中间对比（算法的核心）
      let s1 = i; // prev starting index
      let s2 = i; // next starting index

      const toBePatched = e2 - s2 + 1; // 新的一组节点中剩余未被处理的节点的个数
      let patched = 0; // 统计剩余新节点被处理的次数（用途：与 toBePatched 比较）
      let moved = false; // 是否需要移动节点
      let maxNewIndexSoFar = 0; // 遍历旧的一组子节点的过程中遇到的最大索引值（与 moved 结合使用）
      const newIndexToOldIndexMap = new Array(toBePatched); // 基于新的一组节点中剩余未被处理的节点，构建新旧节点的索引下标的映射
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;

      //  构建索引表。新的一组节点中，还未patch的节点预处理称 { key: index } 结构
      const keyToNewIndexMap = new Map();
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      // 遍历旧的一组节点中剩余未被处理的节点
      // 基于相同的key，旧节点的下标 --> key --> 新节点的下标 --> 新节点在 keyToNewIndexMap 中的下标
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        if (patched >= toBePatched) {
          unmount(prevChild);
          continue;
        }

        // 找到相同 key 的节点，或者没有 key 但是 type 相同的节点
        let newIndex; // 与 prevChild 节点对应的的「新节点的下标索引」
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          // 遍历新的一组节点中剩余未被处理的节点，找没有 key 但是 type 相同的节点
          for (let j = s2; j <= e2; j++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        // newIndex 存在，表明旧节点 prevChild 可被复用
        if (newIndex === undefined) {
          unmount(prevChild);
        } else {
          // 此处对 newIndex 的判断，是在旧节点的遍历逻辑里（从头到尾）
          // newIndex 是依次递增（e.x 3、4、5、6）则不会让 moved 为 true（递增表示新、旧的顺序是相同的）
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          // 构建一个新的数组 newIndexToOldIndexMap
          // newIndexToOldIndexMap 存着未被处理的所有新节点的信息（「新节点所对应上的旧节点」所在旧的一组子节点中的位置）
          // 新节点 <--> key <---> 旧节点 <--> 旧的下标索引
          // ==> 新节点 <--> 旧的下标索引 + 1 (如果没有对应上的，则继续为0)
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }

      // 将新的一组节点中剩余未被处理的节点组成新的数组，计算出「不用移动的节点」的「索引」
      // 即「最长递增子序列」
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      let j = increasingNewIndexSequence.length - 1; // 最长递增子序列的尾部指针
      //
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex]; // 新的节点（从后向前）
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null; // 移动是从尾向前的，所以 c2[nextIndex + 1] 所对应的真实 DOM 已经是被处理好的。

        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          // increasingNewIndexSequence[j] 当前不用移动的节点的最大下标
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--; // 指向下一个位置
          }
        }
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
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor); // 组件挂载（初始化）
    } else {
      updateComponent(n1, n2); // 组件更新
    }
  }

  // 挂载组件
  function mountComponent(initialVNode, container, parentComponent, anchor) {
    // vnode 与 component 建立双向关系
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    )); // 创建组件实例对象
    setupComponent(instance); // 初始化组件
    setupRenderEffect(instance, initialVNode, container, anchor); // 处理组件的依赖
  }

  function setupRenderEffect(instance, initialVNode, container, anchor) {
    instance.update = effect(() => {
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
        initialVNode.el = subTree.el;
        instance.isMounted = true;
      } else {
        const { proxy, vnode, next } = instance;
        if (next) {
          next.el = vnode.el;
          // 在执行 instance.render 前（更新 props 和 vnode）
          // 更新 props 用于 this.$props; 更新 vnode 用于 subTree;
          updateComponentPreRender(instance, next);
        }
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;
        instance.subTree = subTree;
        patch(prevSubTree, subTree, container, instance, anchor);
      }
    });
  }

  // 组件更新
  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component); // instance 是 n1 和 n2 共用的
    if (shouldUpdateComponent(n1, n2)) {
      // instance.vnode 指向 n1，instance.next 指向 n2
      instance.next = n2;
      instance.update(); // update 就是组件的 runner
    } else {
      // 不更新的处理逻辑，也要更新 instance.vnode 的指向
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }

  return {
    // 当前的 renderer.ts 改为提供一个组合函数，需要接收「自定义渲染器的实现细节」
    // runtime-dom/index.ts 提供自定义渲染器的细节
    // 在 runtime-dom/index.ts 组合出自定义渲染器（重要）
    // createAppAPI 的核心还是提供 mount 和 render
    createApp: createAppAPI(render),
  };
}

// 更新组件的 vnode 和 props，用于渲染（在执行 instance.render 前）
function updateComponentPreRender(instance, nextVNode) {
  instance.vnode = nextVNode;
  instance.next = null;

  instance.props = nextVNode.props;
}

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
// 最长递增子序列
function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
