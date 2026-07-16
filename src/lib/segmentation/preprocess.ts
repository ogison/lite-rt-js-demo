import { Tensor } from '@litertjs/core';
import { SEGMENTATION_MODEL_CONFIGS } from '@/lib/constants/segmentation-model-config';
import type { SegmentationModelVariant } from '@/types/segmentation';

/**
 * Resizes an image/video frame to the given model variant's input size and
 * packs it into a float32 [1, H, W, 3] Tensor, normalized to [0, 1] (unlike
 * the object detection model, these models' inputs are float32, confirmed via
 * model.getInputDetails()).
 */
export function imageSourceToSegmentationInputTensor(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  variant: SegmentationModelVariant
): Tensor {
  const { inputWidth, inputHeight, inputChannels } =
    SEGMENTATION_MODEL_CONFIGS[variant];

  const canvas = document.createElement('canvas');
  canvas.width = inputWidth;
  canvas.height = inputHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to acquire a 2D canvas context for preprocessing.');
  }

  ctx.drawImage(
    source,
    0,
    0,
    sourceWidth,
    sourceHeight,
    0,
    0,
    inputWidth,
    inputHeight
  );
  const { data } = ctx.getImageData(0, 0, inputWidth, inputHeight);

  const pixelCount = inputWidth * inputHeight;
  const rgb = new Float32Array(pixelCount * inputChannels);
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    rgb[pixel * 3] = data[pixel * 4] / 255;
    rgb[pixel * 3 + 1] = data[pixel * 4 + 1] / 255;
    rgb[pixel * 3 + 2] = data[pixel * 4 + 2] / 255;
  }

  return new Tensor(rgb, [1, inputHeight, inputWidth, inputChannels]);
}
