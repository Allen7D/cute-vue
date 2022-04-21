import { extend } from "../shared";

class ReactiveEffect {
  private _fn: any;
  public deps = [];
  private active = true; // 该effect是否可用
  public onStop?: () => void;

  constructor(fn, public scheduler?) {
    this._fn = fn;
  }

  run() {
    activeEffect = this;
    return this._fn();
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
  }
}

const targetMap = new Map();
// 依赖收集
export function track(target, key) {
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

  // activeEffect可能为空，例如：在没有effct，先执行if判断 x.y === 1
  if (!activeEffect) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);

  activeEffect;
}

// 依赖触发
export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);

  for (let effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run(); // 区别跟effect中的_effect.run()触发的时机
    }
  }
}

let activeEffect; // 用于全局的闭包
export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  // 1、将activeEffect提升为全局变量
  // 2、执行effct内的fn
  // 3、触发effct内部'对象的响应式副本'的依赖收集
  _effect.run();
  extend(_effect, options);

  const runner: any = _effect.run.bind(_effect); // 以当前effect的实例作为this的指向
  runner.effect = _effect; // 建立runner与effect之间的关系

  return runner;
}

export function stop(runner) {
  // 1. runner必须可以找到对应的effect
  // 2. 需要基于effect找到deps, 从deps中移除effect
  runner.effect.stop();
}
