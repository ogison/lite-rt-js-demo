const LITERT_LOG_PREFIXES = [
  'INFO:',
  'WARNING:',
  'ERROR: Following operations',
  'CUSTOM ',
  'Created TensorFlow Lite',
];

function isLiteRtInternalLog(args: unknown[]): boolean {
  const first = args[0];
  if (typeof first !== 'string') return false;
  if (LITERT_LOG_PREFIXES.some((prefix) => first.startsWith(prefix)))
    return true;
  // e.g. "63 operations will run on the GPU, and the remaining 1 operations will run on the CPU."
  return /^\d+ operations will run on the/.test(first);
}

/**
 * LiteRT.js's Wasm module writes its own internal C++ logs (INFO/WARNING/ERROR
 * level, and partial-GPU-delegation notices) straight to console.error/warn/
 * info. That makes normal, expected behavior (e.g. one unsupported op falling
 * back to CPU) look like a crash in the browser console and in Next.js's dev
 * error overlay. This downgrades those specific, recognizable lines to
 * console.debug for the duration of `fn`, without touching any other console
 * output (including real application errors).
 */
export async function withQuietRuntimeLogs<T>(
  fn: () => Promise<T>
): Promise<T> {
  const original = {
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  const wrap =
    (level: keyof typeof original) =>
    (...args: unknown[]) => {
      if (isLiteRtInternalLog(args)) {
        console.debug(...args);
        return;
      }
      original[level](...args);
    };

  console.error = wrap('error');
  console.warn = wrap('warn');
  console.info = wrap('info');

  try {
    return await fn();
  } finally {
    console.error = original.error;
    console.warn = original.warn;
    console.info = original.info;
  }
}
