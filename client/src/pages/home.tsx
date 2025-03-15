import { VideoFeed } from "@/components/video-feed";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { uploadVideo } from "@/lib/atproto";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Home() {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!videoFile) return;

    setIsUploading(true);
    try {
      await uploadVideo(videoFile, caption);
      await queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      setDialogOpen(false);
      setVideoFile(null);
      setCaption("");
      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload video",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast({
      title: "Success",
      description: "Successfully logged out",
    });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && (
        <div className="fixed top-4 right-4 z-50">
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      )}
      {isAuthenticated && (
        <div className="fixed bottom-4 right-4 z-50">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full h-14 w-14">
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div className="space-y-4 p-4">
              <h2 className="text-xl font-bold">Upload Video</h2>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
              <Input
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
              <Button
                onClick={handleUpload}
                disabled={!videoFile || isUploading}
                className="w-full"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      )}
      <VideoFeed onAuthChange={setIsAuthenticated} />
    </div>
  );
}
