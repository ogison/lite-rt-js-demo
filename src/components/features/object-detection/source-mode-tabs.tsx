'use client';

import type { CompiledModel } from '@litertjs/core';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploadPanel } from '@/components/features/object-detection/image-upload-panel';
import { WebcamPanel } from '@/components/features/object-detection/webcam-panel';

interface SourceModeTabsProps {
  model: CompiledModel | null;
  confidenceThreshold: number;
}

export function SourceModeTabs({
  model,
  confidenceThreshold,
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
          confidenceThreshold={confidenceThreshold}
        />
      </TabsContent>
      <TabsContent value="camera">
        <WebcamPanel model={model} confidenceThreshold={confidenceThreshold} />
      </TabsContent>
    </Tabs>
  );
}
