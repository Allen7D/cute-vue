import { ReactiveEffect } from "../reactivity/effect";
import { SchedulerJob, queuePreFlushCb, queuePostFlushCb } from "./scheduler";
import {
  EMPTY_OBJ,
  NOOP,
  isObject,
  isArray,
  isMap,
  isSet,
  isFunction,
  hasChanged,
  isPlainObject,
} from "../shared";
import { isReactive, isRef } from "../reactivity";

export type WatchEffect = () => void;

const INITIAL_WATCHER_VALUE = {};

export interface WatchOptionsBase {
  flush?: "pre" | "post" | "sync";
}

export interface WatchOptions<Immediate = boolean> extends WatchOptionsBase {
  immediate?: Immediate; // 立即监听
  deep?: boolean; // 深度监听
}

export type WatchStopHandle = () => void;

export function watch(source, cb, options?: WatchOptions): WatchStopHandle {
  return doWatch(source, cb, options);
}

export function watchEffect(
  effect: any,
  options?: WatchOptions
): WatchStopHandle {
  return doWatch(effect, null, options);
}

export function watchPostEffect(effect: WatchEffect): WatchStopHandle {
  return doWatch(effect, null, { flush: "post" });
}

export function watchSyncEffect(effect: WatchEffect) {
  return doWatch(effect, null, { flush: "sync" });
}

function doWatch(
  source,
  cb,
  { immediate, deep, flush }: WatchOptions = EMPTY_OBJ
) {
  let getter: () => any;
  if (isRef(source)) {
    // 处理 ref 类型
    getter = () => source.value;
  } else if (isReactive(source)) {
    // 处理 reactive 类型
    getter = () => source;
    deep = true; // 引用类型默认 deep
  } else if (isArray(source)) {
    // 处理数组
    getter = () =>
      source.map((s) => {
        if (isRef(s)) {
          return s.value;
        } else if (isReactive(s)) {
          return traverse(s); // 深度遍历
        } else if (isFunction(s)) {
          return s();
        }
      });
  } else if (isFunction(source)) {
    // 处理 函数类型
    getter = () => source();
  } else {
    getter = NOOP;
  }

  // reactive 类型默认 deep 为 true
  if (cb && deep) {
    const baseGetter = getter;
    getter = () => traverse(baseGetter()); // 进行深度递归监听
  }

  let oldValue = INITIAL_WATCHER_VALUE; // cb 中的旧值
  // 队列中的任务
  const job: SchedulerJob = () => {
    if (!effect.active) {
      return;
    }
    if (cb) {
      // 针对 watch(source, cb)
      const newValue = effect.run();
      // 新、旧 value 比较
      if (deep || hasChanged(newValue, oldValue)) {
        cb(newValue, oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue);
        oldValue = newValue;
      }
    } else {
      // 针对 watchEffect
      effect.run();
    }
  };

  let scheduler;
  if (flush === "sync") {
    // 同步执行（非异步执行，与任务队列的无关）
    // 比 render 中的 effect 的 scheduler 先执行
    scheduler = job as any;
  } else if (flush === "post") {
    // 在组件更新后（即 DOM 更新之后再执行），运行侦听器副作用
    // 后置执行
    scheduler = () => queuePostFlushCb(job);
  } else {
    // 在组件更新前(DOM还没改变)，重新运行侦听器副作用
    // 前置执行(默认为 'pre')
    scheduler = () => queuePreFlushCb(job);
  }

  const effect = new ReactiveEffect(getter, scheduler);

  // initial run（与 scheduler 中的 job 对比，加深理解）
  if (cb) {
    if (immediate) {
      // 运行 cb，且得到 newValue 和 oldValue 的值
      job();
    } else {
      // 不运行 cb，先缓存 oldValue 的值
      oldValue = effect.run();
    }
  } else {
    effect.run();
  }

  return () => {
    effect.stop();
  };
}

export function traverse(value: unknown, seen?: Set<unknown>) {
  if (!isObject(value)) {
    return value;
  }
  // 缓存
  seen = seen || new Set();
  if (seen.has(value)) {
    return value;
  }

  seen.add(value);
  if (isRef(value)) {
    // ref 类型，继续递归执行 .value 值
    traverse(value.value, seen);
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v: any) => {
      traverse(v, seen);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse((value as any)[key], seen);
    }
  }
  return value;
}
