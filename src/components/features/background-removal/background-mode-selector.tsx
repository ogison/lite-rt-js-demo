'use client';

import { Button } from '@/components/ui/button';
import type { BackgroundMode } from '@/types/segmentation';

interface BackgroundModeSelectorProps {
  mode: BackgroundMode;
  onModeChange: (mode: BackgroundMode) => void;
  color: string;
  onColorChange: (color: string) => void;
}

const MODES: ReadonlyArray<{ value: BackgroundMode; label: string }> = [
  { value: 'transparent', label: '透過' },
  { value: 'color', label: '単色' },
  { value: 'blur', label: 'ぼかし' },
];

export function BackgroundModeSelector({
  mode,
  onModeChange,
  color,
  onColorChange,
}: BackgroundModeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {MODES.map((m) => (
        <Button
          key={m.value}
          size="sm"
          variant={mode === m.value ? 'default' : 'outline'}
          onClick={() => onModeChange(m.value)}
        >
          {m.label}
        </Button>
      ))}
      {mode === 'color' && (
        <input
          type="color"
          value={color}
          onChange={(event) => onColorChange(event.target.value)}
          className="h-8 w-10 cursor-pointer rounded border"
          aria-label="背景色"
        />
      )}
    </div>
  );
}
