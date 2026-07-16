import type { SegmentationModelVariant } from '@/types/segmentation';

/**
 * Segmentation models are large (up to ~90MB) and their upstream hosts (Google
 * Cloud Storage, Hugging Face) serve CORS-enabled responses that work fine
 * under this app's COOP/COEP isolation, confirmed with a live fetch. Fetching
 * them directly in production avoids bundling them into the deployment, which
 * would blow past Vercel's Hobby-plan static file size limit. In development,
 * a locally placed file (see public/models/README.md) is used instead so the
 * app works offline and model swaps don't require a network round trip.
 */
function resolveModelUrl(localUrl: string, remoteUrl: string): string {
  return process.env.NODE_ENV === 'production' ? remoteUrl : localUrl;
}

/** Per-channel mean/std used by `imagenet-per-image-max` normalization. */
export const IMAGENET_NORMALIZE_MEAN: readonly [number, number, number] = [
  0.485, 0.456, 0.406,
];
export const IMAGENET_NORMALIZE_STD: readonly [number, number, number] = [
  0.229, 0.224, 0.225,
];

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
  /** `nhwc`: [1, H, W, C] (channels-last). `nchw`: [1, C, H, W] (channels-first). */
  readonly tensorLayout: 'nhwc' | 'nchw';
  /**
   * `zero-one`: divide the 0-255 pixel value by 255.
   * `imagenet-per-image-max`: divide by the image's own max pixel value, then
   * apply ImageNet mean/std normalization (matches U^2-Net's reference
   * preprocessing).
   */
  readonly normalization: 'zero-one' | 'imagenet-per-image-max';
  /** True when the model has no CPU (wasm) fallback and only runs on WebGPU. */
  readonly requiresWebGpu: boolean;
}

// input_1, float32, [1, 144, 256, 3]
const SELFIE_LANDSCAPE_CONFIG: SegmentationModelConfig = {
  url: resolveModelUrl(
    '/models/segmentation.tflite',
    'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite'
  ),
  inputWidth: 256,
  inputHeight: 144,
  inputChannels: 3,
  outputKind: 'foreground-mask',
  tensorLayout: 'nhwc',
  normalization: 'zero-one',
  requiresWebGpu: false,
};

// selfie_multiclass_256x256: square float32 input, [1, 256, 256, 6] output.
// Verify the actual name/shape/dtype via model.getInputDetails() /
// model.getOutputDetails() once the file is placed in public/models.
const SELFIE_MULTICLASS_CONFIG: SegmentationModelConfig = {
  url: resolveModelUrl(
    '/models/segmentation-multiclass.tflite',
    'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite'
  ),
  inputWidth: 256,
  inputHeight: 256,
  inputChannels: 3,
  outputKind: 'multiclass-6',
  tensorLayout: 'nhwc',
  normalization: 'zero-one',
  requiresWebGpu: false,
};

// U^2-Net full (mlboydaisuke/U-2-Net-LiteRT, u2net_fp16.tflite): square
// float32 NCHW input, [1, 1, 320, 320] sigmoid saliency mask output. GPU-only
// (no CPU fallback, no Flex ops per the model card). Verify the actual
// name/shape/dtype via model.getInputDetails() / model.getOutputDetails()
// once the file is placed in public/models.
const U2NET_FULL_CONFIG: SegmentationModelConfig = {
  url: resolveModelUrl(
    '/models/u2net-full.tflite',
    'https://huggingface.co/mlboydaisuke/U-2-Net-LiteRT/resolve/main/u2net_fp16.tflite'
  ),
  inputWidth: 320,
  inputHeight: 320,
  inputChannels: 3,
  outputKind: 'foreground-mask',
  tensorLayout: 'nchw',
  normalization: 'imagenet-per-image-max',
  requiresWebGpu: true,
};

export const SEGMENTATION_MODEL_CONFIGS: Record<
  SegmentationModelVariant,
  SegmentationModelConfig
> = {
  'selfie-landscape': SELFIE_LANDSCAPE_CONFIG,
  'selfie-multiclass': SELFIE_MULTICLASS_CONFIG,
  'u2net-full': U2NET_FULL_CONFIG,
};

export const DEFAULT_SEGMENTATION_MODEL_VARIANT: SegmentationModelVariant =
  'selfie-landscape';

/** Minimum interval between two inference calls while streaming from the camera. */
export const SEGMENTATION_INTERVAL_MS = 150;
