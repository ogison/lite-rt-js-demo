import { loadLiteRt } from '@litertjs/core';
import { WASM_BASE_PATH } from '@/lib/constants/model-config';
import { withQuietRuntimeLogs } from '@/lib/litert/quiet-runtime-logs';

let liteRtPromise: ReturnType<typeof loadLiteRt> | null = null;

/**
 * Initializes the LiteRT.js Wasm runtime exactly once and caches the promise
 * at module scope, so repeated calls (e.g. from React Strict Mode's double
 * effect invocation) never re-initialize it.
 */
export function getLiteRtRuntime(): ReturnType<typeof loadLiteRt> {
  if (!liteRtPromise) {
    // jspi is required for models (like this one) that are only partially
    // delegated to the GPU: the runtime needs to yield asynchronously between
    // GPU and CPU (wasm) op execution mid-graph.
    liteRtPromise = withQuietRuntimeLogs(() =>
      loadLiteRt(WASM_BASE_PATH, { jspi: true })
    );
  }
  return liteRtPromise;
}
