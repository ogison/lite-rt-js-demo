'use client';

import { useState } from 'react';
import type { CompiledModel } from '@litertjs/core';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CutoutCanvas } from '@/components/features/background-removal/cutout-canvas';
import { useUserMedia } from '@/hooks/use-user-media';
import { useRealtimeSegmentation } from '@/hooks/use-realtime-segmentation';
import { CHECKERBOARD_BACKGROUND_STYLE } from '@/lib/segmentation/checkerboard-style';
import type {
  BackgroundMode,
  SegmentationModelVariant,
} from '@/types/segmentation';

interface WebcamPanelProps {
  model: CompiledModel | null;
  modelVariant: SegmentationModelVariant;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  onInference?: (ms: number) => void;
}

export function WebcamPanel({
  model,
  modelVariant,
  backgroundMode,
  backgroundColor,
  onInference,
}: WebcamPanelProps) {
  const { videoRef, status, start, stop } = useUserMedia();
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [videoSize, setVideoSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const isStreaming = status.status === 'streaming';
  const mask = useRealtimeSegmentation(
    videoRef,
    model,
    modelVariant,
    isStreaming,
    onInference
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

      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-md bg-black"
        style={
          isStreaming && mask && backgroundMode === 'transparent'
            ? CHECKERBOARD_BACKGROUND_STYLE
            : undefined
        }
      >
        <video
          ref={(node) => {
            videoRef.current = node;
            setVideoEl(node);
          }}
          className="hidden"
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
        {isStreaming && !mask && <div className="aspect-video w-full" />}
        {isStreaming && mask && videoSize && videoEl && (
          <CutoutCanvas
            source={videoEl}
            mask={mask}
            width={videoSize.width}
            height={videoSize.height}
            backgroundMode={backgroundMode}
            backgroundColor={backgroundColor}
            className="w-full"
          />
        )}
      </div>
    </div>
  );
}
