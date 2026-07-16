import { Badge } from '@/components/ui/badge';
import type { Detection } from '@/types/object-detection';

interface DetectionResultsListProps {
  detections: readonly Detection[];
}

export function DetectionResultsList({
  detections,
}: DetectionResultsListProps) {
  if (detections.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">検出結果はありません。</p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {detections.map((detection, index) => (
        <li key={`${detection.classId}-${index}`}>
          <Badge variant="secondary">
            {detection.label} {(detection.score * 100).toFixed(0)}%
          </Badge>
        </li>
      ))}
    </ul>
  );
}
