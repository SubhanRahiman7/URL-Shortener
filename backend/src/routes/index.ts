import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { createShortUrl, deleteUrl, getUrlByCode, incrementClicks, listUrls } from "../controllers/urlController.js";

export const router = Router();

const shortenLimiter = rateLimit({
 windowMs: 15 * 60 * 1000,
 max: 50,
 message: "Too many requests. Try again later.",
});

router.get("/urls", async (_req: Request, res: Response) => {
 try {
 const urls = await listUrls();
 res.json({ success: true, data: urls });
 } catch (err) {
 res.status(500).json({ success: false, error: "Failed to fetch URLs" });
 }
});

router.post("/shorten", shortenLimiter, async (req: Request, res: Response) => {
 try {
 const { url, customCode, expiresAt } = req.body;

 if (!url || typeof url !== "string") {
 return res.status(400).json({ success: false, error: "URL is required" });
 }

 const result = await createShortUrl(url, customCode, expiresAt);

 const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
 const shortUrl = `${baseUrl}/${result.short_code}`;

 res.status(201).json({ success: true, data: { ...result, shortUrl } });
 } catch (err: any) {
 res.status(400).json({ success: false, error: err.message });
 }
});

router.delete("/urls/:code", async (req: Request, res: Response) => {
 try {
 const { code } = req.params;
 const shortCode = Array.isArray(code) ? code[0] : code;
 const deleted = await deleteUrl(shortCode);

 if (!deleted) {
 return res.status(404).json({ success: false, error: "URL not found" });
 }

 res.json({ success: true, message: "URL deleted" });
 } catch (err) {
 res.status(500).json({ success: false, error: "Failed to delete URL" });
 }
});