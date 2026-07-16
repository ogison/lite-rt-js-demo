'use client';

import { useRef, useState } from 'react';
import type { CompiledModel } from '@litertjs/core';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DetectionCanvas } from '@/components/features/object-detection/detection-canvas';
import { DetectionResultsList } from '@/components/features/object-detection/detection-results-list';
import { imageSourceToInputTensor } from '@/lib/detection/preprocess';
import { tensorsToDetections } from '@/lib/detection/postprocess';
import type { Detection } from '@/types/object-detection';

interface ImageUploadPanelProps {
  model: CompiledModel | null;
  confidenceThreshold: number;
}

export function ImageUploadPanel({
  model,
  confidenceThreshold,
}: ImageUploadPanelProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください。');
      return;
    }

    setError(null);
    setDetections([]);
    setImageUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
  };

  const handleDetectClick = async () => {
    const image = imageRef.current;
    if (!model || !image) return;

    setIsDetecting(true);
    setError(null);
    try {
      const inputTensor = imageSourceToInputTensor(
        image,
        image.naturalWidth,
        image.naturalHeight
      );
      const outputs = await model.run(inputTensor);
      inputTensor.delete();
      const result = await tensorsToDetections(outputs, confidenceThreshold);
      setDetections(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          画像を選択
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          onClick={() => void handleDetectClick()}
          disabled={!model || !imageUrl || isDetecting}
        >
          {isDetecting ? '検出中…' : '検出する'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {imageUrl && (
        <div className="relative w-full max-w-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="アップロードされた画像"
            className="w-full rounded-md"
            onLoad={(event) => {
              const target = event.currentTarget;
              setNaturalSize({
                width: target.naturalWidth,
                height: target.naturalHeight,
              });
            }}
          />
          {naturalSize && (
            <DetectionCanvas
              detections={detections}
              width={naturalSize.width}
              height={naturalSize.height}
            />
          )}
        </div>
      )}

      <DetectionResultsList detections={detections} />
    </div>
  );
}
