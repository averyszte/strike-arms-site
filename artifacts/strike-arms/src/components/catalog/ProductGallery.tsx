import { useState } from 'react';

import { CardImage } from '@/components/catalog/card-image';
import { ProductZoomImage } from '@/components/catalog/product-zoom-image';
import type { Product } from '@/types/product';

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const images = product.images.length > 0 ? product.images : ['/images/placeholder-product.webp'];

  return (
    // min-w-0: a long thumbnail row must not widen the page's grid column.
    <div className="min-w-0">
      <ProductZoomImage key={images[active]} src={images[active]} alt={product.name} />
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Image ${index + 1} of ${images.length}`}
              aria-current={index === active ? 'true' : undefined}
              className={`h-16 w-16 shrink-0 overflow-hidden border-2 bg-white transition-colors ${index === active ? 'border-accent' : 'border-border/60 hover:border-foreground'}`}
            >
              <CardImage
                src={image}
                alt=""
                sizes="64px"
                className="h-full w-full object-contain p-1"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
