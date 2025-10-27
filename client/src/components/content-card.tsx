import { Play, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ContentItem } from "@shared/schema";

interface ContentCardProps {
  content: ContentItem;
  onPlay: (id: string) => void;
  onInfo?: (id: string) => void;
}

export function ContentCard({ content, onPlay, onInfo }: ContentCardProps) {
  const progress = content.progress ? (content.progress.currentTime / content.progress.duration) * 100 : 0;

  return (
    <div className="group relative flex-shrink-0 w-48 md:w-56 transition-transform hover:scale-105 duration-300">
      <Card className="overflow-hidden bg-card/50 border-card-border hover-elevate active-elevate-2">
        <div className="relative aspect-[2/3] bg-muted">
          {content.thumbnail ? (
            <img
              src={content.thumbnail}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-accent">
              <span className="text-6xl font-bold text-muted-foreground/20">
                {content.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2">
              <Button
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={() => onPlay(content.id)}
                data-testid={`button-play-${content.id}`}
              >
                <Play className="w-5 h-5 fill-current" />
              </Button>
              {onInfo && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full h-12 w-12"
                  onClick={() => onInfo(content.id)}
                  data-testid={`button-info-${content.id}`}
                >
                  <Info className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-medium text-card-foreground line-clamp-2 mb-1" data-testid={`text-title-${content.id}`}>
            {content.title}
          </h3>
          <p className="text-xs text-muted-foreground capitalize">{content.type}</p>
        </div>
      </Card>
    </div>
  );
}
