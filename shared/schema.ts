import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { type InferModel } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  did: text("did").notNull().unique(),
  accessJwt: text("access_jwt").notNull(),
  refreshJwt: text("refresh_jwt").notNull(),
  handle: text("handle").notNull(),
  avatar: text("avatar"),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  uri: text("uri").notNull(),
  cid: text("cid").notNull(),
  caption: text("caption"),
  thumbnail: text("thumbnail"),
  content: text("content"), // Store as base64 encoded text
  mimeType: text("mime_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create schemas for insertion
export const insertUserSchema = z.object({
  username: z.string(),
  did: z.string(),
  accessJwt: z.string(),
  refreshJwt: z.string(),
  handle: z.string(),
  avatar: z.string().optional(),
});

export const insertVideoSchema = z.object({
  userId: z.number().optional(),
  uri: z.string(),
  cid: z.string(),
  caption: z.string().optional(),
  thumbnail: z.string().optional(),
  content: z.string().optional(),
  mimeType: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type User = InferModel<typeof users>;
export type Video = InferModel<typeof videos>;