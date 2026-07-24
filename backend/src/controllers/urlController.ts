import { getPool } from "../config/database";
import { generateShortCode, isValidUrl, sanitizeUrl } from "../utils/helpers";

export interface UrlRow {
 id: string;
 short_code: string;
 original_url: string;
 clicks: number;
 created_at: string;
 expires_at: string | null;
 user_id: string | null;
}

export async function createShortUrl(originalUrl: string, customCode?: string, expiresAt?: string): Promise<UrlRow> {
 const sanitized = sanitizeUrl(originalUrl);

 if (!isValidUrl(sanitized)) {
 throw new Error("Invalid URL. Must start with http:// or https://");
 }

 const pool = getPool();
 let shortCode: string;
 if (customCode) {
 if (!/^[A-Za-z0-9_-]+$/.test(customCode) || customCode.length < 4 || customCode.length > 20) {
 throw new Error("Custom code must be 4-20 alphanumeric characters");
 }
 const existing = await pool.query("SELECT id FROM urls WHERE short_code = $1", [customCode]);
 if (existing.rows.length > 0) {
 throw new Error("Custom code already taken");
 }
 shortCode = customCode;
 } else {
 let attempts = 0;
 do {
 shortCode = generateShortCode(6);
 const existing = await pool.query("SELECT id FROM urls WHERE short_code = $1", [shortCode]);
 if (existing.rows.length === 0) break;
 attempts++;
 if (attempts > 5) throw new Error("Could not generate unique short code");
 } while (true);
 }

 const result = await pool.query(
 "INSERT INTO urls (short_code, original_url, expires_at) VALUES ($1, $2, $3) RETURNING *",
 [shortCode, sanitized, expiresAt || null]
 );

 return result.rows[0];
}

export async function getUrlByCode(shortCode: string): Promise<UrlRow | null> {
 const pool = getPool();
 const result = await pool.query("SELECT * FROM urls WHERE short_code = $1", [shortCode]);
 return result.rows[0] || null;
}

export async function incrementClicks(id: string): Promise<void> {
 const pool = getPool();
 await pool.query("UPDATE urls SET clicks = clicks + 1 WHERE id = $1", [id]);
}

export async function listUrls(): Promise<UrlRow[]> {
 const pool = getPool();
 const result = await pool.query("SELECT * FROM urls ORDER BY created_at DESC");
 return result.rows;
}

export async function deleteUrl(shortCode: string): Promise<boolean> {
 const pool = getPool();
 const result = await pool.query("DELETE FROM urls WHERE short_code = $1 RETURNING id", [shortCode]);
 return result.rows.length > 0;
}