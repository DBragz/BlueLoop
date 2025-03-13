import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  thumbnail: string;
  isVisible: boolean;
}

export function VideoPlayer({ src, thumbnail, isVisible }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const handleCanPlay = () => {
      console.log("Video can play:", src);
      setIsLoading(false);
      if (isVisible) {
        video.play().catch((err) => {
          console.error("Video playback error:", err);
          setError("Failed to play video");
        });
      }
    };

    const handleLoadedData = () => {
      console.log("Video data loaded:", src);
      setIsLoading(false);
    };

    // Reset states when src changes
    setError(null);
    setIsLoading(true);

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", () => {
      console.error("Video error for source:", src);
      setError("Error loading video");
      setIsLoading(false);
    });
    video.addEventListener("loadeddata", handleLoadedData);

    // Load or pause video based on visibility
    if (isVisible) {
      video.load();
      video.play().catch((err) => {
        console.error("Initial playback error:", err);
        // Some browsers require user interaction, so we'll just log this
        // and let the canplay handler try again
      });
    } else {
      video.pause();
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", () => {
      console.error("Video error for source:", src);
      setError("Error loading video");
      setIsLoading(false);
    });
      video.removeEventListener("loadeddata", handleLoadedData);
      video.pause();
    };
  }, [isVisible, src]);

  if (error) {
    return (
      <Card className="relative aspect-[9/16] w-full overflow-hidden bg-muted flex items-center justify-center">
        <p className="text-destructive text-center px-4">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="relative aspect-[9/16] w-full overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        poster={thumbnail}
        loop
        muted
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
      />
    </Card>
  );
}