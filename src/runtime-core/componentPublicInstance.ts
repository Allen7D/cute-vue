import { hasOwn } from "../shared";
import { nextTick } from "./scheduler";

// i 是 instance
const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots,
  $props: (i) => i.props,
  $nextTick: (i) => nextTick.bind(i.proxy),
};

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    // setupState
    const { setupState, props } = instance;
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }

    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
