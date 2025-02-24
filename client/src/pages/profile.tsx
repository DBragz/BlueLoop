import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid3X3, Settings } from "lucide-react";
import type { Video } from "@shared/schema";

const STOCK_THUMBNAILS = [
  "https://images.unsplash.com/photo-1611162616475-46b635cb6868",
  "https://images.unsplash.com/photo-1603566234384-f5f5b59168cc",
  "https://images.unsplash.com/photo-1667302146840-e314e50a47d2",
  "https://images.unsplash.com/photo-1676373740452-7779b00f1dd2",
  "https://images.unsplash.com/photo-1521302200778-33500795e128",
  "https://images.unsplash.com/photo-1676594904038-94b67e213297"
];

function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {videos.map((video, index) => (
        <div
          key={video.id}
          className="aspect-[9/16] relative overflow-hidden rounded-md"
        >
          <img
            src={video.thumbnail || STOCK_THUMBNAILS[index % STOCK_THUMBNAILS.length]}
            alt={video.caption || "Video thumbnail"}
            className="object-cover w-full h-full"
          />
        </div>
      ))}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

export default function Profile() {
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    }
  });

  const { data: videosData, isLoading: isVideosLoading } = useQuery({
    queryKey: ["/api/videos/user"],
    queryFn: async () => {
      const res = await fetch("/api/videos/user");
      if (!res.ok) throw new Error("Failed to fetch videos");
      return res.json();
    }
  });

  if (isUserLoading || isVideosLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Card className="rounded-none border-x-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80" 
                  alt={userData?.handle} 
                />
                <AvatarFallback>
                  {userData?.handle?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{userData?.handle}</h1>
                <p className="text-muted-foreground">@{userData?.username}</p>
              </div>
            </div>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-between mb-6 text-center">
            <div>
              <p className="font-bold">123</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
            <div>
              <p className="font-bold">10.5K</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="font-bold">52.1K</p>
              <p className="text-sm text-muted-foreground">Likes</p>
            </div>
          </div>

          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="videos" className="flex-1">
                <Grid3X3 className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
            </TabsList>
            <TabsContent value="videos" className="mt-4">
              <VideoGrid videos={videosData?.videos || []} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
