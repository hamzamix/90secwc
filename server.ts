import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  // Database setup
  const db = new Database("worldcup.db");
  
  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_stats (
      teamId TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      flag TEXT,
      iso TEXT,
      wins INTEGER DEFAULT 0,
      lastWonAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      championId TEXT,
      runnerUpId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  app.use(express.json());

  // API Routes
  app.get("/api/stats", (req, res) => {
    try {
      const stats = db.prepare("SELECT * FROM team_stats ORDER BY wins DESC LIMIT 50").all();
      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/win", (req, res) => {
    const { teamId, name, flag, iso } = req.body;
    if (!teamId || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const upsert = db.prepare(`
        INSERT INTO team_stats (teamId, name, flag, iso, wins, lastWonAt)
        VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(teamId) DO UPDATE SET
          wins = wins + 1,
          lastWonAt = CURRENT_TIMESTAMP
      `);
      upsert.run(teamId, name, flag, iso);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to record win:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/session", (req, res) => {
    const { championId, runnerUpId } = req.body;
    try {
      const insert = db.prepare(`
        INSERT INTO sessions (id, championId, runnerUpId, createdAt)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `);
      insert.run(`session_${Date.now()}`, championId, runnerUpId);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to save session:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
