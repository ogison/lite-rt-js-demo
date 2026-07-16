import { Tensor } from '@litertjs/core';
import {
  OBJECT_DETECTION_INPUT_CHANNELS as MODEL_INPUT_CHANNELS,
  OBJECT_DETECTION_INPUT_HEIGHT as MODEL_INPUT_HEIGHT,
  OBJECT_DETECTION_INPUT_WIDTH as MODEL_INPUT_WIDTH,
} from '@/lib/constants/model-config';

/**
 * Resizes an image/video frame to the model's input size and packs it into a
 * uint8 [1, H, W, 3] Tensor. The model (SSD MobileNet V1 quantized) expects
 * raw 0-255 RGB bytes with no normalization, so the alpha channel from
 * getImageData is simply dropped.
 */
export function imageSourceToInputTensor(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number
): Tensor {
  const canvas = document.createElement('canvas');
  canvas.width = MODEL_INPUT_WIDTH;
  canvas.height = MODEL_INPUT_HEIGHT;

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
    MODEL_INPUT_WIDTH,
    MODEL_INPUT_HEIGHT
  );
  const { data } = ctx.getImageData(
    0,
    0,
    MODEL_INPUT_WIDTH,
    MODEL_INPUT_HEIGHT
  );

  const pixelCount = MODEL_INPUT_WIDTH * MODEL_INPUT_HEIGHT;
  const rgb = new Uint8Array(pixelCount * MODEL_INPUT_CHANNELS);
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    rgb[pixel * 3] = data[pixel * 4];
    rgb[pixel * 3 + 1] = data[pixel * 4 + 1];
    rgb[pixel * 3 + 2] = data[pixel * 4 + 2];
  }

  return new Tensor(rgb, [
    1,
    MODEL_INPUT_HEIGHT,
    MODEL_INPUT_WIDTH,
    MODEL_INPUT_CHANNELS,
  ]);
}
