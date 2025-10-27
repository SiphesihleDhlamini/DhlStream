import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { ContentRow } from "@/components/content-row";
import { VideoPlayer } from "@/components/video-player";
import type { ContentItem, WatchProgress } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string; id: string } | null>(null);

  const { data: movies, isLoading: moviesLoading } = useQuery<ContentItem[]>({
    queryKey: ["/api/content/movies"],
  });

  const { data: series, isLoading: seriesLoading } = useQuery<ContentItem[]>({
    queryKey: ["/api/content/series"],
  });

  const { data: continueWatching, isLoading: continueLoading } = useQuery<ContentItem[]>({
    queryKey: ["/api/content/continue-watching"],
  });

  const allContent = [...(movies || []), ...(series || [])];
  const featuredContent = allContent[0];

  const handlePlay = (id: string) => {
    const content = allContent.find(c => c.id === id);
    if (content) {
      setSelectedVideo({
        url: `/api/stream/${id}`,
        title: content.title,
        id: content.id
      });
    }
  };

  const handleInfo = (id: string) => {
    setLocation(`/content/${id}`);
  };

  const handleProgress = (contentId: string, currentTime: number, duration: number) => {
    // This will be handled by the backend
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentId,
        currentTime,
        duration,
        contentType: "movie"
      })
    });
  };

  const isLoading = moviesLoading || seriesLoading || continueLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16">
        {isLoading ? (
          <div className="min-h-[85vh] flex items-end pb-24 px-6">
            <div className="max-w-2xl space-y-6">
              <Skeleton className="h-20 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-2/3" />
              <div className="flex gap-4">
                <Skeleton className="h-14 w-32" />
                <Skeleton className="h-14 w-32" />
              </div>
            </div>
          </div>
        ) : featuredContent ? (
          <HeroSection
            content={featuredContent}
            onPlay={() => handlePlay(featuredContent.id)}
          />
        ) : (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">No Content Found</h2>
              <p className="text-muted-foreground">
                Add movies and series to your library to get started
              </p>
            </div>
          </div>
        )}

        <div className="pb-12">
          {continueWatching && continueWatching.length > 0 && (
            <ContentRow
              title="Continue Watching"
              items={continueWatching}
              onPlay={handlePlay}
              onInfo={handleInfo}
            />
          )}

          {movies && movies.length > 0 && (
            <ContentRow
              title="Movies"
              items={movies}
              onPlay={handlePlay}
              onInfo={handleInfo}
            />
          )}

          {series && series.length > 0 && (
            <ContentRow
              title="TV Shows"
              items={series}
              onPlay={handlePlay}
              onInfo={handleInfo}
            />
          )}

          {!isLoading && (!movies || movies.length === 0) && (!series || series.length === 0) && (
            <div className="text-center py-24 px-6">
              <p className="text-muted-foreground text-lg">
                Your library is empty. Content will appear here once added to the directories.
              </p>
            </div>
          )}
        </div>
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
