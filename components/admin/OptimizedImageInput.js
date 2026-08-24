'use client';

import { useRef, useState } from 'react';
import { optimizeImageFile } from '@/lib/clientImageOptimization';

export default function OptimizedImageInput({ name = 'image', accept = 'image/*', className = '', onOptimized }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState('');

  async function handleChange(event) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) {
      setStatus('');
      return;
    }

    setStatus('Optimisation…');
    try {
      const optimized = await optimizeImageFile(file);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(optimized);
      input.files = dataTransfer.files;
      const reduction = file.size > 0 ? Math.round((1 - optimized.size / file.size) * 100) : 0;
      setStatus(optimized !== file && reduction > 0 ? `Optimisée · −${reduction}%` : 'Image prête');
      onOptimized?.(optimized);
    } catch (error) {
      setStatus(error?.message || 'Optimisation impossible — fichier original conservé.');
      onOptimized?.(file);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        onChange={handleChange}
        className={className}
      />
      {status && <p className="text-[11px] text-accent mt-1.5">{status}</p>}
    </div>
  );
}
