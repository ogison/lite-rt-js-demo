'use client';

import type { CompiledModel } from '@litertjs/core';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploadPanel } from '@/components/features/background-removal/image-upload-panel';
import { WebcamPanel } from '@/components/features/background-removal/webcam-panel';
import type {
  BackgroundMode,
  SegmentationModelVariant,
} from '@/types/segmentation';

interface SourceModeTabsProps {
  model: CompiledModel | null;
  modelVariant: SegmentationModelVariant;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  onInference?: (ms: number) => void;
}

export function SourceModeTabs({
  model,
  modelVariant,
  backgroundMode,
  backgroundColor,
  onInference,
}: SourceModeTabsProps) {
  return (
    <Tabs defaultValue="image">
      <TabsList>
        <TabsTrigger value="image">画像アップロード</TabsTrigger>
        <TabsTrigger value="camera">Webカメラ</TabsTrigger>
      </TabsList>
      <TabsContent value="image">
        <ImageUploadPanel
          model={model}
          modelVariant={modelVariant}
          backgroundMode={backgroundMode}
          backgroundColor={backgroundColor}
          onInference={onInference}
        />
      </TabsContent>
      <TabsContent value="camera">
        <WebcamPanel
          model={model}
          modelVariant={modelVariant}
          backgroundMode={backgroundMode}
          backgroundColor={backgroundColor}
          onInference={onInference}
        />
      </TabsContent>
    </Tabs>
  );
}
