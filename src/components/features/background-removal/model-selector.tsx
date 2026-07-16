'use client';

import { Button } from '@/components/ui/button';
import type { SegmentationModelVariant } from '@/types/segmentation';

interface ModelSelectorProps {
  variant: SegmentationModelVariant;
  onVariantChange: (variant: SegmentationModelVariant) => void;
}

const OPTIONS: ReadonlyArray<{
  value: SegmentationModelVariant;
  label: string;
  description: string;
}> = [
  {
    value: 'selfie-landscape',
    label: 'Selfie Segmenter (landscape)',
    description: '横長入力・前景確率を直接出力する軽量モデル。',
  },
  {
    value: 'selfie-multiclass',
    label: 'Selfie Multiclass (256x256)',
    description:
      '正方形入力・髪/肌/服などをクラス分けする多クラスモデル。背景以外のクラスを合成して前景マスクとして利用します。',
  },
  {
    value: 'u2net-full',
    label: 'U²-Net Full',
    description:
      '人物に限らない一般物体のsalient object detectionモデル。WebGPUでのみ動作し、CPU (WebAssembly) フォールバックはありません。',
  },
];

export function ModelSelector({
  variant,
  onVariantChange,
}: ModelSelectorProps) {
  const selected = OPTIONS.find((option) => option.value === variant);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {OPTIONS.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={variant === option.value ? 'default' : 'outline'}
            onClick={() => onVariantChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {selected && (
        <p className="text-xs text-muted-foreground">{selected.description}</p>
      )}
    </div>
  );
}
