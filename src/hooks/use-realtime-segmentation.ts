'use client';

import { useEffect, useRef, useState } from 'react';
import type { CompiledModel } from '@litertjs/core';
import { imageSourceToSegmentationInputTensor } from '@/lib/segmentation/preprocess';
import { tensorToSegmentationMask } from '@/lib/segmentation/postprocess';
import { SEGMENTATION_INTERVAL_MS } from '@/lib/constants/segmentation-model-config';
import type { SegmentationMask } from '@/types/segmentation';

/**
 * Runs segmentation on a <video> element in a requestAnimationFrame loop,
 * throttled to SEGMENTATION_INTERVAL_MS and guarded so a slow inference never
 * overlaps with the next one (skips frames instead of queuing them). Mirrors
 * useRealtimeDetection.
 */
export function useRealtimeSegmentation(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  model: CompiledModel | null,
  enabled: boolean
): SegmentationMask | null {
  const [mask, setMask] = useState<SegmentationMask | null>(null);
  const isRunningRef = useRef(false);
  const lastRunAtRef = useRef(0);

  useEffect(() => {
    if (!enabled || !model) return;

    let rafId = 0;
    let cancelled = false;

    const runSegmentation = async (video: HTMLVideoElement) => {
      const inputTensor = imageSourceToSegmentationInputTensor(
        video,
        video.videoWidth,
        video.videoHeight
      );
      try {
        const outputs = await model.run(inputTensor);
        const result = await tensorToSegmentationMask(outputs);
        if (!cancelled) setMask(result);
      } catch (error) {
        console.error(
          '[background-removal] realtime segmentation failed',
          error
        );
      } finally {
        inputTensor.delete();
        isRunningRef.current = false;
      }
    };

    const loop = (time: number) => {
      if (cancelled) return;
      rafId = requestAnimationFrame(loop);

      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      if (isRunningRef.current) return;
      if (time - lastRunAtRef.current < SEGMENTATION_INTERVAL_MS) return;

      lastRunAtRef.current = time;
      isRunningRef.current = true;
      void runSegmentation(video);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [enabled, model, videoRef]);

  return enabled ? mask : null;
}
