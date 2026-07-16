import type { Tensor } from '@litertjs/core';
import { COCO_LABELS } from '@/lib/constants/coco-labels';
import type { Detection } from '@/types/object-detection';

/**
 * Converts the 4 raw output Tensors of the SSD MobileNet V1 quantized model
 * (boxes, classes, scores, num_detections — this exact order, matching
 * model.getOutputDetails()) into Detection objects, and deletes the tensors
 * once their data has been read (LiteRT.js uses manual memory management).
 */
export async function tensorsToDetections(
  outputs: readonly Tensor[],
  confidenceThreshold: number
): Promise<Detection[]> {
  const [boxesTensor, classesTensor, scoresTensor, countTensor] = outputs;

  const [boxes, classes, scores, count] = await Promise.all([
    boxesTensor.data(),
    classesTensor.data(),
    scoresTensor.data(),
    countTensor.data(),
  ]);

  for (const tensor of outputs) {
    tensor.delete();
  }

  const numDetections = Math.round(count[0]);
  const detections: Detection[] = [];

  for (let i = 0; i < numDetections; i++) {
    const score = scores[i];
    if (score < confidenceThreshold) continue;

    const classId = Math.round(classes[i]);
    const label = COCO_LABELS[classId] ?? `class_${classId}`;
    const box: Detection['box'] = [
      boxes[i * 4],
      boxes[i * 4 + 1],
      boxes[i * 4 + 2],
      boxes[i * 4 + 3],
    ];

    detections.push({ classId, label, score, box });
  }

  return detections;
}
