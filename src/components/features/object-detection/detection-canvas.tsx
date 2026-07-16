'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/helpers/utils';
import { drawDetections } from '@/lib/detection/draw-detections';
import type { Detection } from '@/types/object-detection';

interface DetectionCanvasProps {
  detections: readonly Detection[];
  width: number;
  height: number;
  className?: string;
}

export function DetectionCanvas({
  detections,
  width,
  height,
  className,
}: DetectionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    drawDetections(ctx, detections, width, height);
  }, [detections, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full',
        className
      )}
    />
  );
}
