'use client';

import { useEffect } from 'react';
import { optimizeImageFile } from '@/lib/clientImageOptimization';

export default function AdminImageUploadOptimizer() {
  useEffect(() => {
    async function handleSubmit(event) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || form.dataset.imageOptimized === '1') return;

      const inputs = Array.from(form.querySelectorAll('input[type="file"]')).filter((input) =>
        Array.from(input.files || []).some((file) => file.type?.startsWith('image/'))
      );
      if (inputs.length === 0) return;

      event.preventDefault();
      event.stopPropagation();

      try {
        for (const input of inputs) {
          const files = Array.from(input.files || []);
          const optimizedFiles = [];
          for (const file of files) optimizedFiles.push(await optimizeImageFile(file));

          const dataTransfer = new DataTransfer();
          optimizedFiles.forEach((file) => dataTransfer.items.add(file));
          input.files = dataTransfer.files;
        }
      } finally {
        form.dataset.imageOptimized = '1';
        form.requestSubmit();
        queueMicrotask(() => delete form.dataset.imageOptimized);
      }
    }

    document.addEventListener('submit', handleSubmit, true);
    return () => document.removeEventListener('submit', handleSubmit, true);
  }, []);

  return null;
}
