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
          setError("Failed to play video. Please try again.");
        });
      }
    };

    const handleLoadedData = () => {
      console.log("Video data loaded:", src);
      setIsLoading(false);
    };

    const handleError = (e: Event) => {
      const videoError = (e.target as HTMLVideoElement).error;
      console.error("Video error:", videoError?.message, "Code:", videoError?.code, "Source:", src);

      let errorMessage = "Error loading video";
      if (videoError) {
        switch (videoError.code) {
          case 1: //MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Video loading was aborted";
            break;
          case 2: //MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Network error occurred while loading video";
            break;
          case 3: //MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Video decoding failed";
            break;
          case 4: //MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Video format not supported";
            break;
        }
      }
      setError(errorMessage);
      setIsLoading(false);
    };

    // Reset states when src changes
    setError(null);
    setIsLoading(true);

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
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
      video.removeEventListener("error", handleError);
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
        crossOrigin="anonymous"
        className="h-full w-full object-cover"
      />
    </Card>
  );
}