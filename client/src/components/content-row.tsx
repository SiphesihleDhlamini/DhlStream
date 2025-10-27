import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ContentCard } from "./content-card";
import type { ContentItem } from "@shared/schema";

interface ContentRowProps {
  title: string;
  items: ContentItem[];
  onPlay: (id: string) => void;
  onInfo?: (id: string) => void;
}

export function ContentRow({ title, items, onPlay, onInfo }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-12 group/row" data-testid={`row-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <h2 className="text-2xl font-semibold text-foreground mb-4 px-6">{title}</h2>
      
      <div className="relative">
        <Button
          size="icon"
          variant="secondary"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity"
          onClick={() => scroll('left')}
          data-testid={`button-scroll-left-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-6 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <ContentCard
              key={item.id}
              content={item}
              onPlay={onPlay}
              onInfo={onInfo}
            />
          ))}
        </div>

        <Button
          size="icon"
          variant="secondary"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity"
          onClick={() => scroll('right')}
          data-testid={`button-scroll-right-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
