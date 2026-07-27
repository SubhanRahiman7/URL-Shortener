import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { router } from "./routes/index.js";
import { getUrlByCode, incrementClicks } from "./controllers/urlController.js";
import { getPool } from "./config/database.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
 res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", router);

app.get("/:code", async (req, res) => {
 try {
 const { code } = req.params;
 const entry = await getUrlByCode(code);

 if (!entry) {
 return res.status(404).json({ success: false, error: "Short URL not found" });
 }

 if (entry.expires_at && new Date(entry.expires_at) < new Date()) {
 return res.status(410).json({ success: false, error: "This link has expired" });
 }

 await incrementClicks(entry.id);
 res.redirect(entry.original_url);
 } catch (err: any) {
 res.status(500).json({ success: false, error: "Redirect failed" });
 }
});

app.use((_req, res) => {
 res.status(404).json({ success: false, error: "Not found" });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
 console.error("Unhandled error:", err);
 res.status(500).json({ success: false, error: "Internal server error" });
});

const server = app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});

process.on("SIGTERM", async () => {
 console.log("SIGTERM received, shutting down gracefully");
 server.close(async () => {
 try {
 const pool = getPool();
 await pool.end();
 console.log("DB pool closed");
 } catch {}
 process.exit(0);
 });
});