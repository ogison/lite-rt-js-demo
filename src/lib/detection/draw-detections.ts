import type { Detection } from '@/types/object-detection';

const BOX_COLOR = '#22c55e';
const LABEL_TEXT_COLOR = '#052e16';

export function drawDetections(
  ctx: CanvasRenderingContext2D,
  detections: readonly Detection[],
  canvasWidth: number,
  canvasHeight: number
): void {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.lineWidth = 2;
  ctx.font = '16px sans-serif';
  ctx.textBaseline = 'top';

  for (const detection of detections) {
    const [ymin, xmin, ymax, xmax] = detection.box;
    const x = xmin * canvasWidth;
    const y = ymin * canvasHeight;
    const width = (xmax - xmin) * canvasWidth;
    const height = (ymax - ymin) * canvasHeight;

    ctx.strokeStyle = BOX_COLOR;
    ctx.strokeRect(x, y, width, height);

    const label = `${detection.label} ${(detection.score * 100).toFixed(0)}%`;
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = BOX_COLOR;
    ctx.fillRect(x, Math.max(0, y - 20), textWidth + 8, 20);
    ctx.fillStyle = LABEL_TEXT_COLOR;
    ctx.fillText(label, x + 4, Math.max(0, y - 20) + 2);
  }
}
