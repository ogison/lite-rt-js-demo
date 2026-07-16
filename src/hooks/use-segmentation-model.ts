'use client';

import { useEffect, useState } from 'react';
import type { CompiledModel } from '@litertjs/core';
import { getSegmentationModel } from '@/lib/litert/load-segmentation-model';
import { useLiteRtRuntime } from '@/hooks/use-litert-runtime';
import type { ModelStatus } from '@/types/object-detection';

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export interface UseSegmentationModelResult {
  status: ModelStatus;
  model: CompiledModel | null;
}

interface LoadResult {
  status: ModelStatus;
  model: CompiledModel | null;
}

export function useSegmentationModel(): UseSegmentationModelResult {
  const runtime = useLiteRtRuntime();
  const [result, setResult] = useState<LoadResult>({
    status: { status: 'idle' },
    model: null,
  });

  useEffect(() => {
    if (runtime.status !== 'ready') return;

    let cancelled = false;

    getSegmentationModel()
      .then((loaded) => {
        if (cancelled) return;
        const describe = (
          details: ReturnType<CompiledModel['getInputDetails']>
        ) =>
          details.map((d) => ({
            name: d.name,
            dtype: d.dtype,
            shape: Array.from(d.shape),
          }));
        console.log(
          '[segmentation] input details:',
          JSON.stringify(describe(loaded.model.getInputDetails()))
        );
        console.log(
          '[segmentation] output details:',
          JSON.stringify(describe(loaded.model.getOutputDetails()))
        );
        setResult({
          status: { status: 'ready', accelerator: loaded.accelerator },
          model: loaded.model,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setResult({
          status: { status: 'error', error: toError(error) },
          model: null,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [runtime.status]);

  if (runtime.status === 'error') {
    return { status: { status: 'error', error: runtime.error }, model: null };
  }

  if (runtime.status === 'ready' && result.status.status === 'idle') {
    return { status: { status: 'loading' }, model: null };
  }

  return result;
}
