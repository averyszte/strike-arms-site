import { useImageZoom } from '@/hooks/use-image-zoom';

/**
 * The main product photo, magnified under the pointer (hooks/use-image-zoom).
 * Give it a `key` of the image so switching photos starts zoomed out.
 */
export function ProductZoomImage({ src, alt }: { src: string; alt: string }) {
  const { isZoomed, imageStyle, handlers } = useImageZoom();

  return (
    <div
      className={`aspect-square overflow-hidden border border-border/60 bg-white ${isZoomed ? 'cursor-zoom-out touch-none' : 'cursor-zoom-in'}`}
      {...handlers}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain p-4 select-none"
        style={imageStyle}
        draggable={false}
        fetchPriority="high"
      />
    </div>
  );
}
