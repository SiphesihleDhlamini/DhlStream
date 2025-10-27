import { 
  type User, 
  type InsertUser, 
  type WatchProgress, 
  type InsertWatchProgress,
  type Watchlist,
  type InsertWatchlist,
  type Movie, 
  type Series 
} from "@shared/schema";
import { db } from "./db";
import { users, watchProgress, watchlist } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { promises as fs } from "fs";
import path from "path";
import { searchMoviePoster, searchSeriesPoster } from "./tmdb";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getWatchProgress(userId: string, contentId: string): Promise<WatchProgress | undefined>;
  saveWatchProgress(progress: InsertWatchProgress): Promise<void>;
  getContinueWatching(userId: string): Promise<WatchProgress[]>;
  
  getWatchlist(userId: string): Promise<Watchlist[]>;
  addToWatchlist(item: InsertWatchlist): Promise<void>;
  removeFromWatchlist(userId: string, contentId: string): Promise<void>;
  isInWatchlist(userId: string, contentId: string): Promise<boolean>;
  
  scanMovies(): Promise<Movie[]>;
  scanSeries(): Promise<Series[]>;
}

const MOVIES_PATH ='/Users/Siphesihle Dhlamini/Downloads/DhlStream/Movies';
const SERIES_PATH ='/Users/Siphesihle Dhlamini/Downloads/DhlStream/Series';

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getWatchProgress(userId: string, contentId: string): Promise<WatchProgress | undefined> {
    const result = await db.select().from(watchProgress)
      .where(and(eq(watchProgress.userId, userId), eq(watchProgress.contentId, contentId)))
      .limit(1);
    return result[0];
  }

  async saveWatchProgress(progress: InsertWatchProgress): Promise<void> {
    const existing = await this.getWatchProgress(progress.userId, progress.contentId);
    
    if (existing) {
      await db.update(watchProgress)
        .set({
          currentTime: progress.currentTime,
          duration: progress.duration,
          completed: progress.completed,
          lastWatched: new Date(),
        })
        .where(eq(watchProgress.id, existing.id));
    } else {
      await db.insert(watchProgress).values(progress);
    }
  }

  async getContinueWatching(userId: string): Promise<WatchProgress[]> {
    return await db.select().from(watchProgress)
      .where(and(eq(watchProgress.userId, userId), eq(watchProgress.completed, false)))
      .orderBy(desc(watchProgress.lastWatched))
      .limit(10);
  }

  async getWatchlist(userId: string): Promise<Watchlist[]> {
    return await db.select().from(watchlist)
      .where(eq(watchlist.userId, userId))
      .orderBy(desc(watchlist.addedAt));
  }

  async addToWatchlist(item: InsertWatchlist): Promise<void> {
    const existing = await db.select().from(watchlist)
      .where(and(eq(watchlist.userId, item.userId), eq(watchlist.contentId, item.contentId)))
      .limit(1);
    
    if (!existing.length) {
      await db.insert(watchlist).values(item);
    }
  }

  async removeFromWatchlist(userId: string, contentId: string): Promise<void> {
    await db.delete(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.contentId, contentId)));
  }

  async isInWatchlist(userId: string, contentId: string): Promise<boolean> {
    const result = await db.select().from(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.contentId, contentId)))
      .limit(1);
    return result.length > 0;
  }

  async scanMovies(): Promise<Movie[]> {
    const movies: Movie[] = [];
    
    try {
      const files = await fs.readdir(MOVIES_PATH);
      const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'];
      
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (videoExtensions.includes(ext)) {
          const id = Buffer.from(file).toString('base64');
          const title = path.basename(file, ext)
            .replace(/[._-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          // Check for subtitle files
          const baseName = path.basename(file, ext);
          const dirFiles = await fs.readdir(MOVIES_PATH);
          const subtitles = dirFiles
            .filter(f => f.startsWith(baseName) && (f.endsWith('.srt') || f.endsWith('.vtt')))
            .map(f => f);
          
          // Fetch poster from TMDB
          const thumbnail = await searchMoviePoster(title);
          
          movies.push({
            id,
            title,
            filename: file,
            path: path.join(MOVIES_PATH, file),
            type: 'movie',
            thumbnail,
            subtitles: subtitles.length > 0 ? subtitles : undefined
          });
        }
      }
    } catch (error) {
      console.error('Error scanning movies directory:', error);
    }
    
    return movies;
  }

  async scanSeries(): Promise<Series[]> {
    const seriesMap = new Map<string, Series>();
    
    try {
      const seriesFolders = await fs.readdir(SERIES_PATH, { withFileTypes: true });
      const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'];
      
      for (const seriesFolder of seriesFolders) {
        if (seriesFolder.isDirectory()) {
          const seriesPath = path.join(SERIES_PATH, seriesFolder.name);
          const seriesId = Buffer.from(seriesFolder.name).toString('base64');
          
          // Fetch poster from TMDB
          const thumbnail = await searchSeriesPoster(seriesFolder.name);
          
          const series: Series = {
            id: seriesId,
            title: seriesFolder.name.replace(/[._-]/g, ' '),
            path: seriesPath,
            type: 'series',
            thumbnail,
            seasons: []
          };
          
          try {
            const items = await fs.readdir(seriesPath, { withFileTypes: true });
            
            for (const item of items) {
              if (item.isDirectory() && item.name.toLowerCase().startsWith('season')) {
                const seasonNumber = parseInt(item.name.match(/\d+/)?.[0] || '1');
                const seasonPath = path.join(seriesPath, item.name);
                const episodeFiles = await fs.readdir(seasonPath);
                
                const episodes = [];
                for (const file of episodeFiles) {
                  const ext = path.extname(file).toLowerCase();
                  if (videoExtensions.includes(ext)) {
                    const episodeId = Buffer.from(`${seriesFolder.name}/${item.name}/${file}`).toString('base64');
                    const episodeMatch = file.match(/[Ee](\d+)/);
                    const currentLength = episodes.length;
                    const episodeNumber: number = episodeMatch ? parseInt(episodeMatch[1]) : currentLength + 1;
                    
                    // Check for subtitle files
                    const baseName = path.basename(file, ext);
                    const subtitles = episodeFiles
                      .filter(f => f.startsWith(baseName) && (f.endsWith('.srt') || f.endsWith('.vtt')))
                      .map(f => f);
                    
                    episodes.push({
                      id: episodeId,
                      title: path.basename(file, ext).replace(/[._-]/g, ' '),
                      filename: file,
                      path: path.join(seasonPath, file),
                      seriesTitle: series.title,
                      seasonNumber,
                      episodeNumber,
                      subtitles: subtitles.length > 0 ? subtitles : undefined
                    });
                  }
                }
                
                episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
                series.seasons.push({ number: seasonNumber, episodes });
              } else if (!item.isDirectory() && videoExtensions.includes(path.extname(item.name).toLowerCase())) {
                if (series.seasons.length === 0) {
                  series.seasons.push({ number: 1, episodes: [] });
                }
                
                const episodeId = Buffer.from(`${seriesFolder.name}/${item.name}`).toString('base64');
                const episodeMatch = item.name.match(/[Ee](\d+)/);
                const currentEpisodeCount = series.seasons[0].episodes.length;
                const episodeNumber = episodeMatch ? parseInt(episodeMatch[1]) : currentEpisodeCount + 1;
                
                const ext = path.extname(item.name);
                const baseName = path.basename(item.name, ext);
                const dirFiles = await fs.readdir(seriesPath);
                const subtitles = dirFiles
                  .filter(f => f.startsWith(baseName) && (f.endsWith('.srt') || f.endsWith('.vtt')))
                  .map(f => f);
                
                series.seasons[0].episodes.push({
                  id: episodeId,
                  title: baseName.replace(/[._-]/g, ' '),
                  filename: item.name,
                  path: path.join(seriesPath, item.name),
                  seriesTitle: series.title,
                  seasonNumber: 1,
                  episodeNumber,
                  subtitles: subtitles.length > 0 ? subtitles : undefined
                });
              }
            }
            
            series.seasons.sort((a, b) => a.number - b.number);
            seriesMap.set(seriesId, series);
          } catch (error) {
            console.error(`Error scanning series ${seriesFolder.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error scanning series directory:', error);
    }
    
    return Array.from(seriesMap.values());
  }
}

export const storage = new DbStorage();
