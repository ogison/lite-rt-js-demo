'use client';

import { useRef, useState } from 'react';
import type { CompiledModel } from '@litertjs/core';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CutoutCanvas } from '@/components/features/background-removal/cutout-canvas';
import { imageSourceToSegmentationInputTensor } from '@/lib/segmentation/preprocess';
import { tensorToSegmentationMask } from '@/lib/segmentation/postprocess';
import { CHECKERBOARD_BACKGROUND_STYLE } from '@/lib/segmentation/checkerboard-style';
import type {
  BackgroundMode,
  SegmentationMask,
  SegmentationModelVariant,
} from '@/types/segmentation';

interface ImageUploadPanelProps {
  model: CompiledModel | null;
  modelVariant: SegmentationModelVariant;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  onInference?: (ms: number) => void;
}

export function ImageUploadPanel({
  model,
  modelVariant,
  backgroundMode,
  backgroundColor,
  onInference,
}: ImageUploadPanelProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [mask, setMask] = useState<SegmentationMask | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください。');
      return;
    }

    setError(null);
    setMask(null);
    setImageUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
  };

  const handleRunClick = async () => {
    const image = imageRef.current;
    if (!model || !image) return;

    setIsProcessing(true);
    setError(null);
    try {
      const inputTensor = imageSourceToSegmentationInputTensor(
        image,
        image.naturalWidth,
        image.naturalHeight,
        modelVariant
      );
      const startedAt = performance.now();
      const outputs = await model.run(inputTensor);
      onInference?.(performance.now() - startedAt);
      inputTensor.delete();
      const result = await tensorToSegmentationMask(outputs, modelVariant);
      setMask(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
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
          onClick={() => void handleRunClick()}
          disabled={!model || !imageUrl || isProcessing}
        >
          {isProcessing ? '処理中…' : '背景を削除する'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {imageUrl && (
        <div
          className="w-full max-w-2xl overflow-hidden rounded-md"
          style={
            mask && backgroundMode === 'transparent'
              ? CHECKERBOARD_BACKGROUND_STYLE
              : undefined
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={(node) => {
              imageRef.current = node;
              setImageEl(node);
            }}
            src={imageUrl}
            alt="アップロードされた画像"
            className={mask ? 'hidden' : 'w-full rounded-md'}
            onLoad={(event) => {
              const target = event.currentTarget;
              setNaturalSize({
                width: target.naturalWidth,
                height: target.naturalHeight,
              });
            }}
          />
          {mask && naturalSize && imageEl && (
            <CutoutCanvas
              source={imageEl}
              mask={mask}
              width={naturalSize.width}
              height={naturalSize.height}
              backgroundMode={backgroundMode}
              backgroundColor={backgroundColor}
              className="w-full"
            />
          )}
        </div>
      )}
    </div>
  );
}
