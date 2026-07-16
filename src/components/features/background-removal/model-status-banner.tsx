import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { SEGMENTATION_MODEL_CONFIGS } from '@/lib/constants/segmentation-model-config';
import type { ModelStatus } from '@/types/object-detection';
import type { SegmentationModelVariant } from '@/types/segmentation';

interface ModelStatusBannerProps {
  status: ModelStatus;
  modelVariant: SegmentationModelVariant;
}

export function ModelStatusBanner({
  status,
  modelVariant,
}: ModelStatusBannerProps) {
  if (status.status === 'idle' || status.status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <span className="text-sm text-muted-foreground">
          モデルを読み込み中…
        </span>
      </div>
    );
  }

  if (status.status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTitle>モデルの読み込みに失敗しました</AlertTitle>
        <AlertDescription>
          {status.error.message}
          <br />
          {SEGMENTATION_MODEL_CONFIGS[modelVariant].url}{' '}
          に配置・アクセスできるか確認してください。
        </AlertDescription>
      </Alert>
    );
  }

  if (status.accelerator === 'wasm') {
    return (
      <Alert>
        <AlertTitle>CPU (WebAssembly) で実行中</AlertTitle>
        <AlertDescription>
          CPU (WebAssembly) アクセラレータでモデルを実行しています。
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      準備完了（WebGPUアクセラレータで実行中）
    </p>
  );
}
