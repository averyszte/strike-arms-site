import { useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ImagePlus, Loader2, Star, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { ProductImageUpload } from '@/hooks/use-product-image-upload';
import type { ProductFormValues } from '@/lib/product-form-schema';

const ACCEPT = 'image/jpeg,image/png,image/webp';

interface Props {
  upload: ProductImageUpload;
}

interface ThumbnailProps {
  url: string;
  isMain: boolean;
  onRemove: () => void;
  onMakeMain: () => void;
}

function Thumbnail({ url, isMain, onRemove, onMakeMain }: ThumbnailProps) {
  return (
    <li className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted">
      <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />

      {isMain ? (
        <span className="absolute left-1 top-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium">
          Main
        </span>
      ) : (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute left-1 top-1 h-6 w-6"
          onClick={onMakeMain}
          title="Use as the main image"
        >
          <Star className="h-3 w-3" />
          <span className="sr-only">Use as the main image</span>
        </Button>
      )}

      <Button
        type="button"
        size="icon"
        variant="destructive"
        className="absolute right-1 top-1 h-6 w-6"
        onClick={onRemove}
        title="Remove image"
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Remove image</span>
      </Button>
    </li>
  );
}

export function ProductImagesField({ upload }: Props) {
  const { control, setValue } = useFormContext<ProductFormValues>();
  const images = useWatch({ control, name: 'images' }) ?? [];
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  function setImages(next: string[]) {
    setValue('images', next, { shouldDirty: true });
  }

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    // Cleared straight away so picking the same file twice in a row still
    // fires a change event.
    event.target.value = '';
    if (files.length === 0) return;

    const { urls, errors } = await upload.upload(files);
    if (urls.length > 0) setImages([...images, ...urls]);
    errors.forEach(message =>
      toast({ title: 'Upload failed', description: message, variant: 'destructive' }),
    );
  }

  function handleRemove(url: string) {
    setImages(images.filter(image => image !== url));
    upload.discard(url);
  }

  return (
    <div className="space-y-2">
      <Label>Images</Label>

      {images.length > 0 && (
        <ul className="grid grid-cols-4 gap-2">
          {images.map((url, index) => (
            <Thumbnail
              key={url}
              url={url}
              isMain={index === 0}
              onRemove={() => handleRemove(url)}
              onMakeMain={() => setImages([url, ...images.filter(image => image !== url)])}
            />
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={upload.isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {upload.isUploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ImagePlus className="mr-2 h-4 w-4" />
        )}
        {upload.isUploading ? 'Uploading…' : 'Add images'}
      </Button>

      <p className="text-xs text-muted-foreground">
        JPEG, PNG or WebP. Photos are resized and compressed in the browser before
        upload, so a phone photo is fine. The first image is the one shown on the
        product card.
      </p>
    </div>
  );
}
