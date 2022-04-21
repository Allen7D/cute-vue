class ReactiveEffect {
  private _fn: any;

  constructor(fn) {
    this._fn = fn;
  }

  run() {
    activeEffect = this;
    this._fn();
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
    effect.run();
  }
}

let activeEffect; // 用于全局的闭包
export function effect(fn) {
  const _effect = new ReactiveEffect(fn);
  // 1、将activeEffect提升为全局变量
  // 2、执行effct内的fn
  // 3、触发effct内部'对象的响应式副本'的依赖收集
  _effect.run();
}
