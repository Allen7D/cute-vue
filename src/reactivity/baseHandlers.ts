import { isObject } from "../shared";
import { track, trigger } from "./effect";
import { ReactiveFlags, reactive, readonly } from "./reactive";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadOnly = false) {
  return function get(target, key) {
    // 取ReactiveFlags默认值时，来判断是否 reactive 或 readonly
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadOnly;
    }

    const res = Reflect.get(target, key);

    // 依赖收集
    if (!isReadOnly) {
      track(target, key);
    }

    if (isObject(res)) {
      return isReadOnly ? readonly(res) : reactive(res);
    }

    return res;
  };
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    // 依赖触发
    trigger(target, key);
    return res;
  };
}

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`key: ${key} set失败，因为 target 是 readonly`);
    return true;
  },
};
