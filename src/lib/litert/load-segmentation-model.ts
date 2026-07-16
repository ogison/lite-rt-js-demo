import { loadAndCompile, type CompiledModel } from '@litertjs/core';
import { SEGMENTATION_MODEL_CONFIGS } from '@/lib/constants/segmentation-model-config';
import { getLiteRtRuntime } from '@/lib/litert/init-litert';
import { withQuietRuntimeLogs } from '@/lib/litert/quiet-runtime-logs';
import type {
  SegmentationAccelerator,
  SegmentationModelVariant,
} from '@/types/segmentation';

export interface LoadedSegmentationModel {
  model: CompiledModel;
  accelerator: SegmentationAccelerator;
  variant: SegmentationModelVariant;
}

/** True when the current browser exposes the WebGPU API. */
export function supportsWebGpu(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

function cacheKey(
  accelerator: SegmentationAccelerator,
  variant: SegmentationModelVariant
): string {
  return `${variant}:${accelerator}`;
}

const modelPromises = new Map<string, Promise<LoadedSegmentationModel>>();

/**
 * Compiles the segmentation model for the requested accelerator/variant pair
 * and caches the promise per combination, so switching between WebGPU and CPU
 * (wasm), or between model variants, keeps every already-compiled model around
 * for side-by-side comparison. A failed compile is evicted from the cache so
 * it can be retried.
 */
export function getSegmentationModel(
  accelerator: SegmentationAccelerator,
  variant: SegmentationModelVariant
): Promise<LoadedSegmentationModel> {
  const key = cacheKey(accelerator, variant);
  const cached = modelPromises.get(key);
  if (cached) return cached;

  const promise = getLiteRtRuntime()
    .then(async () => {
      const model = await withQuietRuntimeLogs(() =>
        loadAndCompile(SEGMENTATION_MODEL_CONFIGS[variant].url, {
          accelerator,
        })
      );
      return { model, accelerator, variant };
    })
    .catch((error: unknown) => {
      modelPromises.delete(key);
      throw error;
    });

  modelPromises.set(key, promise);
  return promise;
}
