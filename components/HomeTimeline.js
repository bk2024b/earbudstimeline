'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import InteractiveTimeline from '@/components/InteractiveTimeline';

function TimelineContent({ models, brands, locale }) {
  const searchParams = useSearchParams();

  return (
    <InteractiveTimeline
      models={models}
      brands={brands}
      locale={locale}
      initialAnc={searchParams.get('anc') === 'yes' ? 'yes' : 'all'}
      initialBt={searchParams.get('bt') || 'all'}
    />
  );
}

export default function HomeTimeline({ models, brands, locale }) {
  return (
    <Suspense fallback={null}>
      <TimelineContent models={models} brands={brands} locale={locale} />
    </Suspense>
  );
}
