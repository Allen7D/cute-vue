import { createRenderer } from "../runtime-core";

// 创建元素
function createElement(type) {
  return document.createElement(type);
}
// 给元素添加属性
function patchProp(el, key, val) {
  // 判断以on开头的注册事件
  if (/^on[A-Z]/.test(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, val);
  } else {
    el.setAttribute(key, val);
  }
}
// 将子元素插入到父元素中
function insert(el, parent) {
  parent.append(el);
}

function createText(text) {
  return document.createTextNode(text);
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  createText,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from "../runtime-core";
