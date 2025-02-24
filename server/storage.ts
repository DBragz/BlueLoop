import { users, videos, type User, type InsertUser, type Video, type InsertVideo } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByDid(did: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTokens(id: number, accessJwt: string, refreshJwt: string): Promise<void>;
  getVideos(offset: number, limit: number): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videos: Map<number, Video>;
  private currentUserId: number;
  private currentVideoId: number;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.currentUserId = 1;
    this.currentVideoId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByDid(did: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.did === did);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      id, 
      ...insertUser,
      avatar: insertUser.avatar ?? null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserTokens(id: number, accessJwt: string, refreshJwt: string): Promise<void> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, accessJwt, refreshJwt };
    this.users.set(id, updatedUser);
  }

  async getVideos(offset: number, limit: number): Promise<Video[]> {
    return Array.from(this.videos.values())
      .sort((a, b) => b.id - a.id)
      .slice(offset, offset + limit);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.currentVideoId++;
    const video: Video = {
      id,
      caption: insertVideo.caption ?? null,
      userId: insertVideo.userId ?? null,
      uri: insertVideo.uri,
      cid: insertVideo.cid,
      thumbnail: insertVideo.thumbnail ?? null,
      createdAt: new Date()
    };
    this.videos.set(id, video);
    return video;
  }
}

export const storage = new MemStorage();