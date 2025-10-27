
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";
import type { Season, Episode } from "@shared/schema";

interface EpisodeSelectorProps {
  seriesTitle: string;
  seasons: Season[];
  onPlay: (episodeId: string) => void;
  onClose: () => void;
}

export function EpisodeSelector({ seriesTitle, seasons, onPlay, onClose }: EpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]?.number || 1);

  const currentSeason = seasons.find(s => s.number === selectedSeason);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-background rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{seriesTitle}</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {seasons.length > 1 && (
          <div className="p-6 border-b border-border">
            <div className="flex gap-2 flex-wrap">
              {seasons.map((season) => (
                <Button
                  key={season.number}
                  variant={selectedSeason === season.number ? "default" : "outline"}
                  onClick={() => setSelectedSeason(season.number)}
                  className="min-w-[100px]"
                >
                  Season {season.number}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          <div className="space-y-3">
            {currentSeason?.episodes.map((episode) => (
              <div
                key={episode.id}
                className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{episode.episodeNumber}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    Episode {episode.episodeNumber}: {episode.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Season {episode.seasonNumber}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => onPlay(episode.id)}
                  className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Play
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
