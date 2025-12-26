// Lightweight OTP store with TTL and periodic cleanup.
// Stored on globalThis to survive hot-reloads and to keep a single instance
// in long-running Node processes (pm2). Uses Map for predictable memory use.

type Entry = { otp: string; expiresAt: number };
const TTL = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
const GLOBAL_KEY = "__rojgari_otp_store__" as const;

if (!globalThis[GLOBAL_KEY]) {
  const map = new Map<string, Entry>();

  const cleanup = () => {
    const now = Date.now();
    for (const [k, v] of map) {
      if (v.expiresAt <= now) map.delete(k);
    }
  };

  const timer = setInterval(cleanup, CLEANUP_INTERVAL);
  // allow process to exit if this is the only thing left
  // (works in Node; unref may be undefined in some runtimes)
  // @ts-ignore
  if (timer?.unref) timer.unref();

  // expose map + timer
  // @ts-ignore
  globalThis[GLOBAL_KEY] = { map, timer };
}

// @ts-ignore
const store = globalThis[GLOBAL_KEY] as { map: Map<string, Entry>; timer: ReturnType<typeof setInterval> };

export function setOtp(email: string, otp: string) {
  store.map.set(email, { otp, expiresAt: Date.now() + TTL });
}

export function getOtp(email: string): string | null {
  const entry = store.map.get(email);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    store.map.delete(email);
    return null;
  }
  return entry.otp;
}

export function deleteOtp(email: string) {
  store.map.delete(email);
}

export function size() {
  return store.map.size;
}
