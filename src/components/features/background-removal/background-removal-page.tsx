'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSegmentationModel } from '@/hooks/use-segmentation-model';
import { supportsWebGpu } from '@/lib/litert/load-segmentation-model';
import { ModelStatusBanner } from '@/components/features/background-removal/model-status-banner';
import { LiteRtInfo } from '@/components/features/background-removal/litert-info';
import { AcceleratorSelector } from '@/components/features/background-removal/accelerator-selector';
import { ModelSelector } from '@/components/features/background-removal/model-selector';
import { BackgroundModeSelector } from '@/components/features/background-removal/background-mode-selector';
import { SourceModeTabs } from '@/components/features/background-removal/source-mode-tabs';
import { DEFAULT_SEGMENTATION_MODEL_VARIANT } from '@/lib/constants/segmentation-model-config';
import type {
  BackgroundMode,
  InferenceStats,
  SegmentationAccelerator,
  SegmentationModelVariant,
} from '@/types/segmentation';

const DEFAULT_BACKGROUND_COLOR = '#22c55e';
/** Window size for the rolling average of inference times. */
const AVERAGE_WINDOW = 30;

/** No-op subscribe: WebGPU support never changes during a session. */
const subscribeNoop = () => () => {};

export function BackgroundRemovalPage() {
  // WebGPU support can only be detected on the client. useSyncExternalStore
  // renders the server snapshot (false) first, then swaps in the client value
  // without a hydration mismatch.
  const webGpuSupported = useSyncExternalStore(
    subscribeNoop,
    () => supportsWebGpu(),
    () => false
  );

  // `null` means "follow the default for this browser"; a non-null value is an
  // explicit user choice.
  const [selectedAccelerator, setSelectedAccelerator] =
    useState<SegmentationAccelerator | null>(null);
  const accelerator: SegmentationAccelerator =
    selectedAccelerator ?? (webGpuSupported ? 'webgpu' : 'wasm');

  const [modelVariant, setModelVariant] = useState<SegmentationModelVariant>(
    DEFAULT_SEGMENTATION_MODEL_VARIANT
  );

  const { status, model } = useSegmentationModel(accelerator, modelVariant);
  const [backgroundMode, setBackgroundMode] =
    useState<BackgroundMode>('transparent');
  const [backgroundColor, setBackgroundColor] = useState(
    DEFAULT_BACKGROUND_COLOR
  );
  const [stats, setStats] = useState<InferenceStats | null>(null);

  // Reset the measured stats whenever the accelerator or model variant
  // changes so the numbers always reflect the currently selected combination.
  // Adjusting state during render avoids a cascading effect re-render.
  const statsKey = `${accelerator}:${modelVariant}`;
  const [statsKeyState, setStatsKeyState] = useState(statsKey);
  if (statsKeyState !== statsKey) {
    setStatsKeyState(statsKey);
    setStats(null);
  }

  const handleInference = useCallback((ms: number) => {
    setStats((prev) => {
      if (!prev) return { lastMs: ms, averageMs: ms, count: 1 };
      const count = prev.count + 1;
      const weight = Math.min(count, AVERAGE_WINDOW);
      const averageMs = prev.averageMs + (ms - prev.averageMs) / weight;
      return { lastMs: ms, averageMs, count };
    });
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">背景削除デモ (LiteRT.js)</h1>
        <p className="text-sm text-muted-foreground">
          画像アップロードまたはWebカメラから、サーバーに送信せずブラウザ内だけで完結する人物セグメンテーション・背景削除を試せます。
        </p>
      </div>

      <ModelStatusBanner status={status} modelVariant={modelVariant} />
      <LiteRtInfo />

      <Card>
        <CardHeader>
          <CardTitle>セグメンテーションモデル</CardTitle>
        </CardHeader>
        <CardContent>
          <ModelSelector
            variant={modelVariant}
            onVariantChange={setModelVariant}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>アクセラレータ（WebGPU / CPU 比較）</CardTitle>
        </CardHeader>
        <CardContent>
          <AcceleratorSelector
            accelerator={accelerator}
            onAcceleratorChange={setSelectedAccelerator}
            webGpuSupported={webGpuSupported}
            stats={stats}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>背景の表示方法</CardTitle>
        </CardHeader>
        <CardContent>
          <BackgroundModeSelector
            mode={backgroundMode}
            onModeChange={setBackgroundMode}
            color={backgroundColor}
            onColorChange={setBackgroundColor}
          />
        </CardContent>
      </Card>

      <SourceModeTabs
        model={model}
        modelVariant={modelVariant}
        backgroundMode={backgroundMode}
        backgroundColor={backgroundColor}
        onInference={handleInference}
      />
    </div>
  );
}
