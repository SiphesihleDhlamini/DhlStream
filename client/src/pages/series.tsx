import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import { ContentCard } from "@/components/content-card";
import { VideoPlayer } from "@/components/video-player";
import { EpisodeSelector } from "@/components/episode-selector";
import { SearchBar } from "@/components/search-bar";
import { FilterDropdown } from "@/components/filter-dropdown";
import type { ContentItem, Series } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function SeriesPage() {
  const [, setLocation] = useLocation();
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string; id: string } | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");

  const { data: series, isLoading } = useQuery<ContentItem[]>({
    queryKey: ["/api/content/series"],
  });

  const { data: seriesDetails } = useQuery<Series[]>({
    queryKey: ["/api/content/series-details"],
  });

  const filteredSeries = useMemo(() => {
    if (!series) return [];
    
    let filtered = series.filter(show =>
      show.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "recent") {
      filtered.reverse();
    }

    return filtered;
  }, [series, searchQuery, sortBy]);

  const handlePlay = (id: string) => {
    const seriesDetail = seriesDetails?.find(s => s.id === id);
    if (seriesDetail) {
      setSelectedSeries(seriesDetail);
    }
  };

  const handleEpisodePlay = (episodeId: string) => {
    const seriesDetail = seriesDetails?.find(s => 
      s.seasons.some(season => 
        season.episodes.some(ep => ep.id === episodeId)
      )
    );
    
    const episode = seriesDetail?.seasons
      .flatMap(s => s.episodes)
      .find(ep => ep.id === episodeId);
    
    if (episode) {
      setSelectedVideo({
        url: `/api/stream/${episodeId}`,
        title: `${episode.seriesTitle} - S${episode.seasonNumber}E${episode.episodeNumber}: ${episode.title}`,
        id: episodeId
      });
      setSelectedSeries(null);
    }
  };

  const handleInfo = (id: string) => {
    setLocation(`/content/${id}`);
  };

  const handleProgress = (contentId: string, currentTime: number, duration: number) => {
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentId,
        currentTime,
        duration,
        contentType: "episode"
      })
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-12 px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-6">TV Shows</h1>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <SearchBar onSearch={setSearchQuery} placeholder="Search TV shows..." />
            <FilterDropdown
              value={sortBy}
              onValueChange={setSortBy}
              options={[
                { value: "title", label: "Title (A-Z)" },
                { value: "recent", label: "Recently Added" },
              ]}
              label="Sort By"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[2/3] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredSeries && filteredSeries.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredSeries.map((show) => (
              <ContentCard
                key={show.id}
                content={show}
                onPlay={handlePlay}
                onInfo={handleInfo}
              />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">No TV Shows Found</h2>
            <p className="text-muted-foreground">
              No TV shows match your search "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="text-center py-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">No TV Shows Found</h2>
            <p className="text-muted-foreground">
              Add series folders to /Downloads/DhlStream/Series to see them here
            </p>
          </div>
        )}
      </div>

      {selectedSeries && (
        <EpisodeSelector
          seriesTitle={selectedSeries.title}
          seasons={selectedSeries.seasons}
          onPlay={handleEpisodePlay}
          onClose={() => setSelectedSeries(null)}
        />
      )}

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
