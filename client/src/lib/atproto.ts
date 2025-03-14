import { Agent } from "@atproto/api";

export const agent = new Agent({
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
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('video', file);
    formData.append('caption', caption);
    formData.append('cid', `video-${Date.now()}`);
    formData.append('mimeType', file.type);

    const response = await fetch("/api/videos", {
      method: "POST",
      credentials: 'include',
      body: formData
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