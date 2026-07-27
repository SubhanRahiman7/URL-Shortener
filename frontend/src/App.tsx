import { useState, useEffect } from "react";
import type { UrlEntry } from "./types";
import HomePage from "./pages/Home";
import DashboardPage from "./pages/Dashboard";
import { resolveUrl } from "./services/api";

export default function App() {
 const [route, setRoute] = useState<"home" | "dashboard">("home");
 const [links, setLinks] = useState<UrlEntry[]>([]);
 const [copiedCode, setCopiedCode] = useState<string | null>(null);
 const [resolving, setResolving] = useState(true);

 const navHomeStyle: React.CSSProperties = { fontWeight: 600, color: "#3ffb7f", cursor: "pointer" };
 const navDashStyle: React.CSSProperties = { fontWeight: 600, color: "#4b6b56", cursor: "pointer" };

 const isHome = route === "home";
 const isDashboard = route === "dashboard";

 useEffect(() => {
 const path = window.location.pathname.slice(1);
 if (!path || path === "favicon.ico") { setResolving(false); return; }
 if (["shorten", "dashboard", "api"].includes(path.toLowerCase())) { setResolving(false); return; }
 if (!/^[A-Za-z0-9_-]{4,20}$/.test(path)) { setResolving(false); return; }
 resolveUrl(path).then((entry) => {
 if (entry?.original_url) { window.location.replace(entry.original_url); }
 else { setResolving(false); }
 }).catch(() => { setResolving(false); });
 }, []);

 return (
 <div style={{ minHeight: "100vh", background: "#04070a", position: "relative", overflowX: "hidden", fontFamily: "'JetBrains Mono', monospace", color: "#8fe6ad" }}>
 <div style={{
 position: "fixed", inset: 0,
 backgroundImage: "linear-gradient(rgba(57,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,136,0.04) 1px, transparent 1px)",
 backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0,
 }} />
 <div style={{
 position: "fixed", inset: 0,
 backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)",
 pointerEvents: "none", zIndex: 0, opacity: 0.5,
 }} />

 <nav style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", background: "rgba(4,7,10,0.92)", borderBottom: "1px solid rgba(57,255,136,0.25)" }}>
 <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setRoute("home")}>
 <img src="/logo.png" alt="LinkSnip" style={{ width: 28, height: 28, borderRadius: 7, objectFit: "cover" }} />
 <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", color: "#e8fff0" }}>
 linksnip<span style={{ color: "#3ffb7f" }}>@</span>shortener
 </span>
 <span style={{ color: "#3ffb7f", fontWeight: 700, animation: "blink 1.1s step-end infinite" }}>_</span>
 </div>
 <div style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 13 }}>
 <span style={{ ...navHomeStyle }} onClick={() => setRoute("home")}>./shorten</span>
 <span style={{ ...navDashStyle }} onClick={() => setRoute("dashboard")}>./dashboard</span>
 </div>
 </nav>

 {resolving && (
 <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#4b6b56", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
 resolving…
 </div>
 )}

 {!resolving && isHome && (
 <main style={{ position: "relative", zIndex: 1, maxWidth: 660, margin: "0 auto", padding: "72px 24px 120px", animation: "pageIn 0.35s ease both" }}>
 <HomePage onNavigate={setRoute} />
 </main>
 )}

 {!resolving && isDashboard && (
 <main style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "56px 24px 120px", animation: "pageIn 0.35s ease both" }}>
 <DashboardPage links={links} setLinks={setLinks} copiedCode={copiedCode} setCopiedCode={setCopiedCode} onNavigate={setRoute} />
 </main>
 )}
 </div>
 );
}