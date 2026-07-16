export type BackgroundMode = 'transparent' | 'color' | 'blur';

/** Accelerator the user can explicitly select to compare performance. */
export type SegmentationAccelerator = 'webgpu' | 'wasm';

/**
 * Segmentation model the user can select. `selfie-landscape` outputs a single
 * foreground-probability channel; `selfie-multiclass` outputs 6 per-class
 * probabilities (background/hair/body-skin/face-skin/clothes/others) that get
 * collapsed into a foreground mask for the background-removal use case;
 * `u2net-full` is a general salient-object-detection model that outputs a
 * single-channel saliency mask from a square, ImageNet-normalized NCHW input.
 */
export type SegmentationModelVariant =
  'selfie-landscape' | 'selfie-multiclass' | 'u2net-full';

/** Rolling inference-time stats for the currently selected accelerator. */
export interface InferenceStats {
  /** Most recent inference time in milliseconds. */
  readonly lastMs: number;
  /** Rolling average inference time in milliseconds. */
  readonly averageMs: number;
  /** Number of inferences accumulated into the average. */
  readonly count: number;
}

export interface SegmentationMask {
  /**
   * Foreground probability per pixel, in [0, 1] (person for the selfie
   * models, salient object for u2net-full).
   */
  readonly data: Float32Array;
  readonly width: number;
  readonly height: number;
}
