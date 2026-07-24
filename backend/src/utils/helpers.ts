import { customAlphabet } from "nanoid";

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const generateShortCode = (length = 6): string => {
 const nanoid = customAlphabet(alphabet, length);
 return nanoid();
};

export function isValidUrl(urlString: string): boolean {
 try {
 const url = new URL(urlString);
 return ["http:", "https:"].includes(url.protocol);
 } catch {
 return false;
 }
}

export function sanitizeUrl(url: string): string {
 url = url.trim();
 if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
 return url;
}
