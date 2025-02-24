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
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  const { 
    data,
    fetchNextPage,
    hasNextPage,
    isFetching
  } = useInfiniteQuery<VideoResponse>({
    queryKey: ["/api/videos"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const res = await fetch(`/api/videos?offset=${pageParam}&limit=5`);
      return res.json();
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage) return undefined;
      return lastPage.videos.length === 5 ? pages.length * 5 : undefined;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage]);

  const allVideos = data?.pages.flatMap(page => page.videos) ?? [];

  return (
    <div className="snap-y snap-mandatory h-screen overflow-y-scroll">
      {allVideos.map((video: Video, index: number) => (
        <div
          key={video.id}
          ref={index === allVideos.length - 1 ? ref : undefined}
          className="snap-start h-screen w-full flex items-center justify-center relative"
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
    </div>
  );
}