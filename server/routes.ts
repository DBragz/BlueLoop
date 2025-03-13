import type { Express, Request } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { BskyAgent } from "@atproto/api";
import { insertUserSchema } from "@shared/schema";
import multer from 'multer';

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
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
      const agent = new BskyAgent({ service: "https://bsky.social" });
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
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
      const videos = await storage.getVideos(offset, limit);
      res.json({ videos });
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get("/api/videos/:id/content", async (req, res) => {
    try {
      const video = await storage.getVideo(parseInt(req.params.id));
      if (!video || !video.content) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Convert base64 back to binary
      const videoBuffer = Buffer.from(video.content, 'base64');
      res.setHeader('Content-Type', video.mimeType || 'video/mp4');
      res.send(videoBuffer);
    } catch (error) {
      console.error("Error streaming video:", error);
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

      const videoData = {
        uri: `/api/videos/${Date.now()}/content`, // Will be replaced with actual ID
        cid: req.body.cid,
        caption: req.body.caption,
        content: req.file.buffer.toString('base64'), // Convert to base64
        mimeType: req.file.mimetype,
        thumbnail: null
      };

      const video = await storage.createVideo(videoData);

      // Update the URI with the actual video ID
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