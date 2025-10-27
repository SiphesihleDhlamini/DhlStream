
import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { SearchBar } from "@/components/search-bar";
import { ContentCard } from "@/components/content-card";
import { VideoPlayer } from "@/components/video-player";
import type { ContentItem } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  const searchParams = useSearch();
  const [, setLocation] = useLocation();
  const query = new URLSearchParams(searchParams).get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string; id: string } | null>(null);

  const { data: results, isLoading } = useQuery<ContentItem[]>({
    queryKey: ["/api/content/search", { q: searchQuery }],
    enabled: searchQuery.length > 0,
  });

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  const handleSearch = (newQuery: string) => {
    setSearchQuery(newQuery);
    setLocation(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  const handlePlay = (id: string) => {
    const content = results?.find(c => c.id === id);
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
    const content = results?.find(c => c.id === contentId);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-12 px-6">
        <div className="mb-8 flex justify-center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search movies and TV shows..."
          />
        </div>

        {searchQuery && (
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Search Results for "{searchQuery}"
          </h1>
        )}

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
        ) : results && results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {results.map((item) => (
              <ContentCard
                key={item.id}
                content={item}
                onPlay={handlePlay}
                onInfo={handleInfo}
              />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">No Results Found</h2>
            <p className="text-muted-foreground">
              Try searching with different keywords
            </p>
          </div>
        ) : (
          <div className="text-center py-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Start Searching</h2>
            <p className="text-muted-foreground">
              Enter a search term to find movies and TV shows
            </p>
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
