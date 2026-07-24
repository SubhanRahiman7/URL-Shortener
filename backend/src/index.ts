import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router } from "./routes";
import { getUrlByCode, incrementClicks } from "./controllers/urlController";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
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

app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});