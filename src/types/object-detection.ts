export interface Detection {
  readonly classId: number;
  readonly label: string;
  readonly score: number;
  /** Normalized [0, 1] box in [ymin, xmin, ymax, xmax] order. */
  readonly box: readonly [number, number, number, number];
}

export type RuntimeStatus =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; error: Error };

export type ModelStatus =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; accelerator: 'webgpu' | 'wasm' }
  | { status: 'error'; error: Error };

export type SourceMode = 'image' | 'camera';

export type CameraStatus =
  | { status: 'idle' }
  | { status: 'starting' }
  | { status: 'streaming' }
  | { status: 'error'; error: Error };
