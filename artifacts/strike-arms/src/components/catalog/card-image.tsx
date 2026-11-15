import type { ImgHTMLAttributes, SyntheticEvent } from 'react';

import { cardImageSrcSet } from '@/lib/card-image-srcset';

const PLACEHOLDER_IMAGE = '/images/placeholder-product.webp';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> & { src: string };

/**
 * A product photo at card size: offers the 800px card copy through srcset and
 * keeps the full photo as `src`. Older uploads have no card copy, so a failed
 * load drops the srcset and the browser falls back to the full photo.
 */
export function CardImage({ src, onError, ...rest }: Props) {
  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (img.hasAttribute('srcset')) {
      img.removeAttribute('srcset');
    } else if (img.dataset.fallback !== 'true') {
      // The full photo is missing too: show the placeholder, once, so a
      // missing placeholder cannot loop.
      img.dataset.fallback = 'true';
      img.src = PLACEHOLDER_IMAGE;
    }
    onError?.(event);
  };
  return <img src={src} srcSet={cardImageSrcSet(src)} onError={handleError} {...rest} />;
}
