import { VideoPlayer } from "./video-player";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { loginWithBsky } from "@/lib/atproto";
import type { Video } from "@shared/schema";

interface VideoResponse {
  videos: Video[];
}

interface VideoFeedProps {
  onAuthChange?: (isAuthenticated: boolean) => void;
}

export function VideoFeed({ onAuthChange }: VideoFeedProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.5,
  });
  const { toast } = useToast();

  const handleLogout = () => {
    setIsAuthenticated(false);
    onAuthChange?.(false);
    toast({
      title: "Success",
      description: "Successfully logged out",
    });
  };

  const { data, fetchNextPage, hasNextPage, isFetching, isError, error } =
    useInfiniteQuery<VideoResponse>({
      queryKey: ["/api/videos"],
      enabled: isAuthenticated,
      initialPageParam: 0,
      queryFn: async ({ pageParam }) => {
        console.log("Fetching videos with offset:", pageParam);
        const res = await fetch(`/api/videos?offset=${pageParam}&limit=5`, {
          credentials: "include",
        });
        if (res.status === 401) {
          setIsAuthenticated(false);
          onAuthChange?.(false);
          throw new Error("Please login to view videos");
        } else {
          setIsAuthenticated(true);
          onAuthChange?.(true);
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
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) {
              setCurrentVideoIndex(index);
              console.log("Video in view:", index);
            }
          }
        });
      },
      { threshold: 0.7 },
    );

    const videos = document.querySelectorAll(".video-container");
    videos.forEach((video) => observer.observe(video));

    return () => {
      videos.forEach((video) => observer.unobserve(video));
    };
  }, [data?.pages]);

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast: showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginWithBsky(identifier, password);
      setIsAuthenticated(true);
      setShowLoginDialog(false);
      showToast({
        title: "Success",
        description: "Successfully logged in",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to login",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
          <Button onClick={() => setShowLoginDialog(true)}>Login</Button>
        </div>

        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign in with Bluesky</DialogTitle>
              <DialogDescription>
                Enter your Bluesky credentials to continue
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="handle.bsky.social"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-destructive">
          Error loading videos: {error.message}
        </p>
      </div>
    );
  }

  const allVideos = data?.pages.flatMap((page) => page.videos) ?? [];

  if (allVideos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">No videos available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={handleLogout} size="icon" className="rounded-full h-14 w-14">
          Logout
        </Button>
      </div>
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
              thumbnail={
                video.thumbnail ||
                "https://images.unsplash.com/photo-1611162616475-46b635cb6868"
              }
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
    </div>
  );
}
