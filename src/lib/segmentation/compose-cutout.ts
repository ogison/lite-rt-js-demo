import type { BackgroundMode, SegmentationMask } from '@/types/segmentation';

const DEFAULT_BLUR_PX = 12;

function maskToAlphaCanvas(mask: SegmentationMask): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = mask.width;
  canvas.height = mask.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imageData = ctx.createImageData(mask.width, mask.height);
  for (let i = 0; i < mask.data.length; i++) {
    const alpha = Math.round(Math.max(0, Math.min(1, mask.data[i])) * 255);
    imageData.data[i * 4] = 255;
    imageData.data[i * 4 + 1] = 255;
    imageData.data[i * 4 + 2] = 255;
    imageData.data[i * 4 + 3] = alpha;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export interface ComposeCutoutOptions {
  backgroundMode: BackgroundMode;
  backgroundColor?: string;
  blurPx?: number;
}

/**
 * Composites `source` onto `outputCtx` with its background removed, using
 * `mask` (foreground probability, confirmed via a debug run to be in [0, 1]
 * with 1 = foreground) as the cutout's alpha channel.
 */
export function composeCutout(
  outputCtx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  mask: SegmentationMask,
  options: ComposeCutoutOptions
): void {
  const {
    backgroundMode,
    backgroundColor = '#22c55e',
    blurPx = DEFAULT_BLUR_PX,
  } = options;

  outputCtx.clearRect(0, 0, sourceWidth, sourceHeight);

  if (backgroundMode === 'color') {
    outputCtx.fillStyle = backgroundColor;
    outputCtx.fillRect(0, 0, sourceWidth, sourceHeight);
  } else if (backgroundMode === 'blur') {
    outputCtx.save();
    outputCtx.filter = `blur(${blurPx}px)`;
    outputCtx.drawImage(source, 0, 0, sourceWidth, sourceHeight);
    outputCtx.restore();
  }
  // 'transparent': leave the already-cleared background as is.

  const personCanvas = document.createElement('canvas');
  personCanvas.width = sourceWidth;
  personCanvas.height = sourceHeight;
  const personCtx = personCanvas.getContext('2d');
  if (!personCtx) return;

  personCtx.drawImage(source, 0, 0, sourceWidth, sourceHeight);
  personCtx.globalCompositeOperation = 'destination-in';
  personCtx.drawImage(maskToAlphaCanvas(mask), 0, 0, sourceWidth, sourceHeight);

  outputCtx.drawImage(personCanvas, 0, 0);
}
