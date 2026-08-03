'use client';

import { useRouter } from 'next/navigation';

export default function QuickCompareSelect({ currentId, brands, allModels }) {
  const router = useRouter();

  return (
    <select
      defaultValue=""
      onChange={(e) => {
        if (e.target.value) router.push(`/comparer?a=${currentId}&b=${e.target.value}`);
      }}
      className="bg-panel2 border border-line rounded-lg px-3 py-2 text-[13.5px] max-w-[240px]"
    >
      <option value="">Choisir un modèle...</option>
      {brands.map((b) => (
        <optgroup key={b.id} label={b.name}>
          {allModels
            .filter((x) => x.brand_id === b.id && x.id !== currentId)
            .map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}
