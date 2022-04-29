import { isObject } from "../shared";
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

export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}

function createReactiveObject(target, baseHandlers) {
  if (!isObject(target)) {
    console.warn(`target ${target} 必须是一个对象`);
    return target;
  }
  return new Proxy(target, baseHandlers);
}
