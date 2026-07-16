'use client';

import { useState } from 'react';
import type { CompiledModel } from '@litertjs/core';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DetectionCanvas } from '@/components/features/object-detection/detection-canvas';
import { DetectionResultsList } from '@/components/features/object-detection/detection-results-list';
import { useUserMedia } from '@/hooks/use-user-media';
import { useRealtimeDetection } from '@/hooks/use-realtime-detection';

interface WebcamPanelProps {
  model: CompiledModel | null;
  confidenceThreshold: number;
}

export function WebcamPanel({ model, confidenceThreshold }: WebcamPanelProps) {
  const { videoRef, status, start, stop } = useUserMedia();
  const [videoSize, setVideoSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const isStreaming = status.status === 'streaming';
  const detections = useRealtimeDetection(
    videoRef,
    model,
    isStreaming,
    confidenceThreshold
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {isStreaming ? (
          <Button variant="outline" onClick={stop}>
            カメラを停止
          </Button>
        ) : (
          <Button
            onClick={() => void start()}
            disabled={!model || status.status === 'starting'}
          >
            {status.status === 'starting' ? '起動中…' : 'カメラを開始'}
          </Button>
        )}
      </div>

      {status.status === 'error' && (
        <Alert variant="destructive">
          <AlertTitle>カメラを利用できません</AlertTitle>
          <AlertDescription>{status.error.message}</AlertDescription>
        </Alert>
      )}

      <div className="relative w-full max-w-2xl overflow-hidden rounded-md bg-black">
        <video
          ref={videoRef}
          className="w-full"
          muted
          playsInline
          onLoadedMetadata={(event) => {
            const target = event.currentTarget;
            setVideoSize({
              width: target.videoWidth,
              height: target.videoHeight,
            });
          }}
        />
        {videoSize && isStreaming && (
          <DetectionCanvas
            detections={detections}
            width={videoSize.width}
            height={videoSize.height}
          />
        )}
      </div>

      <DetectionResultsList detections={detections} />
    </div>
  );
}
