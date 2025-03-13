import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface VideoPlayerProps {
  src: string;
  thumbnail: string;
  isVisible: boolean;
}

export function VideoPlayer({ src, thumbnail, isVisible }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isVisible) {
        try {
          videoRef.current.play().catch((err) => {
            console.error("Video playback error:", err);
            setError("Failed to play video");
          });
        } catch (err) {
          console.error("Video error:", err);
          setError("Error loading video");
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVisible]);

  if (error) {
    return (
      <Card className="relative aspect-[9/16] w-full overflow-hidden bg-muted flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="relative aspect-[9/16] w-full overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        poster={thumbnail}
        loop
        muted
        playsInline
        className="h-full w-full object-cover"
        onError={(e) => {
          console.error("Video loading error:", e);
          setError("Failed to load video");
        }}
      />
    </Card>
  );
}