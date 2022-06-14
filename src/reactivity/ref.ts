import { hadChanged, isObject } from "../shared";
import { createDep, Dep } from "./dep";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

export interface Ref<T = any> {
  value: T;
}

class RefImpl {
  private _value: any; // _value可能会是响应式对象，进行Object.is比较麻烦
  private _rawValue: any;
  public dep;
  public __v_isRef = true;

  constructor(value) {
    this._rawValue = value;
    this._value = convert(value);
    this.dep = new Set();
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    // _value
    if (!hadChanged(this._rawValue, newValue)) return;
    this._rawValue = newValue;
    this._value = convert(newValue);
    triggerEffects(this.dep);
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

type RefBase<T> = {
  dep?: Dep;
  value: T;
};

export function trackRefValue(ref: RefBase<any>) {
  if (isTracking()) {
    trackEffects(ref.dep || (ref.dep = createDep()));
  }
}

export function triggerRefValue(ref: RefBase<any>) {
  if (ref.dep) {
    triggerEffects(ref.dep);
  }
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(r: any): r is Ref {
  return !!r.__v_isRef;
}

export function unRef<T>(ref: T | Ref<T>): T {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(obj) {
  return new Proxy(obj, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}
