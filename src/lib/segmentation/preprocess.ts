import { Tensor } from '@litertjs/core';
import {
  SEGMENTATION_INPUT_CHANNELS,
  SEGMENTATION_INPUT_HEIGHT,
  SEGMENTATION_INPUT_WIDTH,
} from '@/lib/constants/segmentation-model-config';

/**
 * Resizes an image/video frame to the segmentation model's input size and
 * packs it into a float32 [1, H, W, 3] Tensor, normalized to [0, 1] (unlike
 * the object detection model, this model's input is float32, confirmed via
 * model.getInputDetails()).
 */
export function imageSourceToSegmentationInputTensor(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number
): Tensor {
  const canvas = document.createElement('canvas');
  canvas.width = SEGMENTATION_INPUT_WIDTH;
  canvas.height = SEGMENTATION_INPUT_HEIGHT;

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
    SEGMENTATION_INPUT_WIDTH,
    SEGMENTATION_INPUT_HEIGHT
  );
  const { data } = ctx.getImageData(
    0,
    0,
    SEGMENTATION_INPUT_WIDTH,
    SEGMENTATION_INPUT_HEIGHT
  );

  const pixelCount = SEGMENTATION_INPUT_WIDTH * SEGMENTATION_INPUT_HEIGHT;
  const rgb = new Float32Array(pixelCount * SEGMENTATION_INPUT_CHANNELS);
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    rgb[pixel * 3] = data[pixel * 4] / 255;
    rgb[pixel * 3 + 1] = data[pixel * 4 + 1] / 255;
    rgb[pixel * 3 + 2] = data[pixel * 4 + 2] / 255;
  }

  return new Tensor(rgb, [
    1,
    SEGMENTATION_INPUT_HEIGHT,
    SEGMENTATION_INPUT_WIDTH,
    SEGMENTATION_INPUT_CHANNELS,
  ]);
}
