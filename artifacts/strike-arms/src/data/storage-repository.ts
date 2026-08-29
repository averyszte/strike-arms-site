/**
 * Supabase Storage — the product-images bucket.
 *
 * The rules here mirror migration 011 on purpose. The bucket enforces the MIME
 * allowlist and the size cap server-side, because a browser check is a
 * courtesy and not a control; these constants exist so the admin gets a
 * sentence instead of a 400 from the Storage API.
 *
 * Components never import this file directly; they go through
 * use-product-image-upload.ts.
 */

import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/compress-image';

const BUCKET = 'product-images';

/** Matches allowed_mime_types on the bucket. Also feeds the file input's accept. */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/**
 * The cap on what may be *selected*, before compression. The bucket's own
 * limit is 5 MiB and applies to what is actually uploaded; this larger number
 * exists so a normal 8 MB phone photo is accepted and compressed rather than
 * rejected for being a phone photo.
 */
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

/**
 * One year. Safe only because a path is never reused: every upload gets a
 * fresh UUID and upsert is off, so the bytes at a URL cannot change. Editing
 * an image means uploading a new one and pointing the product at it.
 */
const CACHE_CONTROL = '31536000';

const PUBLIC_URL_MARKER = `/storage/v1/object/public/${BUCKET}/`;

function describeSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Rejects with a message meant for the admin, not a stack trace. */
function assertUploadable(file: File): void {
  const accepted: readonly string[] = ACCEPTED_IMAGE_TYPES;
  if (!accepted.includes(file.type)) {
    throw new Error(
      `${file.name} is a ${file.type || 'unknown'} file. Use a JPEG, PNG or WebP.`,
    );
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error(
      `${file.name} is ${describeSize(file.size)}. The limit is ` +
        `${describeSize(MAX_SOURCE_BYTES)} before compression.`,
    );
  }
}

/**
 * Year-foldered so the bucket stays browsable by hand once there are hundreds
 * of files. The UUID is what makes the path unique; the year is for humans.
 */
function generatePath(extension: string): string {
  return `products/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${extension}`;
}

/** The path inside the bucket, or null for an externally hosted image. */
export function storagePathFromPublicUrl(publicUrl: string): string | null {
  const index = publicUrl.indexOf(PUBLIC_URL_MARKER);
  if (index === -1) return null;
  return publicUrl.slice(index + PUBLIC_URL_MARKER.length).split('?')[0] || null;
}

/** Compresses, uploads, and returns the public URL to store on the product. */
export async function uploadProductImage(file: File): Promise<string> {
  assertUploadable(file);

  const compressed = await compressImage(file);
  const path = generatePath(compressed.extension);

  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed.blob, {
    contentType: compressed.contentType,
    cacheControl: CACHE_CONTROL,
    // Never overwrite. A UUID collision would mean losing another product's
    // image silently, which is exactly the kind of failure that goes unnoticed
    // until a customer sees the wrong photo.
    upsert: false,
  });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Deletes an image that was uploaded but never saved onto a product.
 *
 * Images that *did* reach a product row are not deleted from here — the
 * trigger in migration 011 queues them and the sweeper removes them, which
 * works even when this browser never gets the chance to ask. This function
 * covers the one gap that design cannot see: a file uploaded into a form that
 * was then cancelled, so no product ever referenced it.
 *
 * An external URL is not ours and is ignored rather than treated as an error.
 */
export async function deleteUncommittedImage(publicUrl: string): Promise<void> {
  const path = storagePathFromPublicUrl(publicUrl);
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
