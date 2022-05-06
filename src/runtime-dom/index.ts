import { createRenderer } from "../runtime-core";

// 创建元素
function createElement(type) {
  return document.createElement(type);
}
// 给元素添加属性
function patchProp(el, key, prevVal, nextVal) {
  // 判断以on开头的注册事件
  if (/^on[A-Z]/.test(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextVal);
  } else {
    // 旧属性不存在于新的节点，则移除
    // 否者，更新或者添加
    if (nextVal === undefined || nextVal === null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nextVal);
    }
  }
}
/**
 * 将子元素插入到父元素中
 * @param child 待插入的子元素
 * @param parent 容器
 * @param anchor 插入的锚点
 */
function insert(child, parent, anchor) {
  parent.insertBefore(child, anchor || null); // 添加到 anchor 下标之前
}

function createText(text) {
  return document.createTextNode(text);
}

/**
 *
 * @param el DOM元素
 * @param text 文本
 */
function setElementText(el, text) {
  el.textContent = text;
}

function remove(child) {
  const parent = child.parentNode; // .parentNode 是 DOM 自身的属性
  if (parent) {
    parent.removeChild(child);
  }
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  createText,
  setElementText,
  remove,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from "../runtime-core";
