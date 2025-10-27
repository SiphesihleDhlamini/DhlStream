
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Play, Plus, Check } from "lucide-react";
import { useState } from "react";
import { VideoPlayer } from "@/components/video-player";
import type { ContentItem } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContentDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const contentId = params.id;
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string; id: string } | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);

  const { data: movies } = useQuery<ContentItem[]>({
    queryKey: ["/api/content/movies"],
  });

  const { data: series } = useQuery<ContentItem[]>({
    queryKey: ["/api/content/series"],
  });

  const allContent = [...(movies || []), ...(series || [])];
  const content = allContent.find(c => c.id === contentId);

  const handlePlay = () => {
    if (content) {
      setSelectedVideo({
        url: `/api/stream/${content.id}`,
        title: content.title,
        id: content.id
      });
    }
  };

  const handleWatchlist = async () => {
    if (!content) return;

    if (inWatchlist) {
      await fetch(`/api/watchlist/${content.id}`, { method: "DELETE" });
      setInWatchlist(false);
    } else {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: content.id,
          contentType: content.type
        })
      });
      setInWatchlist(true);
    }
  };

  const handleProgress = (contentId: string, currentTime: number, duration: number) => {
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentId,
        currentTime,
        duration,
        contentType: content?.type === "series" ? "episode" : "movie"
      })
    });
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 px-6 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Content Not Found</h1>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20">
        <div className="relative h-[70vh] bg-gradient-to-b from-background/20 to-background">
          {content.thumbnail ? (
            <img
              src={content.thumbnail}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-accent">
              <span className="text-9xl font-bold text-muted-foreground/20">
                {content.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-12">
            <h1 className="text-5xl font-bold text-foreground mb-4">{content.title}</h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-md text-sm font-medium capitalize">
                {content.type}
              </span>
              {content.progress && content.progress.currentTime > 0 && (
                <span className="text-sm text-muted-foreground">
                  {Math.round((content.progress.currentTime / content.progress.duration) * 100)}% watched
                </span>
              )}
            </div>

            <div className="flex gap-4">
              <Button size="lg" onClick={handlePlay} className="gap-2">
                <Play className="w-5 h-5 fill-current" />
                {content.progress && content.progress.currentTime > 0 ? "Continue Watching" : "Play"}
              </Button>
              <Button size="lg" variant="secondary" onClick={handleWatchlist} className="gap-2">
                {inWatchlist ? (
                  <>
                    <Check className="w-5 h-5" />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add to Watchlist
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {content.progress && (
          <div className="px-12 py-8">
            <div className="w-full bg-muted/50 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(content.progress.currentTime / content.progress.duration) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {selectedVideo && (
        <VideoPlayer
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
          onProgress={(currentTime, duration) => handleProgress(selectedVideo.id, currentTime, duration)}
        />
      )}
    </div>
  );
}
