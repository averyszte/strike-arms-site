import { useState, type CSSProperties, type PointerEvent } from 'react';

/** How far the product photo magnifies. */
const ZOOM_SCALE = 2.5;

interface ImageZoom {
  isZoomed: boolean;
  imageStyle: CSSProperties;
  handlers: {
    onPointerEnter: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerLeave: (event: PointerEvent<HTMLElement>) => void;
    onClick: () => void;
  };
}

/** The pointer's position inside the element, as percentages. */
function pointerOrigin(event: PointerEvent<HTMLElement>): string {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  return `${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`;
}

/**
 * Magnifies a photo under the pointer. With a mouse it zooms while hovering
 * and follows the cursor. On touch a tap zooms in, dragging moves round the
 * photo, and another tap zooms out; the page does not scroll while zoomed.
 */
export function useImageZoom(): ImageZoom {
  const [isZoomed, setIsZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');

  const isMouse = (event: PointerEvent<HTMLElement>) => event.pointerType === 'mouse';

  return {
    isZoomed,
    imageStyle: {
      transform: isZoomed ? `scale(${ZOOM_SCALE})` : 'none',
      transformOrigin: origin,
      transition: 'transform 0.2s ease-out',
    },
    handlers: {
      onPointerEnter: (event) => {
        if (!isMouse(event)) return;
        setOrigin(pointerOrigin(event));
        setIsZoomed(true);
      },
      onPointerMove: (event) => {
        if (isMouse(event) || isZoomed) setOrigin(pointerOrigin(event));
      },
      onPointerLeave: (event) => {
        if (isMouse(event)) setIsZoomed(false);
      },
      // Touch only: a mouse is already zoomed while it hovers.
      onClick: () => {
        if (window.matchMedia('(hover: hover)').matches) return;
        setIsZoomed((zoomed) => !zoomed);
      },
    },
  };
}
