import { BskyAgent } from "@atproto/api";

export const agent = new BskyAgent({
  service: "https://bsky.social"
});

export async function loginWithBsky(identifier: string, password: string) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ identifier, password })
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

// Sample video URLs for testing
const SAMPLE_VIDEOS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
];

export async function uploadVideo(file: File, caption: string) {
  try {
    // For demonstration, using sample videos
    // In production, you would upload to a video hosting service
    const videoUrl = SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];

    const response = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({
        uri: videoUrl,
        cid: `demo-${Date.now()}`,
        caption,
        thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868"
      })
    });

    if (!response.ok) {
      throw new Error("Failed to upload video");
    }

    return await response.json();
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}