'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/helpers/utils';
import { composeCutout } from '@/lib/segmentation/compose-cutout';
import type { BackgroundMode, SegmentationMask } from '@/types/segmentation';

interface CutoutCanvasProps {
  source: CanvasImageSource;
  mask: SegmentationMask;
  width: number;
  height: number;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  className?: string;
}

export function CutoutCanvas({
  source,
  mask,
  width,
  height,
  backgroundMode,
  backgroundColor,
  className,
}: CutoutCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    composeCutout(ctx, source, width, height, mask, {
      backgroundMode,
      backgroundColor,
    });
  }, [source, mask, width, height, backgroundMode, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={cn('block', className)}
    />
  );
}
