import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

// 返回对象的响应式副本
export function reactive(obj) {
  return createReactiveObject(obj, mutableHandlers);
}

export function readonly(obj) {
  return createReactiveObject(obj, readonlyHandlers);
}

function createReactiveObject(target, baseHandlers) {
  return new Proxy(target, baseHandlers);
}
