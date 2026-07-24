import { useState } from "react";
import { shortenUrl } from "../services/api";

export default function HomePage({ onNavigate }: { onNavigate: (r: "home" | "dashboard") => void }) {
 const [longUrl, setLongUrl] = useState("");
 const [useCustom, setUseCustom] = useState(false);
 const [customCode, setCustomCode] = useState("");
 const [expiresAt, setExpiresAt] = useState("");
 const [error, setError] = useState("");
 const [successEntry, setSuccessEntry] = useState<{ shortUrl: string; originalUrl: string } | null>(null);
 const [copied, setCopied] = useState(false);

 const copySuccess = async () => {
 if (!successEntry) return;
 try {
 await navigator.clipboard.writeText(successEntry.shortUrl);
 } catch {}
 setCopied(true);
 setTimeout(() => setCopied(false), 1400);
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError("");
 setSuccessEntry(null);

 if (!longUrl.trim()) {
 setError("invalid url — try example.com/page");
 return;
 }

 let normalized = longUrl.trim();
 if (!/^https?:\/\//i.test(normalized)) normalized = "https://" + normalized;
 try {
 new URL(normalized);
 } catch {
 setError("invalid url — try example.com/page");
 return;
 }

 try {
 const data = await shortenUrl(normalized, useCustom ? customCode.trim() : undefined);
 setSuccessEntry({ shortUrl: data.data.shortUrl, originalUrl: data.data.original_url });
 setLongUrl("");
 setUseCustom(false);
 setCustomCode("");
 setExpiresAt("");
 } catch (err: any) {
 setError(err.message);
 }
 };

 const submitBtnStyle: React.CSSProperties = {
 width: "100%", marginTop: 22, background: "transparent", border: "1px solid #3ffb7f",
 padding: 13, fontSize: 14, fontWeight: 700, color: "#3ffb7f", cursor: "pointer", letterSpacing: "0.03em",
 };

 return (
 <div>
 <div style={{ marginBottom: 36, animation: "fadeUp 0.4s ease both" }}>
 <div style={{ fontSize: 13, color: "#4b6b56", marginBottom: 10 }}>visitor@web:~$ shorten-url --new</div>
 <h1 style={{ fontSize: 34, lineHeight: 1.25, fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 12px", color: "#e8fff0" }}>[ SHORTEN_URL.SH ]</h1>
 <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 14, fontSize: 12, color: "#4b6b56" }}>
 <span style={{ border: "1px solid rgba(57,255,136,0.35)", padding: "4px 8px", color: "#8fe6ad" }}>LONG_URL</span>
 <span style={{ width: 36, height: 1, background: "rgba(57,255,136,0.35)" }} />
 <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#3ffb7f" }} />
 <span style={{ width: 36, height: 1, background: "rgba(57,255,136,0.35)" }} />
 <span style={{ border: "1px solid rgba(255,180,84,0.5)", padding: "4px 8px", color: "#ffb454" }}>SHORT_URL</span>
 </div>
 <p style={{ fontSize: 13, color: "#4b6b56", margin: 0 }}># paste a long link, get a routable short one back. no sign-up.</p>
 </div>

 <form onSubmit={handleSubmit} style={{ background: "#070b09", border: "1px solid rgba(57,255,136,0.3)", padding: 28, animation: "fadeUp 0.4s ease 0.06s both" }}>
 <label style={{ display: "block", fontSize: 13, color: "#8fe6ad", marginBottom: 8 }}>&gt; target_url</label>
 <input
 type="text"
 value={longUrl}
 onChange={(e) => { setLongUrl(e.target.value); setError(""); }}
 placeholder="https://example.com/a/very/long/path"
 style={{ width: "100%", boxSizing: "border-box", background: "#04070a", border: "1px solid rgba(57,255,136,0.3)", padding: "12px 14px", color: "#e8fff0", fontSize: 14, outline: "none", caretColor: "#3ffb7f" }}
 onFocus={(e) => { e.currentTarget.style.borderColor = "#3ffb7f"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(57,255,136,0.12)"; }}
 onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(57,255,136,0.3)"; e.currentTarget.style.boxShadow = "none"; }}
 />

 <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 22 }}>
 <div style={{ flex: 1, minWidth: 220 }}>
 <button type="button" onClick={() => setUseCustom(!useCustom)} style={{ background: "transparent", border: "none", color: useCustom ? "#3ffb7f" : "#8fe6ad", fontSize: 13, cursor: "pointer", padding: 0, textAlign: "left" }}>
 {useCustom ? "[x] custom_code" : "[ ] custom_code"}
 </button>
 {useCustom && (
 <div style={{ display: "flex", alignItems: "center", marginTop: 10, border: "1px solid rgba(57,255,136,0.3)", background: "#04070a" }}>
 <span style={{ padding: "11px 0 11px 13px", fontSize: 13, color: "#4b6b56" }}>linksn.ip/</span>
 <input
 type="text"
 value={customCode}
 onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
 placeholder="my-code"
 style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", padding: "11px 12px 11px 2px", color: "#e8fff0", fontSize: 13, outline: "none", caretColor: "#3ffb7f" }}
 />
 </div>
 )}
 </div>
 <div style={{ flex: 1, minWidth: 200 }}>
 <label style={{ display: "block", fontSize: 13, color: "#8fe6ad", marginBottom: 8 }}>
 &gt; expires <span style={{ color: "#4b6b56" }}>(optional)</span>
 </label>
 <input
 type="date"
 value={expiresAt}
 onChange={(e) => setExpiresAt(e.target.value)}
 style={{ width: "100%", boxSizing: "border-box", background: "#04070a", border: "1px solid rgba(57,255,136,0.3)", padding: "9px 12px", color: "#e8fff0", fontSize: 13, outline: "none" }}
 onFocus={(e) => { e.currentTarget.style.borderColor = "#3ffb7f"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(57,255,136,0.12)"; }}
 onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(57,255,136,0.3)"; e.currentTarget.style.boxShadow = "none"; }}
 />
 </div>
 </div>

 {error && (
 <div style={{ marginTop: 16, fontSize: 13, color: "#ffb454", border: "1px solid rgba(255,180,84,0.35)", padding: "9px 13px" }}>! {error}</div>
 )}

 <button type="submit" style={submitBtnStyle} onMouseEnter={(e) => { e.currentTarget.style.background = "#3ffb7f"; e.currentTarget.style.color = "#04070a"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#3ffb7f"; }}>
 [ RUN ./shorten ]
 </button>
 </form>

 {successEntry && (
 <div style={{ marginTop: 20, background: "#070b09", border: "1px solid rgba(57,255,136,0.4)", padding: 22, animation: "fadeUp 0.35s ease both" }}>
 <div style={{ fontSize: 12, color: "#4b6b56", marginBottom: 10 }}>&gt; status: 200 OK</div>
 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
 <span style={{ fontSize: 18, fontWeight: 700, color: "#3ffb7f" }}>{successEntry.shortUrl}</span>
 <button onClick={copySuccess} style={{ background: "transparent", border: "none", color: copied ? "#3ffb7f" : "#8fe6ad", fontSize: 12, cursor: "pointer", padding: 0 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>
 {copied ? "[copied]" : "[copy]"}
 </button>
 </div>
 <div style={{ marginTop: 10, fontSize: 12, color: "#4b6b56", wordBreak: "break-all" }}>&gt; target: {successEntry.originalUrl}</div>
 </div>
 )}

 <div style={{ marginTop: 28 }}>
 <span onClick={() => onNavigate("dashboard")} style={{ fontSize: 13, color: "#4b6b56", cursor: "pointer" }} onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#8fe6ad"; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#4b6b56"; }}>
 &gt; cd ./dashboard <span style={{ color: "#3ffb7f" }}>--all-links</span>
 </span>
 </div>
 </div>
 );
}