import { currentInstance, LifecycleHooks } from "./component";

function injectHook(
  type: LifecycleHooks,
  hook: Function,
  target: any = currentInstance
) {
  if (target) {
    // 组件实例对象添加上生命周期的 hooks 函数数组
    const hooks = target[type] || (target[type] = []);
    hooks.push(hook);
  }
}
// 函数式编程
const createHook = (lifecycle: LifecycleHooks) => {
  return (hook, target = currentInstance) => {
    injectHook(lifecycle, hook, target);
  };
};

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT);
export const onMounted = createHook(LifecycleHooks.MOUNTED);
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE);
export const onUpdated = createHook(LifecycleHooks.UPDATED);
