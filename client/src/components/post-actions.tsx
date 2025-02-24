import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Video } from "@shared/schema";

interface PostActionsProps {
  video: Video;
}

export function PostActions({ video }: PostActionsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-4">
      <div className="flex flex-col items-center gap-1">
        <Avatar className="h-12 w-12">
          <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80" />
          <AvatarFallback>User</AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <Button size="icon" variant="ghost" className="rounded-full bg-background/80">
          <Heart className="h-6 w-6" />
        </Button>
        <span className="text-sm">123</span>
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <Button size="icon" variant="ghost" className="rounded-full bg-background/80">
          <MessageCircle className="h-6 w-6" />
        </Button>
        <span className="text-sm">45</span>
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <Button size="icon" variant="ghost" className="rounded-full bg-background/80">
          <Share2 className="h-6 w-6" />
        </Button>
        <span className="text-sm">12</span>
      </div>
    </div>
  );
}
