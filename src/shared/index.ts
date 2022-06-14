export const EMPTY_OBJ = {};

export const NOOP = () => {};
export const extend = Object.assign;

export const isArray = Array.isArray;
export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === "[object Map]";
export const isSet = (val: unknown): val is Set<any> =>
  toTypeString(val) === "[object Set]";

export const isFunction = (val: unknown): val is Function => {
  return typeof val === "function";
};
export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

export const hadChanged = (val, newVal) => {
  return !Object.is(val, newVal);
};

export const hasOwn = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

// 首字符大写
export const capitalize = (str: string): string => {
  return str.replace(/^[a-z]{1}/, (s) => s.toUpperCase());
};

// 转为驼峰
// abc-def => abcDef
export const camelize = (str: string): string => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};

// 将 emit 里的 event（事件名）转为带 on 前缀的时间名
export const toHandlerKey = (str: string) => {
  return str ? "on" + capitalize(str) : "";
};

export const objectToString = Object.prototype.toString;
export const toTypeString = (value: unknown): string =>
  objectToString.call(value);

// 是否是一个纯粹的对象
export const isPlainObject = (val: unknown): val is object =>
  toTypeString(val) === "[object Object]";

// 依次调用函数数组
export const invokeArrayFns = (fns: Function[], arg?: any) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg);
  }
};

export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue);
