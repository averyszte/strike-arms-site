import { useCallback, useRef, useState } from 'react';

import { uploadProductImage, deleteUncommittedImage } from '@/data/storage-repository';

/**
 * Uploads product images and keeps track of the ones no product owns yet.
 *
 * Uploading on selection rather than on save is what makes a preview possible,
 * but it means a file can exist in the bucket before — or instead of — any
 * product row referencing it. The trigger in migration 011 cannot see those:
 * it only fires when a product changes. So this hook holds the list of URLs
 * uploaded during this form session and deletes them if the admin removes one
 * or cancels the form. Once the product saves, they stop being ours to delete
 * and the trigger takes over.
 */

export type ImageUploadResult = {
  urls: string[];
  /** One sentence per file that failed, ready to show. */
  errors: string[];
};

export type ProductImageUpload = {
  upload: (files: File[]) => Promise<ImageUploadResult>;
  /** Removes an image the admin took back out of the form. */
  discard: (url: string) => void;
  /** Cancelled form: everything uploaded this session goes. */
  discardAll: () => void;
  /** Saved successfully: the product owns these now, so stop tracking them. */
  commit: () => void;
  isUploading: boolean;
};

export function useProductImageUpload(): ProductImageUpload {
  const [isUploading, setIsUploading] = useState(false);
  // A ref, not state: nothing renders from this list, and a stale closure over
  // it during an unmount-time cleanup would be exactly the wrong thing.
  const uncommitted = useRef<Set<string>>(new Set());

  const upload = useCallback(async (files: File[]): Promise<ImageUploadResult> => {
    setIsUploading(true);
    try {
      const settled = await Promise.allSettled(files.map(uploadProductImage));
      const urls: string[] = [];
      const errors: string[] = [];

      settled.forEach((outcome, index) => {
        if (outcome.status === 'fulfilled') {
          uncommitted.current.add(outcome.value);
          urls.push(outcome.value);
        } else {
          const reason = outcome.reason;
          errors.push(
            reason instanceof Error
              ? reason.message
              : `${files[index].name} could not be uploaded.`,
          );
        }
      });

      // Partial success is reported, not thrown: three of four photos landing
      // should leave three photos on the form, not none.
      return { urls, errors };
    } finally {
      setIsUploading(false);
    }
  }, []);

  const discard = useCallback((url: string) => {
    if (!uncommitted.current.delete(url)) return;
    // Best effort. If it fails the file is a genuine orphan the sweeper cannot
    // see, which is a wasted few hundred kilobytes — not worth blocking the
    // admin with an error they can do nothing about.
    void deleteUncommittedImage(url).catch(() => undefined);
  }, []);

  const discardAll = useCallback(() => {
    const urls = [...uncommitted.current];
    uncommitted.current.clear();
    urls.forEach(url => void deleteUncommittedImage(url).catch(() => undefined));
  }, []);

  const commit = useCallback(() => {
    uncommitted.current.clear();
  }, []);

  return { upload, discard, discardAll, commit, isUploading };
}
