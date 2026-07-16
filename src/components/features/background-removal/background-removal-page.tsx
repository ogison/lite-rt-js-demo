'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSegmentationModel } from '@/hooks/use-segmentation-model';
import { ModelStatusBanner } from '@/components/features/background-removal/model-status-banner';
import { LiteRtInfo } from '@/components/features/background-removal/litert-info';
import { BackgroundModeSelector } from '@/components/features/background-removal/background-mode-selector';
import { SourceModeTabs } from '@/components/features/background-removal/source-mode-tabs';
import type { BackgroundMode } from '@/types/segmentation';

const DEFAULT_BACKGROUND_COLOR = '#22c55e';

export function BackgroundRemovalPage() {
  const { status, model } = useSegmentationModel();
  const [backgroundMode, setBackgroundMode] =
    useState<BackgroundMode>('transparent');
  const [backgroundColor, setBackgroundColor] = useState(
    DEFAULT_BACKGROUND_COLOR
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">背景削除デモ (LiteRT.js)</h1>
        <p className="text-sm text-muted-foreground">
          画像アップロードまたはWebカメラから、サーバーに送信せずブラウザ内だけで完結する人物セグメンテーション・背景削除を試せます。
        </p>
      </div>

      <ModelStatusBanner status={status} />
      <LiteRtInfo />

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
        backgroundMode={backgroundMode}
        backgroundColor={backgroundColor}
      />
    </div>
  );
}
