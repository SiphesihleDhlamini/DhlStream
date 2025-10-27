import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import { ContentCard } from "@/components/content-card";
import { VideoPlayer } from "@/components/video-player";
import { SearchBar } from "@/components/search-bar";
import { FilterDropdown } from "@/components/filter-dropdown";
import type { ContentItem } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function MoviesPage() {
  const [, setLocation] = useLocation();
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string; id: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");

  const { data: movies, isLoading } = useQuery<ContentItem[]>({
    queryKey: ["/api/content/movies"],
  });

  const filteredMovies = useMemo(() => {
    if (!movies) return [];
    
    let filtered = movies.filter(movie =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "recent") {
      filtered.reverse();
    }

    return filtered;
  }, [movies, searchQuery, sortBy]);

  const handlePlay = (id: string) => {
    const content = filteredMovies?.find(c => c.id === id);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-12 px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-6">Movies</h1>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <SearchBar onSearch={setSearchQuery} placeholder="Search movies..." />
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
        ) : filteredMovies && filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredMovies.map((movie) => (
              <ContentCard
                key={movie.id}
                content={movie}
                onPlay={handlePlay}
                onInfo={handleInfo}
              />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">No Movies Found</h2>
            <p className="text-muted-foreground">
              No movies match your search "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="text-center py-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">No Movies Found</h2>
            <p className="text-muted-foreground">
              Add movie files to /Downloads/DhlStream/Movies to see them here
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
