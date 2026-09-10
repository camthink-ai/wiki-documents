// CamthinkTracker event tracking with pre-init queue.
// SDK 脚本异步加载，init 之前调用 track() 会抛 "init must be called first"。
// init 之前触发的事件（如首屏 page_not_found）先入队，
// 由 Root.js 的 injectTracker() 在脚本 onload → init() 之后调 flushQueue 清空。
let queue = [];
let initialized = false; // SDK 是否已 init（init 之后才允许直发）

export function flushQueue() {
  if (typeof window === 'undefined' || !window.CamthinkTracker) return;
  initialized = true; // 切换到直发模式
  const pending = queue;
  queue = [];
  pending.forEach(({ eventName, props }) => {
    try {
      window.CamthinkTracker.track(eventName, props);
    } catch (e) {
      // 非法事件名（违反 snake_case）/ SDK 异常 —— 静默丢弃，绝不炸页面
    }
  });
}

export function track(eventName, props) {
  if (typeof window === 'undefined') return;
  if (initialized && window.CamthinkTracker) {
    try {
      window.CamthinkTracker.track(eventName, props);
    } catch (e) {
      // 同上：静默丢弃，保页面渲染
    }
  } else {
    queue.push({ eventName, props });
  }
}
