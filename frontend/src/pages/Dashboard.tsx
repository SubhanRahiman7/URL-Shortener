import { useState, useEffect } from "react";
import { fetchUrls, deleteUrl } from "../services/api";
import type { UrlEntry } from "../types";

function formatDate(iso: string): string {
 const d = new Date(iso);
 const mon = d.toLocaleString("en-US", { month: "short" });
 const day = d.getDate();
 const year = d.getFullYear();
 const hr = d.getHours().toString().padStart(2, "0");
 const min = d.getMinutes().toString().padStart(2, "0");
 return `${mon} ${day}, ${year} @ ${hr}:${min}`;
}

export default function DashboardPage({ links, setLinks, copiedCode, setCopiedCode, onNavigate }: {
 links: UrlEntry[];
 setLinks: (l: UrlEntry[]) => void;
 copiedCode: string | null;
 setCopiedCode: (c: string | null) => void;
 onNavigate: (r: "home" | "dashboard") => void;
}) {
 const [search, setSearch] = useState("");
 const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

 useEffect(() => {
 fetchUrls().then((data) => {
 if (data.success) setLinks(data.data);
 }).catch(() => {});
 }, [setLinks]);

 const handleDelete = async (code: string) => {
 if (deleteConfirm !== code) {
 setDeleteConfirm(code);
 setTimeout(() => setDeleteConfirm(null), 3000);
 return;
 }
 try {
 await deleteUrl(code);
 setLinks(links.filter((l) => l.short_code !== code));
 setDeleteConfirm(null);
 } catch {}
 };

 const copyLink = (code: string, shortUrl: string) => {
 navigator.clipboard.writeText(shortUrl).catch(() => {});
 setCopiedCode(code);
 setTimeout(() => setCopiedCode(null), 1400);
 };

 const q = search.trim().toLowerCase();
 const filtered = links.filter((l) => {
 if (!q) return true;
 return l.original_url.toLowerCase().includes(q) || l.short_code.toLowerCase().includes(q);
 });

 const promptStyle: React.CSSProperties = {
 display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#4b6b56"
 };

 return (
 <div>
 <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 24 }}>
 <div>
 <div style={promptStyle}>
 <span style={{ color: "#3ffb7f" }}>visitor@web</span>
 <span style={{ color: "#4b6b56" }}>:</span>
 <span style={{ color: "#3ffb7f" }}>~</span>
 <span style={{ color: "#4b6b56" }}>$</span>
 <span style={{ color: "#e8fff0" }}> ls ./links</span>
 </div>
 <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", margin: "6px 0 0", color: "#e8fff0", fontFamily: "'JetBrains Mono', monospace" }}>
 <span style={{ color: "#3ffb7f" }}>[</span> DASHBOARD <span style={{ color: "#3ffb7f" }}>]</span>
 </h1>
 <div style={{ fontSize: 12, color: "#4b6b56", marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>
 # {links.length === 1 ? "1 link" : `${links.length} links`}
 </div>
 </div>
 <button onClick={() => onNavigate("home")} style={{ background: "transparent", border: "1px solid #3ffb7f", color: "#3ffb7f", cursor: "pointer", fontWeight: 700, fontSize: 13, padding: "10px 18px", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#3ffb7f"; e.currentTarget.style.color = "#04070a"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#3ffb7f"; }}>
 [ + NEW ]
 </button>
 </div>

 <div style={{ position: "relative", marginBottom: 20, display: "flex", alignItems: "center", border: "1px solid rgba(57,255,136,0.25)", background: "#070b09" }}>
 <span style={{ padding: "0 0 0 14px", color: "#4b6b56", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>grep&gt;</span>
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="filter by url or code…"
 style={{ flex: 1, boxSizing: "border-box", background: "transparent", border: "none", padding: "12px 14px", color: "#e8fff0", fontSize: 13, outline: "none", caretColor: "#3ffb7f", fontFamily: "'JetBrains Mono', monospace" }}
 />
 </div>

 {filtered.length > 0 && (
 <div style={{ border: "1px solid rgba(57,255,136,0.2)" }}>
 <div style={{ display: "flex", gap: 16, padding: "10px 18px", fontSize: 11, letterSpacing: "0.08em", color: "#4b6b56", borderBottom: "1px solid rgba(57,255,136,0.2)", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
 <span style={{ flex: 1 }}>link</span>
 <span style={{ width: 180, flexShrink: 0 }}>meta</span>
 <span style={{ width: 120, flexShrink: 0, textAlign: "right" }}>actions</span>
 </div>

 {filtered.map((link, i) => {
 const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
 const shortUrl = `${baseUrl}/${link.short_code}`;
 const isCopied = copiedCode === link.short_code;
 const isDeleting = deleteConfirm === link.short_code;
 const rowStyle: React.CSSProperties = {
 display: "flex", alignItems: "center", gap: 16, padding: "16px 18px",
 borderBottom: i < filtered.length - 1 ? "1px solid rgba(57,255,136,0.1)" : "none",
 background: "transparent",
 };

 return (
 <div key={link.id} style={rowStyle} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(57,255,136,0.04)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
 <div style={{ minWidth: 0, flex: 1 }}>
 <span style={{ fontSize: 14, fontWeight: 700, color: "#3ffb7f", fontFamily: "'JetBrains Mono', monospace" }}>{link.short_code}</span>
 <div style={{ fontSize: 12, color: "#4b6b56", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 380 }}>
 <span style={{ color: "#4b6b56" }}>&gt;</span> {link.original_url}
 </div>
 </div>
 <div style={{ width: 180, flexShrink: 0, fontSize: 11, color: "#4b6b56", lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace" }}>
 <div><span style={{ color: "#8fe6ad" }}>{link.clicks}</span> clicks</div>
 <div>made {formatDate(link.created_at)}</div>
 {link.expires_at && <div style={{ color: "#ffb454" }}>exp {formatDate(link.expires_at)}</div>}
 </div>
 <div style={{ width: 120, flexShrink: 0, display: "flex", gap: 10, justifyContent: "flex-end" }}>
 <button
 onClick={() => copyLink(link.short_code, shortUrl)}
 style={{ background: "transparent", border: "none", color: isCopied ? "#3ffb7f" : "#8fe6ad", fontSize: 12, cursor: "pointer", padding: 0, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}
 onMouseEnter={(e) => { if (!isCopied) e.currentTarget.style.color = "#3ffb7f"; }}
 onMouseLeave={(e) => { if (!isCopied) e.currentTarget.style.color = "#8fe6ad"; }}
 >
 {isCopied ? "[copied]" : "[copy]"}
 </button>
 <button
 onClick={() => handleDelete(link.short_code)}
 style={{ background: "transparent", border: "none", color: isDeleting ? "#ff6b6b" : "#8a5252", fontSize: 12, cursor: "pointer", padding: 0, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap", fontWeight: isDeleting ? 700 : 400 }}
 onMouseEnter={(e) => { e.currentTarget.style.color = "#ff6b6b"; }}
 onMouseLeave={(e) => { e.currentTarget.style.color = isDeleting ? "#ff6b6b" : "#8a5252"; }}
 >
 {isDeleting ? "[confirm?]" : "[del]"}
 </button>
 </div>
 </div>
 );
 })}
 </div>
 )}

 {filtered.length === 0 && (
 <div style={{ textAlign: "center", padding: "64px 24px", border: "1px dashed rgba(57,255,136,0.2)" }}>
 <div style={{ fontSize: 14, color: "#4b6b56", marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
 {links.length === 0 ? "-- no links yet --" : "-- no links match filter --"}
 </div>
 <span onClick={() => onNavigate("home")} style={{ color: "#3ffb7f", fontSize: 13, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }} onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = "0.7"; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = "1"; }}>
 shorten your first link &gt;
 </span>
 </div>
 )}
 </div>
 );
}