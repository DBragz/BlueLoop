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
    // Create a temporary URL for the uploaded file
    const fileUrl = URL.createObjectURL(file);

    const response = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({
        uri: fileUrl,
        cid: `video-${Date.now()}`,
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