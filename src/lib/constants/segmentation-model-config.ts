import type { SegmentationModelVariant } from '@/types/segmentation';

export interface SegmentationModelConfig {
  readonly url: string;
  /** Confirmed via model.getInputDetails() for each model file. */
  readonly inputWidth: number;
  readonly inputHeight: number;
  readonly inputChannels: number;
  /**
   * `foreground-mask`: single-channel foreground probability output.
   * `multiclass-6`: 6-channel per-class softmax output (background/hair/
   * body-skin/face-skin/clothes/others), collapsed into a foreground mask by
   * treating background as `1 - foreground`.
   */
  readonly outputKind: 'foreground-mask' | 'multiclass-6';
}

// input_1, float32, [1, 144, 256, 3]
const SELFIE_LANDSCAPE_CONFIG: SegmentationModelConfig = {
  url: '/models/segmentation.tflite',
  inputWidth: 256,
  inputHeight: 144,
  inputChannels: 3,
  outputKind: 'foreground-mask',
};

// selfie_multiclass_256x256: square float32 input, [1, 256, 256, 6] output.
// Verify the actual name/shape/dtype via model.getInputDetails() /
// model.getOutputDetails() once the file is placed in public/models.
const SELFIE_MULTICLASS_CONFIG: SegmentationModelConfig = {
  url: '/models/segmentation-multiclass.tflite',
  inputWidth: 256,
  inputHeight: 256,
  inputChannels: 3,
  outputKind: 'multiclass-6',
};

export const SEGMENTATION_MODEL_CONFIGS: Record<
  SegmentationModelVariant,
  SegmentationModelConfig
> = {
  'selfie-landscape': SELFIE_LANDSCAPE_CONFIG,
  'selfie-multiclass': SELFIE_MULTICLASS_CONFIG,
};

export const DEFAULT_SEGMENTATION_MODEL_VARIANT: SegmentationModelVariant =
  'selfie-landscape';

/** Minimum interval between two inference calls while streaming from the camera. */
export const SEGMENTATION_INTERVAL_MS = 150;
