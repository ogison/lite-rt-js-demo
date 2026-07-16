import type { Tensor } from '@litertjs/core';
import {
  SEGMENTATION_INPUT_HEIGHT,
  SEGMENTATION_INPUT_WIDTH,
} from '@/lib/constants/segmentation-model-config';
import type { SegmentationMask } from '@/types/segmentation';

/**
 * Converts the single mask output Tensor into a SegmentationMask, and
 * deletes the tensor once its data has been read (LiteRT.js uses manual
 * memory management).
 */
export async function tensorToSegmentationMask(
  outputs: readonly Tensor[]
): Promise<SegmentationMask> {
  const [maskTensor] = outputs;
  const raw = await maskTensor.data();
  maskTensor.delete();

  return {
    data: raw instanceof Float32Array ? raw : new Float32Array(raw),
    width: SEGMENTATION_INPUT_WIDTH,
    height: SEGMENTATION_INPUT_HEIGHT,
  };
}
