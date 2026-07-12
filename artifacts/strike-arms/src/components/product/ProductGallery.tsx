import { useState } from 'react';

interface Props {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const displayImages = images.length > 0 ? images : ['/images/category-rifles.png'];
  const active = displayImages[activeIdx] ?? displayImages[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border/40">
        <img src={active} alt={name} className="w-full h-full object-cover" />
      </div>

      {displayImages.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {displayImages.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActiveIdx(i)}
              className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                i === activeIdx ? 'border-accent' : 'border-border hover:border-border/80'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
