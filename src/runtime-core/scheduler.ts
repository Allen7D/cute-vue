const resolvedPromise = Promise.resolve() as Promise<any>;

let isFlushPending = false;

const queue: any[] = [];

export function nextTick(fn) {
  const p = resolvedPromise;
  return fn ? p.then(fn) : p;
}

export function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  queueFlush();
}

function queueFlush() {
  if (!isFlushPending) {
    isFlushPending = true;
    resolvedPromise.then(flushJobs);
  }
}

function flushJobs() {
  isFlushPending = false;
  let job;
  while ((job = queue.shift())) {
    job && job();
  }
}
