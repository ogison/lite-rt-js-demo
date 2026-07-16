'use client';

import { useEffect, useRef, useState } from 'react';
import type { CompiledModel } from '@litertjs/core';
import { imageSourceToInputTensor } from '@/lib/detection/preprocess';
import { tensorsToDetections } from '@/lib/detection/postprocess';
import { DETECTION_INTERVAL_MS } from '@/lib/constants/model-config';
import type { Detection } from '@/types/object-detection';

/**
 * Runs object detection on a <video> element in a requestAnimationFrame loop,
 * throttled to DETECTION_INTERVAL_MS and guarded so a slow inference never
 * overlaps with the next one (skips frames instead of queuing them).
 */
export function useRealtimeDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  model: CompiledModel | null,
  enabled: boolean,
  confidenceThreshold: number
): Detection[] {
  const [detections, setDetections] = useState<Detection[]>([]);
  const isDetectingRef = useRef(false);
  const lastRunAtRef = useRef(0);
  const thresholdRef = useRef(confidenceThreshold);

  useEffect(() => {
    thresholdRef.current = confidenceThreshold;
  }, [confidenceThreshold]);

  useEffect(() => {
    if (!enabled || !model) return;

    let rafId = 0;
    let cancelled = false;

    const runDetection = async (video: HTMLVideoElement) => {
      const inputTensor = imageSourceToInputTensor(
        video,
        video.videoWidth,
        video.videoHeight
      );
      try {
        const outputs = await model.run(inputTensor);
        const result = await tensorsToDetections(outputs, thresholdRef.current);
        if (!cancelled) setDetections(result);
      } catch (error) {
        console.error('[object-detection] realtime inference failed', error);
      } finally {
        inputTensor.delete();
        isDetectingRef.current = false;
      }
    };

    const loop = (time: number) => {
      if (cancelled) return;
      rafId = requestAnimationFrame(loop);

      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      if (isDetectingRef.current) return;
      if (time - lastRunAtRef.current < DETECTION_INTERVAL_MS) return;

      lastRunAtRef.current = time;
      isDetectingRef.current = true;
      void runDetection(video);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [enabled, model, videoRef]);

  return enabled ? detections : [];
}
