import { useCallback } from 'react';

/** Hands the browser a JSON file to save. A hook because it touches the document. */
export function useJsonDownload() {
  return useCallback((value: unknown, filename: string) => {
    const body = JSON.stringify(value, null, 2);
    const url = URL.createObjectURL(new Blob([body], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, []);
}
