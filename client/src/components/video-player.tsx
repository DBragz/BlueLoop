import { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface VideoPlayerProps {
  src: string;
  thumbnail: string;
  isVisible: boolean;
}

export function VideoPlayer({ src, thumbnail, isVisible }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isVisible) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVisible]);

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
      />
    </Card>
  );
}
