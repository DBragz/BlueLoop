import { useInfiniteQuery } from "@tanstack/react-query";
import { VideoPlayer } from "./video-player";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import type { Video } from "@shared/schema";

interface VideoResponse {
  videos: Video[];
}

export function VideoFeed() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [, setLocation] = useLocation();
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  const { 
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isError,
    error
  } = useInfiniteQuery<VideoResponse>({
    queryKey: ["/api/videos"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      console.log("Fetching videos with offset:", pageParam);
      const res = await fetch(`/api/videos?offset=${pageParam}&limit=5`, {
        credentials: 'include'
      });
      if (res.status === 401) {
        setLocation('/auth');
        throw new Error("Please login to view videos");
      }
      if (!res.ok) {
        throw new Error("Failed to fetch videos");
      }
      const data = await res.json();
      console.log("Fetched videos:", data);
      return data;
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage?.videos?.length) return undefined;
      return lastPage.videos.length === 5 ? pages.length * 5 : undefined;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setCurrentVideoIndex(index);
              console.log("Video in view:", index);
            }
          }
        });
      },
      { threshold: 0.7 }
    );

    const videos = document.querySelectorAll('.video-container');
    videos.forEach((video) => observer.observe(video));

    return () => {
      videos.forEach((video) => observer.unobserve(video));
    };
  }, [data?.pages]);

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-destructive">Error loading videos: {error.message}</p>
      </div>
    );
  }

  const allVideos = data?.pages.flatMap(page => page.videos) ?? [];

  if (allVideos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">No videos available</p>
      </div>
    );
  }

  return (
    <div className="snap-y snap-mandatory h-screen overflow-y-scroll">
      {allVideos.map((video: Video, index: number) => (
        <div
          key={video.id}
          ref={index === allVideos.length - 1 ? ref : undefined}
          data-index={index}
          className="video-container snap-start h-screen w-full flex items-center justify-center relative"
        >
          <div className="w-full max-w-md mx-auto relative">
            <VideoPlayer
              src={video.uri}
              thumbnail={video.thumbnail || "https://images.unsplash.com/photo-1611162616475-46b635cb6868"}
              isVisible={currentVideoIndex === index}
            />
          </div>
        </div>
      ))}
      {isFetching && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}