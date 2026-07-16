import type { Tensor } from '@litertjs/core';
import { SEGMENTATION_MODEL_CONFIGS } from '@/lib/constants/segmentation-model-config';
import type {
  SegmentationMask,
  SegmentationModelVariant,
} from '@/types/segmentation';

const MULTICLASS_CHANNELS = 6;
/** Channel index of the background class within the multiclass-6 output. */
const MULTICLASS_BACKGROUND_CHANNEL = 0;

/**
 * Converts the model output Tensor(s) into a SegmentationMask, and deletes
 * the tensor(s) once their data has been read (LiteRT.js uses manual memory
 * management).
 *
 * `foreground-mask` models (selfie-landscape, u2net-full) output a single
 * foreground-probability channel directly — this holds regardless of
 * NHWC/NCHW layout, since a single channel flattens identically either way.
 * `multiclass-6` models output 6 per-class softmax probabilities
 * (background/hair/body-skin/face-skin/clothes/others) per pixel; since the
 * classes sum to 1, the foreground probability is `1 - background`.
 */
export async function tensorToSegmentationMask(
  outputs: readonly Tensor[],
  variant: SegmentationModelVariant
): Promise<SegmentationMask> {
  const [maskTensor] = outputs;
  const raw = await maskTensor.data();
  maskTensor.delete();

  const { inputWidth, inputHeight, outputKind } =
    SEGMENTATION_MODEL_CONFIGS[variant];

  if (outputKind === 'foreground-mask') {
    return {
      data: raw instanceof Float32Array ? raw : new Float32Array(raw),
      width: inputWidth,
      height: inputHeight,
    };
  }

  const pixelCount = inputWidth * inputHeight;
  const data = new Float32Array(pixelCount);
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    const background =
      raw[pixel * MULTICLASS_CHANNELS + MULTICLASS_BACKGROUND_CHANNEL];
    data[pixel] = 1 - background;
  }

  return { data, width: inputWidth, height: inputHeight };
}
