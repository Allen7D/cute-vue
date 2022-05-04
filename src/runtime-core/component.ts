import { proxyRefs, shallowReadonly } from "../reactivity";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

// 创建组件实例
export function createComponentInstance(vnode, parent) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    provides: parent ? parent.provides : {}, // 此处的逻辑，可以一直往上取(parent.parent.provides)
    parent,
    isMounted: false,
    subTree: {},
    emit: () => {},
  };
  component.emit = emit.bind(null, component) as any;

  return component;
}

// 初始化组件
export function setupComponent(instance) {
  initProps(instance, instance.vnode.props); // props 挂载到组件实例对象上(并对一列处理)
  initSlots(instance, instance.vnode.children); // 插槽挂载到组件实例对象上

  setupStatefulComponent(instance);
}

// 初始化一个有状态的组件（不同与函数组件）
function setupStatefulComponent(instance) {
  const Component = instance.type; // type 就是入口的App对象（有 render、setup 属性）

  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);

  const { setup } = Component;

  if (setup) {
    setCurrentInstance(instance);
    // setup可以返回 function 或者 Object
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    }); // 执行Vue实例中的setup
    setCurrentInstance(null);
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult) {
  // setupResult为function，则为 render函数
  // setupResult为Object, 则 setupState 会注入到当前组件的上下文中
  if (typeof setupResult === "object") {
    instance.setupState = proxyRefs(setupResult);
  }
  // TODO 为 function 的场景

  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  const Component = instance.type;

  // 保证组件 render 肯定有值
  instance.render = Component.render;
}

// 当前组件的实例（仅在setup中使用）
let currentInstance = null;

export function getCurrentInstance() {
  return currentInstance;
}

export function setCurrentInstance(instance) {
  currentInstance = instance;
}
