import { extend } from "../shared";

let activeEffect;
let shouldTrack; // 是否可以收集依赖

class ReactiveEffect {
  private _fn: any;
  public deps = [];
  private active = true; // 该effect是否可用
  public onStop?: () => void;

  constructor(fn, public scheduler?) {
    this._fn = fn;
  }

  run() {
    if (!this.active) {
      return this._fn();
    }

    // 核心：依赖收集的时机（非effect内的表达式执行时，不再触发依赖收集）
    // 通过shouldTrack 来做收集依赖的区分
    shouldTrack = true; // shouldTrack必须保持即使开与关（effct内部fn执行完毕，就关闭），避免track任意收集依赖
    activeEffect = this; // 在真正的fn执行之前，让依赖收集确定为当前activeEffect
    const result = this._fn();
    shouldTrack = false;
    return result;
  }

  // 该方法的核心：梳理清楚dep与effct之间的关系
  // 每个响应式对象属性key的依赖dep（Set）收集相关 effect，用于触发
  // 每个effct都有deps属性，存着所有包含该effct的dep

  // stop的作用：从effct的deps（所有包含该 effct 的响应式对象的依赖），每个依赖中都含有该effct，执行delete操作来移除dep中对应的依赖
  stop() {
    if (this.active) {
      this.cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }

  cleanupEffect(effect) {
    effect.deps.forEach((dep: any) => {
      dep.delete(effect);
    });
    effect.deps.length = 0; // 从依赖中移除相应的effect时，也要把effect反向的deps清空
  }
}

const targetMap = new Map();
// 依赖收集
export function track(target, key) {
  if (!isTracking()) return;

  // target -> key -> dep
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  if (dep.has(activeEffect)) return; // 避免尝试执行重复依赖的收集

  trackEffects(dep);
}

export function trackEffects(dep) {
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

export function isTracking() {
  // activeEffect可能为空，例如：在没有effct，先执行if判断 x.y === 1
  return shouldTrack && activeEffect !== undefined;
}

// 依赖触发
export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);

  triggerEffects(dep);
}

export function triggerEffects(dep) {
  for (let effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run(); // 区别跟effect中的_effect.run()触发的时机
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  // 1、将activeEffect提升为全局变量
  // 2、执行effct内的fn
  // 3、触发effct内部'对象的响应式副本'的依赖收集
  _effect.run();
  extend(_effect, options);

  const runner: any = _effect.run.bind(_effect); // 以当前effect的实例作为this的指向
  runner.effect = _effect; // 建立runner与effect之间的关系（例如: 可以在stop中被使用）

  return runner;
}

export function stop(runner) {
  // 1. runner必须可以找到对应的effect
  // 2. 需要基于effect找到deps, 从deps中移除effect
  runner.effect.stop();
}
