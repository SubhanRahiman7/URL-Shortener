import { useState, useEffect, useRef } from "react";
import { shortenUrl } from "../services/api";

const SPINNER = ["|", "/", "-", "\\"];
const COLD_THRESHOLD_MS = 15 * 60 * 1000;
const LAST_ACTIVE_KEY = "linksnip_last_active_v1";

const LOADING_STEPS_COLD = ["resolving target_url", "render.com: free-tier instance is asleep — cold-starting backend", "reconnecting to edge network", "allocating short code", "writing route to cdn cache"];
const LOADING_STEPS_WARM = ["resolving target_url", "connecting to edge network", "allocating short code", "writing route to cdn cache"];
const LOADING_DURATIONS_COLD = [450, 2200, 700, 500, 450];
const LOADING_DURATIONS_WARM = [400, 500, 400, 400];

function LoadingPanel({ cold, spinnerFrame }: { cold: boolean; spinnerFrame: number }) {
 const [phase, setPhase] = useState(0);
 const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

 useEffect(() => {
 const durations = cold ? LOADING_DURATIONS_COLD : LOADING_DURATIONS_WARM;
 setPhase(0);
 timersRef.current.forEach(clearTimeout);
 timersRef.current = [];
 let cumulative = 0;
 durations.forEach((d, i) => {
 cumulative += d;
 const t = setTimeout(() => setPhase(i + 1), cumulative);
 timersRef.current.push(t);
 });
 return () => timersRef.current.forEach(clearTimeout);
 }, [cold]);

 const steps = cold ? LOADING_STEPS_COLD : LOADING_STEPS_WARM;
 const totalSteps = steps.length;

 return (
 <div style={{ background: "#070b09", border: "1px solid rgba(57,255,136,0.3)", padding: 28, animation: "fadeUp 0.3s ease both" }}>
 <div style={{ fontSize: 13, color: "#4b6b56", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontFamily: "'JetBrains Mono', monospace" }}>
 <span>&gt; POST /api/shorten</span>
 <span style={{ color: "#3ffb7f", fontWeight: 700 }}>{SPINNER[spinnerFrame]}</span>
 </div>
 {steps.map((text, i) => {
 const done = i < phase;
 const current = i === phase;
 const icon = done ? "✓" : current ? SPINNER[spinnerFrame] : "·";
 const color = done ? "#3ffb7f" : current ? (text.includes("asleep") ? "#ffb454" : "#8fe6ad") : "#3a5245";
 return (
 <div key={i} style={{ fontSize: 12, padding: "3px 0", color, fontFamily: "'JetBrains Mono', monospace", transition: "color 0.2s" }}>
 {icon} {text}
 </div>
 );
 })}
 <div style={{ marginTop: 18, height: 6, background: "rgba(57,255,136,0.12)", borderRadius: 3, overflow: "hidden" }}>
 <div style={{ height: "100%", background: "#3ffb7f", width: Math.min(100, Math.round((phase / totalSteps) * 100)) + "%", transition: "width 0.4s ease" }} />
 </div>
 </div>
 );
}

