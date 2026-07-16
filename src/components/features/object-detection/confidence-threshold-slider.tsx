'use client';

import { Slider } from '@/components/ui/slider';

interface ConfidenceThresholdSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

export function ConfidenceThresholdSlider({
  value,
  onValueChange,
}: ConfidenceThresholdSliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span>信頼度しきい値</span>
        <span className="font-medium">{Math.round(value * 100)}%</span>
      </div>
      <Slider
        value={[value]}
        min={0.1}
        max={0.9}
        step={0.05}
        onValueChange={([next]) => onValueChange(next)}
      />
    </div>
  );
}
