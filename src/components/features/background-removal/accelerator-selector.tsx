'use client';

import { Button } from '@/components/ui/button';
import type {
  InferenceStats,
  SegmentationAccelerator,
} from '@/types/segmentation';

interface AcceleratorSelectorProps {
  accelerator: SegmentationAccelerator;
  onAcceleratorChange: (accelerator: SegmentationAccelerator) => void;
  webGpuSupported: boolean;
  /** True when the selected model has no CPU (wasm) fallback. */
  wasmDisabled?: boolean;
  stats: InferenceStats | null;
}

const OPTIONS: ReadonlyArray<{
  value: SegmentationAccelerator;
  label: string;
}> = [
  { value: 'webgpu', label: 'WebGPU (GPU)' },
  { value: 'wasm', label: 'CPU (WebAssembly)' },
];

export function AcceleratorSelector({
  accelerator,
  onAcceleratorChange,
  webGpuSupported,
  wasmDisabled = false,
  stats,
}: AcceleratorSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {OPTIONS.map((option) => {
          const disabled =
            (option.value === 'webgpu' && !webGpuSupported) ||
            (option.value === 'wasm' && wasmDisabled);
          return (
            <Button
              key={option.value}
              size="sm"
              variant={accelerator === option.value ? 'default' : 'outline'}
              disabled={disabled}
              onClick={() => onAcceleratorChange(option.value)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>

      {!webGpuSupported && (
        <p className="text-xs text-muted-foreground">
          このブラウザはWebGPUに対応していないため、CPU (WebAssembly)
          のみ利用できます。
        </p>
      )}

      {wasmDisabled && (
        <p className="text-xs text-muted-foreground">
          選択中のモデルはCPU (WebAssembly)
          フォールバックがなく、WebGPUでのみ動作します。
        </p>
      )}

      {stats ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="text-muted-foreground">
            最新の推論時間:{' '}
            <span className="font-mono font-medium text-foreground">
              {stats.lastMs.toFixed(1)} ms
            </span>
          </span>
          <span className="text-muted-foreground">
            平均:{' '}
            <span className="font-mono font-medium text-foreground">
              {stats.averageMs.toFixed(1)} ms
            </span>{' '}
            ({stats.count}回)
          </span>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          推論を実行すると、選択中のアクセラレータでの処理時間がここに表示されます。アクセラレータを切り替えて速度を比較できます。
        </p>
      )}
    </div>
  );
}
