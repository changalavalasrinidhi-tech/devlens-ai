import { useEffect, useState } from 'react';

export type LoadStatus = 'loading' | 'ready' | 'error';

export function useSimulatedFetch<T>(data: T, delay = 800): {
  status: LoadStatus;
  data: T | null;
  retry: () => void;
} {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [result, setResult] = useState<T | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setStatus('loading');
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) {
        setResult(data);
        setStatus('ready');
      }
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [data, delay, attempt]);

  const retry = () => setAttempt((n) => n + 1);

  return { status, data: result, retry };
}
