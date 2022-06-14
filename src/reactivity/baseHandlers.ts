import { extend, isObject } from "../shared";
import { track, trigger } from "./effect";
import { ReactiveFlags, reactive, readonly } from "./reactive";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

/**
 *
 * @param isReadOnly 是否只读
 * @param shallow 是否浅层响应式转换
 * @returns
 */
function createGetter(isReadOnly = false, shallow = false) {
  return function get(target, key) {
    // 取 ReactiveFlags 默认值时，来判断是否 reactive 或 readonly
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadOnly;
    }

    const res = Reflect.get(target, key);

    if (shallow) {
      return res;
    }

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

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});
