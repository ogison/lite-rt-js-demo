'use client';

import type { CompiledModel } from '@litertjs/core';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploadPanel } from '@/components/features/background-removal/image-upload-panel';
import { WebcamPanel } from '@/components/features/background-removal/webcam-panel';
import type { BackgroundMode } from '@/types/segmentation';

interface SourceModeTabsProps {
  model: CompiledModel | null;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
}

export function SourceModeTabs({
  model,
  backgroundMode,
  backgroundColor,
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
          backgroundMode={backgroundMode}
          backgroundColor={backgroundColor}
        />
      </TabsContent>
      <TabsContent value="camera">
        <WebcamPanel
          model={model}
          backgroundMode={backgroundMode}
          backgroundColor={backgroundColor}
        />
      </TabsContent>
    </Tabs>
  );
}
