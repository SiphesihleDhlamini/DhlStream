import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const watchProgress = pgTable("watch_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contentId: text("content_id").notNull(),
  contentType: text("content_type").notNull(), // 'movie' or 'episode'
  currentTime: real("current_time").notNull().default(0),
  duration: real("duration").notNull().default(0),
  lastWatched: timestamp("last_watched").defaultNow().notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const watchlist = pgTable("watchlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contentId: text("content_id").notNull(),
  contentType: text("content_type").notNull(), // 'movie' or 'series'
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWatchProgressSchema = createInsertSchema(watchProgress).omit({
  id: true,
  lastWatched: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlist).omit({
  id: true,
  addedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type WatchProgress = typeof watchProgress.$inferSelect;
export type InsertWatchProgress = z.infer<typeof insertWatchProgressSchema>;
export type Watchlist = typeof watchlist.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;

// Type definitions for content from local file system
export interface Movie {
  id: string;
  title: string;
  filename: string;
  path: string;
  type: 'movie';
  duration?: number;
  thumbnail?: string;
  subtitles?: string[];
}

export interface Series {
  id: string;
  title: string;
  path: string;
  type: 'series';
  thumbnail?: string;
  seasons: Season[];
}

export interface Season {
  number: number;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  title: string;
  filename: string;
  path: string;
  seriesTitle: string;
  seasonNumber: number;
  episodeNumber: number;
  duration?: number;
  thumbnail?: string;
  subtitles?: string[];
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'movie' | 'series';
  path: string;
  thumbnail?: string;
  progress?: WatchProgress;
  inWatchlist?: boolean;
}
