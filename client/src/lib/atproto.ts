import { BskyAgent } from "@atproto/api";

export const agent = new BskyAgent({
  service: "https://bsky.social"
});

export async function loginWithBsky(identifier: string, password: string) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password })
    });
    
    if (!response.ok) {
      throw new Error("Login failed");
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function uploadVideo(file: File, caption: string) {
  // This is a simplified version - in reality would need to handle
  // actual file upload to AT Protocol and blob storage
  const fakeUpload = {
    uri: `at://fake/${Math.random()}`,
    cid: `fake-cid-${Math.random()}`,
  };
  
  return await fetch("/api/videos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uri: fakeUpload.uri,
      cid: fakeUpload.cid,
      caption,
      thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868"
    })
  });
}
