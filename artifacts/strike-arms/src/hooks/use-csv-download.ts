import { useCallback } from 'react';

/**
 * Hands the browser a CSV to save.
 *
 * This lives in a hook rather than lib/ because it touches the document, and
 * lib/ is meant to stay side-effect free. Orders and products both use it, so
 * they cannot end up disagreeing about the content type -- which is the part
 * that decides whether a phone can preview the file at all.
 */
export function useCsvDownload() {
  return useCallback((csv: string, filename: string) => {
    // text/csv rather than octet-stream so a phone can preview it, and the BOM
    // in the body is what actually tells Excel the encoding.
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, []);
}
