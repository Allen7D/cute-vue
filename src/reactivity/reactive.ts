import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from "./baseHandlers";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

// 返回对象的响应式副本
export function reactive(obj) {
  return createReactiveObject(obj, mutableHandlers);
}

export function readonly(obj) {
  return createReactiveObject(obj, readonlyHandlers);
}

export function shallowReadonly(obj) {
  return createReactiveObject(obj, shallowReadonlyHandlers);
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

function createReactiveObject(target, baseHandlers) {
  return new Proxy(target, baseHandlers);
}
