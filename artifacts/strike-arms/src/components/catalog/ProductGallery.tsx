import { useState } from 'react';

import type { Product } from '@/types/product';

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const images = product.images.length > 0 ? product.images : ['/images/category-rifles.png'];

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-sm border border-border bg-muted">
        <img
          src={images[active]}
          alt={product.name}
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              className={`h-16 w-16 overflow-hidden rounded-sm border ${index === active ? 'border-foreground' : 'border-border'}`}
            >
              <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
