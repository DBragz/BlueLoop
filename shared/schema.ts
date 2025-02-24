import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true 
});

export const insertVideoSchema = createInsertSchema(videos).omit({ 
  id: true,
  createdAt: true 
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type User = typeof users.$inferSelect;
export type Video = typeof videos.$inferSelect;