export default function HomePage({ onNavigate }: { onNavigate: (r: "home" | "dashboard") => void }) {
 const [longUrl, setLongUrl] = useState("");
 const [useCustom, setUseCustom] = useState(false);
 const [customCode, setCustomCode] = useState("");
 const [expiresAt, setExpiresAt] = useState("");
 const [error, setError] = useState("");
 const [successEntry, setSuccessEntry] = useState<{ shortUrl: string; originalUrl: string } | null>(null);
 const [copied, setCopied] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const [spinnerFrame, setSpinnerFrame] = useState(0);
 const [isColdStart, setIsColdStart] = useState(false);
 const [loadingCold, setLoadingCold] = useState(false);
 const [bannerDismissed, setBannerDismissed] = useState(false);
 const spinnerRef = useRef<ReturnType<typeof setInterval> | null>(null);

 useEffect(() => {
 const now = Date.now();
 const last = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || "0", 10);
 setIsColdStart(!last || (now - last) > COLD_THRESHOLD_MS);
 localStorage.setItem(LAST_ACTIVE_KEY, String(now));
 return () => { if (spinnerRef.current) clearInterval(spinnerRef.current); };
 }, []);

 const copySuccess = async () => {
 if (!successEntry) return;
 try { await navigator.clipboard.writeText(successEntry.shortUrl); } catch {}
 setCopied(true);
 setTimeout(() => setCopied(false), 1400);
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError("");
 setSuccessEntry(null);

 if (!longUrl.trim()) {
 setError("! Not found — enter a valid URL");
 return;
 }

 let normalized = longUrl.trim();
 if (!/^https?:\/\//i.test(normalized)) normalized = "https://" + normalized;
 try { new URL(normalized); } catch {
 setError("! Not found — enter a valid URL");
 return;
 }

 const cold = isColdStart;
 setLoadingCold(cold);
 setIsColdStart(false);
 setIsLoading(true);
 setSpinnerFrame(0);

 if (spinnerRef.current) clearInterval(spinnerRef.current);
 spinnerRef.current = setInterval(() => setSpinnerFrame(f => (f + 1) % SPINNER.length), 120);

 try {
 const data = await shortenUrl(normalized, useCustom ? customCode.trim() : undefined, expiresAt || undefined);
 setSuccessEntry({ shortUrl: data.data.shortUrl, originalUrl: data.data.original_url });
 } catch (err: any) {
 setError(err.message);
 } finally {
 if (spinnerRef.current) clearInterval(spinnerRef.current);
 setIsLoading(false);
 setLoadingCold(false);
 setLongUrl("");
 setUseCustom(false);
 setCustomCode("");
 setExpiresAt("");
 }
 };

 const dismissBanner = () => setBannerDismissed(true);
 const showColdBanner = isColdStart && !bannerDismissed;

 return (
 <div>
 {showColdBanner && (
 <div style={{ position: "relative", zIndex: 5, maxWidth: 660, margin: "16px auto 0", padding: "10px 16px", border: "1px solid rgba(255,180,84,0.4)", background: "rgba(255,180,84,0.06)", color: "#ffb454", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, animation: "fadeUp 0.3s ease both" }}>
 <span>&gt; backend asleep — free-tier instance spins down when idle. first request may take longer than usual.</span>
 <button onClick={dismissBanner} style={{ background: "transparent", border: "none", color: "#ffb454", cursor: "pointer", fontSize: 12, flexShrink: 0 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>[x]</button>
 </div>
 )}

 <div style={{ marginBottom: 32, animation: "fadeUp 0.35s ease both" }}>
 <div style={{ fontSize: 13, color: "#4b6b56", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
 <span style={{ color: "#3ffb7f" }}>visitor@web</span>
 <span style={{ color: "#4b6b56" }}>:</span>
 <span style={{ color: "#3ffb7f" }}>~</span>
 <span style={{ color: "#4b6b56" }}>$</span>
 <span style={{ color: "#e8fff0" }}> shorten-url --new</span>
 </div>
 <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px", color: "#e8fff0", fontFamily: "'JetBrains Mono', monospace" }}>
 <span style={{ color: "#3ffb7f" }}>[</span> SHORTEN_URL.SH <span style={{ color: "#3ffb7f" }}>]</span>
 </h1>
 <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 14 }}>
 <span style={{ border: "1px solid rgba(57,255,136,0.4)", padding: "3px 8px", fontSize: 12, color: "#8fe6ad", fontFamily: "'JetBrains Mono', monospace" }}>LONG_URL</span>
 <span style={{ width: 32, height: 1, background: "rgba(57,255,136,0.3)" }} />
 <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#3ffb7f", boxShadow: "0 0 6px rgba(57,255,136,0.5)" }} />
 <span style={{ width: 32, height: 1, background: "rgba(57,255,136,0.3)" }} />
 <span style={{ border: "1px solid rgba(255,180,84,0.4)", padding: "3px 8px", fontSize: 12, color: "#ffb454", fontFamily: "'JetBrains Mono', monospace" }}>SHORT_URL</span>
 </div>
 <p style={{ fontSize: 13, color: "#4b6b56", margin: 0 }}># paste a long link, get a routable short one back. no sign-up.</p>
 </div>

 {!isLoading && !successEntry && (
 <form onSubmit={handleSubmit} style={{ background: "#070b09", border: "1px solid rgba(57,255,136,0.25)", padding: 0, animation: "fadeUp 0.4s ease 0.06s both", overflow: "hidden" }}>
 <div style={{ borderBottom: "1px solid rgba(57,255,136,0.15)", padding: "8px 18px", display: "flex", alignItems: "center", gap: 8, background: "rgba(57,255,136,0.03)" }}>
 <span style={{ width: 8, height: 8, borderRadius: "50%", border: "1px solid rgba(255,110,110,0.6)" }} />
 <span style={{ width: 8, height: 8, borderRadius: "50%", border: "1px solid rgba(255,200,84,0.6)" }} />
 <span style={{ width: 8, height: 8, borderRadius: "50%", border: "1px solid rgba(57,255,136,0.6)" }} />
 <span style={{ fontSize: 11, color: "#4b6b56", marginLeft: 10 }}>linksnip@shortener</span>
 </div>
 <div style={{ padding: 24 }}>
 <label style={{ display: "block", fontSize: 13, color: "#8fe6ad", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
 <span style={{ color: "#3ffb7f" }}>&gt;</span> target_url
 </label>
 <input
 type="text"
 value={longUrl}
 onChange={(e) => { setLongUrl(e.target.value); setError(""); }}
 placeholder="https://example.com/a/very/long/path"
 style={{ width: "100%", boxSizing: "border-box", background: "#04070a", border: "1px solid rgba(57,255,136,0.25)", padding: "12px 14px", color: "#e8fff0", fontSize: 14, outline: "none", caretColor: "#3ffb7f", fontFamily: "'JetBrains Mono', monospace" }}
 onFocus={(e) => { e.currentTarget.style.borderColor = "#3ffb7f"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(57,255,136,0.1)"; }}
 onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(57,255,136,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
 />

 <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 22 }}>
 <div style={{ flex: 1, minWidth: 220 }}>
 <button type="button" onClick={() => setUseCustom(!useCustom)} style={{ background: "transparent", border: "none", color: useCustom ? "#3ffb7f" : "#8fe6ad", fontSize: 13, cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "'JetBrains Mono', monospace", transition: "color 0.15s" }}>
 {useCustom ? "[x] custom_code" : "[ ] custom_code"}
 </button>
 {useCustom && (
 <div style={{ display: "flex", alignItems: "center", marginTop: 10, border: "1px solid rgba(57,255,136,0.25)", background: "#04070a" }}>
 <span style={{ padding: "11px 0 11px 14px", fontSize: 13, color: "#4b6b56", fontFamily: "'JetBrains Mono', monospace" }}>linksn.ip/</span>
 <input
 type="text"
 value={customCode}
 onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
 placeholder="my-code"
 style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", padding: "11px 12px 11px 2px", color: "#e8fff0", fontSize: 13, outline: "none", caretColor: "#3ffb7f", fontFamily: "'JetBrains Mono', monospace" }}
 />
 </div>
 )}
 </div>
 <div style={{ flex: 1, minWidth: 200 }}>
 <label style={{ display: "block", fontSize: 13, color: "#8fe6ad", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
 <span style={{ color: "#3ffb7f" }}>&gt;</span> expires <span style={{ color: "#4b6b56" }}>(optional)</span>
 </label>
 <input
 type="date"
 value={expiresAt}
 onChange={(e) => setExpiresAt(e.target.value)}
 style={{ width: "100%", boxSizing: "border-box", background: "#04070a", border: "1px solid rgba(57,255,136,0.25)", padding: "9px 12px", color: "#e8fff0", fontSize: 13, outline: "none", fontFamily: "'JetBrains Mono', monospace" }}
 onFocus={(e) => { e.currentTarget.style.borderColor = "#3ffb7f"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(57,255,136,0.1)"; }}
 onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(57,255,136,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
 />
 </div>
 </div>

 {error && (
 <div style={{ marginTop: 16, fontSize: 13, color: "#ffb454", border: "1px solid rgba(255,180,84,0.35)", padding: "10px 14px", fontFamily: "'JetBrains Mono', monospace" }}>
 ! {error}
 </div>
 )}

 <button type="submit" style={{ width: "100%", marginTop: 22, background: "transparent", border: "1px solid #3ffb7f", padding: 13, fontSize: 14, fontWeight: 700, color: "#3ffb7f", cursor: "pointer", letterSpacing: "0.03em", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#3ffb7f"; e.currentTarget.style.color = "#04070a"; e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 0 18px rgba(57,255,136,0.5)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#3ffb7f"; e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}>
 [ RUN ./shorten ]
 </button>
 </div>
 </form>
 )}

 {isLoading && <LoadingPanel cold={loadingCold} spinnerFrame={spinnerFrame} />}

 {successEntry && !isLoading && (
 <div style={{ marginTop: 20, background: "#070b09", border: "1px solid rgba(57,255,136,0.4)", overflow: "hidden", animation: "fadeUp 0.35s ease both" }}>
 <div style={{ borderBottom: "1px solid rgba(57,255,136,0.15)", padding: "6px 18px", display: "flex", alignItems: "center", gap: 8, background: "rgba(57,255,136,0.03)" }}>
 <span style={{ width: 8, height: 8, borderRadius: "50%", border: "1px solid rgba(57,255,136,0.6)" }} />
 <span style={{ fontSize: 11, color: "#4b6b56" }}>output</span>
 </div>
 <div style={{ padding: 20 }}>
 <div style={{ fontSize: 12, color: "#4b6b56", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>
 <span style={{ color: "#3ffb7f" }}>&gt;</span> status: <span style={{ color: "#3ffb7f" }}>200 OK</span>
 </div>
 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
 <span style={{ fontSize: 16, fontWeight: 700, color: "#3ffb7f", fontFamily: "'JetBrains Mono', monospace", wordBreak: "break-all" }}>{successEntry.shortUrl}</span>
 <button onClick={copySuccess} style={{ background: "transparent", border: "none", color: copied ? "#3ffb7f" : "#8fe6ad", fontSize: 12, cursor: "pointer", padding: 0, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>
 {copied ? "[copied]" : "[copy]"}
 </button>
 </div>
 <div style={{ marginTop: 10, fontSize: 12, color: "#4b6b56", fontFamily: "'JetBrains Mono', monospace", wordBreak: "break-all" }}>
 <span style={{ color: "#3ffb7f" }}>&gt;</span> target: {successEntry.originalUrl}
 </div>
 </div>
 </div>
 )}

 <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 8 }}>
 <span style={{ color: "#4b6b56", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
 <span style={{ color: "#3ffb7f" }}>visitor@web</span>
 <span style={{ color: "#4b6b56" }}>:</span>
 <span style={{ color: "#3ffb7f" }}>~</span>
 <span style={{ color: "#4b6b56" }}>$</span>
 </span>
 <span onClick={() => onNavigate("dashboard")} style={{ color: "#4b6b56", fontSize: 13, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }} onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#8fe6ad"; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#4b6b56"; }}>
 cd ./dashboard <span style={{ color: "#3ffb7f" }}>--all-links</span>
 </span>
 </div>
 </div>
 );
}