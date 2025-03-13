import { users, videos, type User, type InsertUser, type Video, type InsertVideo } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByDid(did: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTokens(id: number, accessJwt: string, refreshJwt: string): Promise<void>;
  getVideos(offset: number, limit: number): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideoUri(id: number, uri: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByDid(did: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.did, did));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserTokens(id: number, accessJwt: string, refreshJwt: string): Promise<void> {
    await db
      .update(users)
      .set({ accessJwt, refreshJwt })
      .where(eq(users.id, id));
  }

  async getVideos(offset: number, limit: number): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, id));
    return video;
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db
      .insert(videos)
      .values({
        uri: video.uri,
        cid: video.cid,
        caption: video.caption,
        thumbnail: video.thumbnail,
        content: video.content,
        mimeType: video.mimeType
      })
      .returning();
    return newVideo;
  }

  async updateVideoUri(id: number, uri: string): Promise<void> {
    await db
      .update(videos)
      .set({ uri })
      .where(eq(videos.id, id));
  }
}

export const storage = new DatabaseStorage();