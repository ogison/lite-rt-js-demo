'use client';

import { useEffect, useState } from 'react';
import { getLiteRtRuntime } from '@/lib/litert/init-litert';
import type { RuntimeStatus } from '@/types/object-detection';

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export function useLiteRtRuntime(): RuntimeStatus {
  const [status, setStatus] = useState<RuntimeStatus>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    getLiteRtRuntime()
      .then(() => {
        if (!cancelled) setStatus({ status: 'ready' });
      })
      .catch((error: unknown) => {
        if (!cancelled) setStatus({ status: 'error', error: toError(error) });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
