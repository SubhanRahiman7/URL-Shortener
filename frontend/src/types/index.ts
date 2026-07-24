export interface UrlEntry {
 id: string;
 short_code: string;
 original_url: string;
 clicks: number;
 created_at: string;
 expires_at: string | null;
 shortUrl?: string;
}

export interface ShortenResponse {
 success: boolean;
 data: UrlEntry & { shortUrl: string };
 error?: string;
}

export interface ApiListResponse {
 success: boolean;
 data: UrlEntry[];
 error?: string;
}
