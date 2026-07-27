import type { ApiListResponse, ShortenResponse, UrlEntry } from "../types";

const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

export async function shortenUrl(url: string, customCode?: string, expiresAt?: string): Promise<ShortenResponse> {
 const res = await fetch(`${API_BASE}/shorten`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ url, customCode, expiresAt }),
 });

 const data = await res.json();
 if (!res.ok) throw new Error(data.error || "Failed to shorten URL");
 return data;
}

export async function resolveUrl(code: string): Promise<UrlEntry | null> {
 try {
 const res = await fetch(`${API_BASE}/urls/${encodeURIComponent(code)}`);
 if (!res.ok) return null;
 const data: ApiListResponse = await res.json();
 if (data.success && data.data.length > 0) return data.data[0];
 return null;
 } catch {
 return null;
 }
}

export async function fetchUrls(): Promise<ApiListResponse> {
 const res = await fetch(`${API_BASE}/urls`);
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || "Failed to fetch URLs");
 return data;
}

export async function deleteUrl(shortCode: string): Promise<void> {
 const res = await fetch(`${API_BASE}/urls/${encodeURIComponent(shortCode)}`, { method: "DELETE" });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || "Failed to delete URL");
}
