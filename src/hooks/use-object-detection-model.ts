'use client';

import { useEffect, useState } from 'react';
import type { CompiledModel } from '@litertjs/core';
import { getObjectDetectionModel } from '@/lib/litert/load-model';
import { useLiteRtRuntime } from '@/hooks/use-litert-runtime';
import type { ModelStatus } from '@/types/object-detection';

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export interface UseObjectDetectionModelResult {
  status: ModelStatus;
  model: CompiledModel | null;
}

interface LoadResult {
  status: ModelStatus;
  model: CompiledModel | null;
}

export function useObjectDetectionModel(): UseObjectDetectionModelResult {
  const runtime = useLiteRtRuntime();
  const [result, setResult] = useState<LoadResult>({
    status: { status: 'idle' },
    model: null,
  });

  useEffect(() => {
    if (runtime.status !== 'ready') return;

    let cancelled = false;

    getObjectDetectionModel()
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
          '[object-detection] input details:',
          JSON.stringify(describe(loaded.model.getInputDetails()))
        );
        console.log(
          '[object-detection] output details:',
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

  // The model load hasn't started (or finished) yet, but the runtime is
  // ready: derive the "loading" status at render time instead of setting it
  // from the effect, to avoid an extra synchronous setState-in-effect.
  if (runtime.status === 'ready' && result.status.status === 'idle') {
    return { status: { status: 'loading' }, model: null };
  }

  return result;
}
