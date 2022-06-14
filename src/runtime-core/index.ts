export { h } from "./h";
export { renderSlots } from "./helpers/renderSlots";
export { createTextVNode } from "./vnode";
export { getCurrentInstance } from "./component";
export {
  watch,
  watchEffect,
  watchSyncEffect,
  watchPostEffect,
} from "./apiWatch";
export {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
} from "./apiLifecycle";
export { provide, inject } from "./apiInject";
export { createRenderer } from "./renderer";
export { nextTick } from "./scheduler";
