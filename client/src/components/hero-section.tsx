import { Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContentItem } from "@shared/schema";

interface HeroSectionProps {
  content: ContentItem;
  onPlay: () => void;
  onInfo?: () => void;
}

export function HeroSection({ content, onPlay, onInfo }: HeroSectionProps) {
  return (
    <div className="relative min-h-[85vh] flex items-end pb-24" data-testid="hero-section">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/50 to-transparent">
        {content.thumbnail ? (
          <img
            src={content.thumbnail}
            alt={content.title}
            className="w-full h-full object-cover opacity-40"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/10" />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight" data-testid="hero-title">
            {content.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-md font-medium capitalize">
              {content.type}
            </span>
          </div>

          <p className="text-lg text-foreground/90 leading-relaxed max-w-xl">
            Enjoy your personal streaming library with {content.title} and much more.
            Start watching now.
          </p>

          <div className="flex gap-4 pt-4">
            <Button
              size="lg"
              className="h-14 px-8 text-base"
              onClick={onPlay}
              data-testid="button-hero-play"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Play
            </Button>
            {onInfo && (
              <Button
                size="lg"
                variant="secondary"
                className="h-14 px-8 text-base bg-secondary/80 backdrop-blur-sm"
                onClick={onInfo}
                data-testid="button-hero-info"
              >
                <Info className="w-5 h-5 mr-2" />
                More Info
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
