import { isFunction, NOOP } from "../shared";
import { Ref, trackRefValue, triggerRefValue } from "./ref";
import { ReactiveEffect } from "./effect";
import { ReactiveFlags } from "./reactive";
import { Dep } from "./dep";

export interface ComputedRef<T = any> extends WritableComputedRef<T> {
  readonly value: T; // 将 value 改为只读
}
export interface WritableComputedRef<T> extends Ref<T> {
  readonly effect: ReactiveEffect<T>;
}

export type ComputedGetter<T> = (...args: any[]) => T;
export type ComputedSetter<T> = (v: T) => void;

export interface WritableComputedOptions<T> {
  get: ComputedGetter<T>;
  set: ComputedSetter<T>;
}

class ComputedRefImpl<T> {
  public dep?: Dep = undefined; // 结合 effect 使用

  private _value: any;
  public readonly effect: ReactiveEffect<T>;

  public readonly __v_isRef = true; // computed 是 ref 类型
  public readonly [ReactiveFlags.IS_READONLY]: boolean;

  private _dirty: boolean = true;

  constructor(
    getter: ComputedGetter<T>,
    private readonly _setter: ComputedSetter<T>,
    isReadonly: boolean
  ) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        triggerRefValue(this); // 收集 ref 的依赖
      }
    });
    this[ReactiveFlags.IS_READONLY] = isReadonly; // 是否只读(跟 setter 有关)
  }

  get value() {
    trackRefValue(this);
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }

    return this._value;
  }
  // 修改 computed 的 value时，执行 this._setter
  set value(newValue: T) {
    this._setter(newValue);
  }
}

export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>;
export function computed<T>(
  options: WritableComputedOptions<T>
): WritableComputedRef<T>;
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>
) {
  let getter: ComputedGetter<T>;
  let setter: ComputedSetter<T>;

  const onlyGetter = isFunction(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = NOOP;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter);

  return cRef as any;
}
