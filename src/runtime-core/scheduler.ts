import { isArray } from "../shared";

export interface SchedulerJob extends Function {}
export type SchedulerJobs = SchedulerJob | SchedulerJob[];

const resolvedPromise = Promise.resolve() as Promise<any>;
let currentFlushPromise: Promise<void> | null = null;

let isFlushing = false; // 是否正在执行
let isFlushPending = false; // 是否正在等待执行

const queue: SchedulerJob[] = []; // 主任务队列
let flushIndex = 0;

// 组件更新前（前置）
const pendingPreFlushCbs: SchedulerJob[] = []; // 前置任务队列
let activePreFlushCbs: SchedulerJob[] | null = null; // 当前激活的前置任务队列
let preFlushIndex = 0;

// 组件更新后（后置）
const pendingPostFlushCbs: SchedulerJob[] = []; // 后置任务队列
let activePostFlushCbs: SchedulerJob[] | null = null; // 当前激活的后置任务队列
let postFlushIndex = 0;

export function nextTick(fn) {
  const p = currentFlushPromise || resolvedPromise;
  return fn ? p.then(fn) : p;
}

export function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  queueFlush();
}

// 队列执行（使用 Promise 解决性能问题和实时性问题）
function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true;
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}

// 前置任务的回调进入队列
export function queuePreFlushCb(cb: SchedulerJobs) {
  queueCb(cb, pendingPreFlushCbs);
}

// 后置任务的回调进入队列
export function queuePostFlushCb(cb: SchedulerJobs) {
  queueCb(cb, pendingPostFlushCbs);
}

/**
 * 收集回调进入队列（前置任务、主任务、后置任务的入口），并依次执行
 * queueCb --> flushJobs --> 执行如下3个队列:
 *    - flushPreFlushCbs  （组件更新前，队列执行）
 *    - queue              (组件更新时，队列执行)
 *    - flushpostFlushCbs （组件更新后，队列执行）
 * @param cb 回调任务
 * @param pendingQueue 待执行的队列
 */
function queueCb(cb, pendingQueue) {
  if (!isArray(cb)) {
    pendingQueue.push(cb);
  } else {
    pendingQueue.push(...cb);
  }
  queueFlush();
}

// 执行'前置任务'
export function flushPreFlushCbs() {
  if (pendingPreFlushCbs.length) {
    activePreFlushCbs = [...new Set(pendingPreFlushCbs)]; // 去重
    pendingPreFlushCbs.length = 0; // 清空
    // 进入执行
    for (
      preFlushIndex = 0;
      preFlushIndex < activePreFlushCbs.length;
      preFlushIndex++
    ) {
      activePreFlushCbs[preFlushIndex]();
    }
    // 执行完成
    activePreFlushCbs = null;
    preFlushIndex = 0;
  }
}

// 执行'后置任务'
export function flushPostFlushCbs() {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)]; // 去重
    pendingPostFlushCbs.length = 0; // 清空

    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }
    // 进入执行
    activePostFlushCbs = deduped;
    for (
      postFlushIndex = 0;
      postFlushIndex < activePostFlushCbs.length;
      postFlushIndex++
    ) {
      activePostFlushCbs[postFlushIndex]();
    }

    // 执行完成
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}

// 执行队列中的任务
function flushJobs() {
  isFlushPending = false;
  isFlushing = true;
  // 组件更新前执行（前置）
  flushPreFlushCbs();

  try {
    // 组件更新时执行
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      job && job();
    }
  } finally {
    flushIndex = 0;
    queue.length = 0;
    // 组件更新后执行（后置）
    flushPostFlushCbs();

    isFlushing = false;
    currentFlushPromise = null;

    if (
      queue.length ||
      pendingPreFlushCbs.length ||
      pendingPostFlushCbs.length
    ) {
    }
  }
}
