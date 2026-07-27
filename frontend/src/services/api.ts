import type { ApiListResponse, ShortenResponse } from "../types";

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

export async function fetchUrls(): Promise<ApiListResponse> {
 const res = await fetch(`${API_BASE}/urls`);
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || "Failed to fetch URLs");
 return data;
}

export async function deleteUrl(shortCode: string): Promise<void> {
 const res = await fetch(`${API_BASE}/urls/${shortCode}`, { method: "DELETE" });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || "Failed to delete URL");
}