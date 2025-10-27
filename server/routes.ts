import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWatchProgressSchema, insertWatchlistSchema } from "@shared/schema";
import { promises as fs } from "fs";
import path from "path";

const MOVIES_PATH = '/Users/Siphesihle Dhlamini/Downloads/DhlStream/Movies';
const SERIES_PATH = '/Users/Siphesihle Dhlamini/Downloads/DhlStream/Movies';

// Simple session store
const sessions = new Map<string, { userId: string; expires: number }>();

function createSession(userId: string): string {
  const sessionId = Math.random().toString(36).substring(2);
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  sessions.set(sessionId, { userId, expires });
  return sessionId;
}

function getSession(sessionId: string): { userId: string } | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.expires < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  return { userId: session.userId };
}

function requireAuth(req: any, res: any): string | null {
  const sessionId = req.headers.cookie?.split('sessionId=')[1]?.split(';')[0];
  if (!sessionId) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const session = getSession(sessionId);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return session.userId;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existing = await storage.getUserByUsername(data.username);
      if (existing) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      const user = await storage.createUser(data);
      const sessionId = createSession(user.id);
      
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax'
      });
      
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(data.username);
      if (!user || user.password !== data.password) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const sessionId = createSession(user.id);
      
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax'
      });
      
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.headers.cookie?.split('sessionId=')[1]?.split(';')[0];
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.clearCookie('sessionId');
    res.json({ success: true });
  });

  app.get("/api/auth/me", (req, res) => {
    const sessionId = req.headers.cookie?.split('sessionId=')[1]?.split(';')[0];
    if (!sessionId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json({ userId: session.userId });
  });

  // Content routes
  app.get("/api/content/movies", async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const movies = await storage.scanMovies();
      const contentItems = await Promise.all(movies.map(async movie => {
        const progress = await storage.getWatchProgress(userId, movie.id);
        const inWatchlist = await storage.isInWatchlist(userId, movie.id);
        
        return {
          id: movie.id,
          title: movie.title,
          type: 'movie' as const,
          path: movie.path,
          thumbnail: movie.thumbnail,
          subtitles: movie.subtitles,
          progress,
          inWatchlist
        };
      }));
      
      res.json(contentItems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/content/series", async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const series = await storage.scanSeries();
      const contentItems = await Promise.all(series.map(async show => {
        const inWatchlist = await storage.isInWatchlist(userId, show.id);
        
        return {
          id: show.id,
          title: show.title,
          type: 'series' as const,
          path: show.path,
          thumbnail: show.thumbnail,
          inWatchlist
        };
      }));
      
      res.json(contentItems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/content/series-details", async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const series = await storage.scanSeries();
      res.json(series);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/content/continue-watching", async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const progressList = await storage.getContinueWatching(userId);
      const movies = await storage.scanMovies();
      const series = await storage.scanSeries();
      
      const allContent = [
        ...movies.map(m => ({ id: m.id, title: m.title, type: 'movie' as const })),
        ...series.flatMap(s => 
          s.seasons.flatMap(season => 
            season.episodes.map(ep => ({ id: ep.id, title: ep.title, type: 'episode' as const }))
          )
        )
      ];
      
      const contentItems = progressList
        .map(progress => {
          const content = allContent.find(c => c.id === progress.contentId);
          if (!content) return null;
          
          return {
            id: content.id,
            title: content.title,
            type: content.type === 'episode' ? 'series' as const : content.type,
            path: '',
            progress
          };
        })
        .filter(Boolean);
      
      res.json(contentItems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Search content
  app.get("/api/content/search", async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const query = (req.query.q as string || '').toLowerCase();
      
      if (!query) {
        return res.json([]);
      }

      const movies = await storage.scanMovies();
      const series = await storage.scanSeries();
      
      const movieResults = movies
        .filter(m => m.title.toLowerCase().includes(query))
        .map(m => ({
          id: m.id,
          title: m.title,
          type: 'movie' as const,
          path: m.path,
          thumbnail: m.thumbnail
        }));
      
      const seriesResults = series
        .filter(s => s.title.toLowerCase().includes(query))
        .map(s => ({
          id: s.id,
          title: s.title,
          type: 'series' as const,
          path: s.path,
          thumbnail: s.thumbnail
        }));
      
      res.json([...movieResults, ...seriesResults]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Watchlist routes
  app.get("/api/watchlist", async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const watchlistItems = await storage.getWatchlist(userId);
      const movies = await storage.scanMovies();
      const series = await storage.scanSeries();
      
      const allContent = [
        ...movies.map(m => ({ id: m.id, title: m.title, type: 'movie' as const, path: m.path })),
        ...series.map(s => ({ id: s.id, title: s.title, type: 'series' as const, path: s.path }))
      ];
      
      const contentItems = watchlistItems
        .map(item => {
          const content = allContent.find(c => c.id === item.contentId);
          if (!content) return null;
          
          return {
            id: content.id,
            title: content.title,
            type: content.type,
            path: content.path,
            thumbnail: undefined,
            inWatchlist: true
          };
        })
        .filter(Boolean);
      
      res.json(contentItems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const data = insertWatchlistSchema.parse({ ...req.body, userId });
      await storage.addToWatchlist(data);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/watchlist/:contentId", async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const { contentId } = req.params;
      await storage.removeFromWatchlist(userId, contentId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stream video with range support
  app.get("/api/stream/:id", async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const { id } = req.params;
      const decodedPath = Buffer.from(id, 'base64').toString('utf-8');
      
      let filePath: string;
      if (decodedPath.includes('/')) {
        filePath = path.join(SERIES_PATH, decodedPath);
      } else {
        filePath = path.join(MOVIES_PATH, decodedPath);
      }

      const stat = await fs.stat(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4',
        });

        const stream = (await import('fs')).createReadStream(filePath, { start, end });
        stream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        });

        const stream = (await import('fs')).createReadStream(filePath);
        stream.pipe(res);
      }
    } catch (error: any) {
      console.error('Stream error:', error);
      res.status(500).json({ error: 'Video not found' });
    }
  });

  // Serve subtitle files
  app.get("/api/subtitles/:id/:filename", async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const { id, filename } = req.params;
      const decodedPath = Buffer.from(id, 'base64').toString('utf-8');
      
      let dirPath: string;
      if (decodedPath.includes('/')) {
        const parts = decodedPath.split('/');
        parts.pop(); // Remove filename
        dirPath = path.join(SERIES_PATH, parts.join('/'));
      } else {
        dirPath = MOVIES_PATH;
      }

      const subtitlePath = path.join(dirPath, filename);
      const content = await fs.readFile(subtitlePath, 'utf-8');
      
      res.setHeader('Content-Type', filename.endsWith('.vtt') ? 'text/vtt' : 'text/plain');
      res.send(content);
    } catch (error: any) {
      console.error('Subtitle error:', error);
      res.status(404).json({ error: 'Subtitle not found' });
    }
  });

  // Save watch progress
  app.post("/api/progress", async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const data = insertWatchProgressSchema.parse({ ...req.body, userId });
      await storage.saveWatchProgress(data);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
