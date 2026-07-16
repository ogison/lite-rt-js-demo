import { Tensor } from '@litertjs/core';
import {
  IMAGENET_NORMALIZE_MEAN,
  IMAGENET_NORMALIZE_STD,
  SEGMENTATION_MODEL_CONFIGS,
} from '@/lib/constants/segmentation-model-config';
import type { SegmentationModelVariant } from '@/types/segmentation';

/**
 * Resizes an image/video frame to the given model variant's input size and
 * packs it into a float32 Tensor using that variant's tensor layout and
 * normalization (confirmed via model.getInputDetails() per model file).
 */
export function imageSourceToSegmentationInputTensor(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  variant: SegmentationModelVariant
): Tensor {
  const {
    inputWidth,
    inputHeight,
    inputChannels,
    tensorLayout,
    normalization,
  } = SEGMENTATION_MODEL_CONFIGS[variant];

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

  if (normalization === 'imagenet-per-image-max') {
    // Matches U^2-Net's reference preprocessing: divide by the image's own
    // max pixel value (not a fixed 255), then apply ImageNet mean/std.
    let maxValue = 0;
    for (let pixel = 0; pixel < pixelCount; pixel++) {
      maxValue = Math.max(
        maxValue,
        data[pixel * 4],
        data[pixel * 4 + 1],
        data[pixel * 4 + 2]
      );
    }
    if (maxValue === 0) maxValue = 1;

    const tensorData = new Float32Array(pixelCount * inputChannels);
    for (let pixel = 0; pixel < pixelCount; pixel++) {
      for (let channel = 0; channel < inputChannels; channel++) {
        const normalized = data[pixel * 4 + channel] / maxValue;
        const value =
          (normalized - IMAGENET_NORMALIZE_MEAN[channel]) /
          IMAGENET_NORMALIZE_STD[channel];
        tensorData[
          tensorLayout === 'nchw'
            ? channel * pixelCount + pixel
            : pixel * inputChannels + channel
        ] = value;
      }
    }

    const shape =
      tensorLayout === 'nchw'
        ? [1, inputChannels, inputHeight, inputWidth]
        : [1, inputHeight, inputWidth, inputChannels];
    return new Tensor(tensorData, shape);
  }

  // zero-one: raw 0-255 pixel value divided by 255, channels-last.
  const tensorData = new Float32Array(pixelCount * inputChannels);
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    tensorData[pixel * 3] = data[pixel * 4] / 255;
    tensorData[pixel * 3 + 1] = data[pixel * 4 + 1] / 255;
    tensorData[pixel * 3 + 2] = data[pixel * 4 + 2] / 255;
  }

  return new Tensor(tensorData, [1, inputHeight, inputWidth, inputChannels]);
}
