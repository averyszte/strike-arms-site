import { Asterisk } from "lucide-react";

/**
 * Direction B — reusable scrolling marquee band. Uses the existing
 * `animate-marquee` keyframe. Pure presentation; text passed by the caller.
 */
interface DropMarqueeProps {
  items: string[];
  variant?: "light" | "dark";
}

export function DropMarquee({ items, variant = "dark" }: DropMarqueeProps) {
  const base =
    variant === "dark"
      ? "bg-[#0a0a0a] text-[#f5f1ea] border-y border-[#f5f1ea]/15"
      : "bg-[#ff5a1f] text-[#0a0a0a]";
  const loop = [...items, ...items];

  return (
    <div className={`overflow-hidden ${base}`}>
      <div className="flex whitespace-nowrap animate-marquee py-4">
        {loop.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="font-sans font-black uppercase text-2xl md:text-4xl tracking-tight px-6">
              {item}
            </span>
            <Asterisk className="w-6 h-6 md:w-8 md:h-8 text-[#ff5a1f] shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}
