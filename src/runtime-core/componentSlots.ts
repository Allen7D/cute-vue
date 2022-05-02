/**
 * slots 作为 children，会被转换为对象，且默认有 default 属性
 * 每个 value 都是一个函数，且返回值是h函数 或者 h函数的数组
 * 如果返回值不是数组，则会在 normalizeSlotsValue 中转为数组
 */
import { ShapeFlags } from "../shared/ShapeFlags";

export function initSlots(instance, children) {
  const { vnode } = instance;
  // 区分处理对象
  // slots作为children，其结构为对象
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots);
  }
}

function normalizeObjectSlots(children, slots) {
  for (const key in children) {
    const value = children[key];
    slots[key] = (props) => normalizeSlotsValue(value(props));
  }
}

function normalizeSlotsValue(value) {
  return Array.isArray(value) ? value : [value];
}
