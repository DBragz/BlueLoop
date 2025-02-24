import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { BskyAgent } from "@atproto/api";
import { insertUserSchema, insertVideoSchema } from "@shared/schema";

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
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.post("/api/videos", async (req, res) => {
    try {
      const videoData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(videoData);
      res.json({ video });
    } catch (error) {
      res.status(400).json({ message: "Invalid video data" });
    }
  });

  return httpServer;
}
