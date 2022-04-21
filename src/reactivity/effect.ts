class ReactiveEffect {
  private _fn: any;

  constructor(fn, public scheduler?) {
    this._fn = fn;
  }

  run() {
    activeEffect = this;
    return this._fn();
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

  dep.add(activeEffect);
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

  return _effect.run.bind(_effect); // 以当前effect的实例作为this的指向
}
