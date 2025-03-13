import { useInfiniteQuery } from "@tanstack/react-query";
import { VideoPlayer } from "./video-player";
import { PostActions } from "./post-actions";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import type { Video } from "@shared/schema";

interface VideoResponse {
  videos: Video[];
}

export function VideoFeed() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const { ref, inView, entry } = useInView({
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
      const res = await fetch(`/api/videos?offset=${pageParam}&limit=5`, {
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error("Failed to fetch videos");
      }
      return res.json();
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage?.videos?.length) return undefined;
      return lastPage.videos.length === 5 ? pages.length * 5 : undefined;
    },
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetching, fetchNextPage]);

  // Handle intersection to update current video
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setCurrentVideoIndex(index);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const videos = document.querySelectorAll('.video-container');
    videos.forEach((video) => observer.observe(video));

    return () => {
      videos.forEach((video) => observer.unobserve(video));
    };
  }, [data]);

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-destructive">Error loading videos: {error.message}</p>
      </div>
    );
  }

  const allVideos = data?.pages.flatMap(page => page.videos) ?? [];

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
            <PostActions video={video} />
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