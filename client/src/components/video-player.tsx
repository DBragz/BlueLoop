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
    };

    const handleLoadedData = () => {
      console.log("Video data loaded:", src);
      setIsLoading(false);
      if (isVisible) {
        video.play().catch(err => {
          console.error("Initial play failed:", err);
        });
      }
    };

    const handleError = (e: Event) => {
      const videoError = (e.target as HTMLVideoElement).error;
      console.error("Video error:", videoError?.message, "Code:", videoError?.code, "Source:", src);
      setError(`Failed to load video: ${videoError?.message}`);
      setIsLoading(false);
    };

    // Reset states
    setError(null);
    setIsLoading(true);

    // Add event listeners
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);

    // Load initial video
    if (isVisible) {
      console.log("Loading video:", src);
      video.load();
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
      video.pause();
    };
  }, [isVisible, src]);

  return (
    <Card className="relative aspect-[9/16] w-full overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <p className="text-destructive text-center px-4">{error}</p>
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        poster={thumbnail}
        controls
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
      />
    </Card>
  );
}