import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { ModelStatus } from '@/types/object-detection';

interface ModelStatusBannerProps {
  status: ModelStatus;
}

export function ModelStatusBanner({ status }: ModelStatusBannerProps) {
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
          public/models/object-detection.tflite
          が配置されているか確認してください。
        </AlertDescription>
      </Alert>
    );
  }

  if (status.accelerator === 'wasm') {
    return (
      <Alert>
        <AlertTitle>CPU (WebAssembly) で実行中</AlertTitle>
        <AlertDescription>
          このブラウザではWebGPUが利用できないため、CPUにフォールバックしています。
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
