'use client';

import { useEffect } from 'react';
import ErrorDisplay from '@/components/ErrorDisplay';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorDisplay variant="server" title="We hit a snag" description="The page crashed while rendering. Refreshing or trying again usually clears it up." actionLabel="Try again" onAction={reset} />;
}
