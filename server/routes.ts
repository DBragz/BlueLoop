import type { Express, Request } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { Agent } from "@atproto/api";
import { insertUserSchema } from "@shared/schema";
import multer from 'multer';

// Configure multer for memory storage with increased size limit
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Add type for multer request
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.post("/api/auth/login", async (req, res) => {
    const { identifier, password } = req.body;

    try {
      const agent = new Agent({ service: "https://bsky.social" });
      const response = await agent.login({ identifier, password });

      const { accessJwt, refreshJwt, did, handle } = response.data;

      const userData = {
        username: handle,
        did,
        accessJwt,
        refreshJwt,
        handle,
        avatar: response.data.handle
      };

      const validatedUser = insertUserSchema.parse(userData);
      const user = await storage.createUser(validatedUser);

      res.json({ user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({ message: "Authentication failed" });
    }
  });

  app.get("/api/videos", async (req, res) => {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 5;

      console.log(`Fetching videos with offset ${offset} and limit ${limit}`);
      const videos = await storage.getVideos(offset, limit);
      console.log(`Found ${videos.length} videos`);

      res.json({ videos });
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get("/api/videos/:id/content", async (req, res) => {
    const videoId = parseInt(req.params.id);
    console.log(`Attempting to stream video ID: ${videoId}`);

    try {
      const video = await storage.getVideo(videoId);

      if (!video) {
        console.error(`Video not found for ID: ${videoId}`);
        return res.status(404).json({ message: "Video not found" });
      }

      if (!video.content) {
        console.error(`No content found for video ID: ${videoId}`);
        return res.status(404).json({ message: "Video content not found" });
      }

      // Convert base64 to buffer
      const videoBuffer = Buffer.from(video.content, 'base64');
      console.log(`Video buffer created for ID ${videoId}, size: ${videoBuffer.length} bytes`);

      // Set proper content type and streaming headers
      res.setHeader('Content-Type', video.mimeType || 'video/mp4');
      res.setHeader('Content-Length', videoBuffer.length);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Stream the video
      res.write(videoBuffer);
      res.end();

      console.log(`Successfully streamed video ID: ${videoId}`);
    } catch (error) {
      console.error(`Error streaming video ${videoId}:`, error);
      res.status(500).json({ message: "Failed to stream video" });
    }
  });

  app.post("/api/videos", upload.single('video'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file uploaded" });
      }

      console.log("Received video upload:", {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      // Create video data
      const videoData = {
        uri: `/api/videos/${Date.now()}/content`,
        cid: req.body.cid || `video-${Date.now()}`,
        caption: req.body.caption || "Test video",
        content: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype || 'video/mp4',
        thumbnail: undefined
      };

      const video = await storage.createVideo(videoData);
      const updatedUri = `/api/videos/${video.id}/content`;
      await storage.updateVideoUri(video.id, updatedUri);

      console.log("Video successfully created:", { id: video.id, uri: updatedUri });
      res.json({ video: { ...video, uri: updatedUri } });
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(400).json({ message: "Invalid video data" });
    }
  });

  return httpServer;
}