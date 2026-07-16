import {
  loadAndCompile,
  type Accelerator,
  type CompiledModel,
} from '@litertjs/core';
import { OBJECT_DETECTION_MODEL_URL } from '@/lib/constants/model-config';
import { getLiteRtRuntime } from '@/lib/litert/init-litert';
import { withQuietRuntimeLogs } from '@/lib/litert/quiet-runtime-logs';

export interface LoadedObjectDetectionModel {
  model: CompiledModel;
  accelerator: Accelerator;
}

let modelPromise: Promise<LoadedObjectDetectionModel> | null = null;

async function compileWithFallback(): Promise<LoadedObjectDetectionModel> {
  const supportsWebGpu = typeof navigator !== 'undefined' && 'gpu' in navigator;

  if (supportsWebGpu) {
    try {
      const model = await withQuietRuntimeLogs(() =>
        loadAndCompile(OBJECT_DETECTION_MODEL_URL, { accelerator: 'webgpu' })
      );
      return { model, accelerator: 'webgpu' };
    } catch (error) {
      console.warn(
        '[litert] Failed to compile with the webgpu accelerator, falling back to wasm.',
        error
      );
    }
  }

  const model = await withQuietRuntimeLogs(() =>
    loadAndCompile(OBJECT_DETECTION_MODEL_URL, { accelerator: 'wasm' })
  );
  return { model, accelerator: 'wasm' };
}

/**
 * Compiles the object detection model exactly once and caches the promise at
 * module scope, mirroring `getLiteRtRuntime`.
 */
export function getObjectDetectionModel(): Promise<LoadedObjectDetectionModel> {
  if (!modelPromise) {
    modelPromise = getLiteRtRuntime().then(() => compileWithFallback());
  }
  return modelPromise;
}
