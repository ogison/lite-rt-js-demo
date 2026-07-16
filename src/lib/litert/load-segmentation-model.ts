import {
  loadAndCompile,
  type Accelerator,
  type CompiledModel,
} from '@litertjs/core';
import { SEGMENTATION_MODEL_URL } from '@/lib/constants/segmentation-model-config';
import { getLiteRtRuntime } from '@/lib/litert/init-litert';
import { withQuietRuntimeLogs } from '@/lib/litert/quiet-runtime-logs';

export interface LoadedSegmentationModel {
  model: CompiledModel;
  accelerator: Accelerator;
}

let modelPromise: Promise<LoadedSegmentationModel> | null = null;

async function compileWithFallback(): Promise<LoadedSegmentationModel> {
  const supportsWebGpu = typeof navigator !== 'undefined' && 'gpu' in navigator;

  if (supportsWebGpu) {
    try {
      const model = await withQuietRuntimeLogs(() =>
        loadAndCompile(SEGMENTATION_MODEL_URL, { accelerator: 'webgpu' })
      );
      return { model, accelerator: 'webgpu' };
    } catch (error) {
      console.warn(
        '[litert] Failed to compile the segmentation model with the webgpu accelerator, falling back to wasm.',
        error
      );
    }
  }

  const model = await withQuietRuntimeLogs(() =>
    loadAndCompile(SEGMENTATION_MODEL_URL, { accelerator: 'wasm' })
  );
  return { model, accelerator: 'wasm' };
}

/**
 * Compiles the segmentation model exactly once and caches the promise at
 * module scope, mirroring `getObjectDetectionModel`.
 */
export function getSegmentationModel(): Promise<LoadedSegmentationModel> {
  if (!modelPromise) {
    modelPromise = getLiteRtRuntime().then(() => compileWithFallback());
  }
  return modelPromise;
}
