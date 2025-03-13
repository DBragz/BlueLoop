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

export async function uploadVideo(file: File, caption: string) {
  try {
    // In a real implementation, we would upload to a video hosting service
    // For now, we'll just generate a temporary URL
    const response = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({
        uri: URL.createObjectURL(file),
        cid: `demo-${Date.now()}`,
        caption,
        thumbnail: null
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