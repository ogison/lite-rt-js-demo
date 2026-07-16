'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useObjectDetectionModel } from '@/hooks/use-object-detection-model';
import { ModelStatusBanner } from '@/components/features/object-detection/model-status-banner';
import { LiteRtInfo } from '@/components/features/object-detection/litert-info';
import { ConfidenceThresholdSlider } from '@/components/features/object-detection/confidence-threshold-slider';
import { SourceModeTabs } from '@/components/features/object-detection/source-mode-tabs';
import { DEFAULT_CONFIDENCE_THRESHOLD } from '@/lib/constants/model-config';

export function ObjectDetectionPage() {
  const { status, model } = useObjectDetectionModel();
  const [confidenceThreshold, setConfidenceThreshold] = useState(
    DEFAULT_CONFIDENCE_THRESHOLD
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">物体検出デモ (LiteRT.js)</h1>
        <p className="text-sm text-muted-foreground">
          画像アップロードまたはWebカメラから、サーバーに送信せずブラウザ内だけで完結する物体検出を試せます。
        </p>
      </div>

      <ModelStatusBanner status={status} />
      <LiteRtInfo />

      <Card>
        <CardHeader>
          <CardTitle>設定</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfidenceThresholdSlider
            value={confidenceThreshold}
            onValueChange={setConfidenceThreshold}
          />
        </CardContent>
      </Card>

      <SourceModeTabs model={model} confidenceThreshold={confidenceThreshold} />
    </div>
  );
}
