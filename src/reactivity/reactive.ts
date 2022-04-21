import { track, trigger } from "./effect";

// 返回对象的响应式副本
export function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      const res = Reflect.get(target, key);
      // 依赖收集
      track(target, key);
      return res;
    },

    set(target, key, value) {
      const res = Reflect.set(target, key, value);
      // 依赖触发
      trigger(target, key);
      return res;
    },
  });
}
