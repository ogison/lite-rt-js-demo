export type BackgroundMode = 'transparent' | 'color' | 'blur';

export interface SegmentationMask {
  /** Foreground (person) probability per pixel, in [0, 1]. */
  readonly data: Float32Array;
  readonly width: number;
  readonly height: number;
}
