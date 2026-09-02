'use client';

import { useRouter } from '@/i18n/navigation';
import ExploreExperience from './ExploreExperience';

export default function ExploreClientWrapper({ journeys, locale }) {
  const router = useRouter();
  return (
    <ExploreExperience
      journeys={journeys}
      locale={locale}
      onExit={() => router.push('/')}
    />
  );
}
