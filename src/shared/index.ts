export const EMPTY_OBJ = {};

export const extend = Object.assign;

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
