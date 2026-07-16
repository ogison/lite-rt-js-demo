'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CameraStatus } from '@/types/object-detection';

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export interface UseUserMediaResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  start: () => Promise<void>;
  stop: () => void;
}

export function useUserMedia(): UseUserMediaResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>({ status: 'idle' });

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus({ status: 'idle' });
  }, []);

  const start = useCallback(async () => {
    setStatus({ status: 'starting' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus({ status: 'streaming' });
    } catch (error) {
      setStatus({ status: 'error', error: toError(error) });
    }
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return { videoRef, status, start, stop };
}
