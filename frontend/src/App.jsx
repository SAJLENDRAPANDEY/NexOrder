import { useState, useEffect, useCallback } from "react";
import axios from "https://cdn.jsdelivr.net/npm/axios@1.6.7/+esm";

const API_BASE = "http://localhost:8000";
const http = axios.create({ baseURL: API_BASE });
const setToken = (t) => t ? (http.defaults.headers.common["Authorization"] = `Bearer ${t}`) : delete http.defaults.headers.common["Authorization"];

// ─── INJECT STYLES ───────────────────────────────────────────────────────────
const css = document.createElement("style");
css.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --bg0:#060810;
  --bg1:#0a0d14;
  --bg2:#0f1320;
  --bg3:#141929;
  --bg4:#1a2035;
  --line:rgba(255,255,255,0.055);
  --line2:rgba(255,255,255,0.1);
  --line3:rgba(255,255,255,0.18);
  --ink:#dde4f0;
  --ink2:#8a97b0;
  --ink3:#4a5568;
  --gold:#f5c542;
  --gold2:#e8a900;
  --teal:#00d4aa;
  --teal2:#00a882;
  --blue:#4d9fff;
  --red:#ff5470;
  --purple:#9d7bff;
  --r:14px;
  --r2:20px;
  --shadow:0 4px 24px rgba(0,0,0,0.5);
  --shadow2:0 8px 48px rgba(0,0,0,0.7);
}

html,body,#root{height:100%;background:var(--bg0);color:var(--ink);font-family:'Outfit',sans-serif}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:2px}

.auth-shell{
  min-height:100vh;display:grid;place-items:center;
  background:radial-gradient(ellipse 70% 50% at 20% 20%,rgba(77,159,255,0.06) 0%,transparent 60%),
    radial-gradient(ellipse 60% 60% at 80% 80%,rgba(0,212,170,0.07) 0%,transparent 60%),var(--bg0);
  padding:24px;
}
.auth-card{
  width:100%;max-width:420px;background:var(--bg1);border:1px solid var(--line2);
  border-radius:var(--r2);padding:44px 40px;
  box-shadow:var(--shadow2),0 0 0 1px rgba(255,255,255,0.02);
  animation:riseIn .5s cubic-bezier(.16,1,.3,1);
}
.auth-eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--teal);margin-bottom:22px}
.auth-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--teal);box-shadow:0 0 10px var(--teal);animation:blink 2s ease infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
.auth-heading{font-size:32px;font-weight:800;letter-spacing:-.03em;line-height:1.1;margin-bottom:6px}
.auth-sub{font-size:13px;color:var(--ink2);margin-bottom:32px}
.auth-footer-link{width:100%;margin-top:10px;padding:10px;border-radius:var(--r);background:transparent;border:1px solid var(--line2);color:var(--ink2);font-family:'Outfit',sans-serif;font-size:13px;cursor:pointer;transition:all .2s}
.auth-footer-link:hover{color:var(--ink);border-color:var(--line3);background:var(--bg3)}

.field{margin-bottom:14px}
.field-label{display:block;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);margin-bottom:6px}
.field-input{width:100%;padding:11px 14px;background:var(--bg2);border:1px solid var(--line2);border-radius:var(--r);color:var(--ink);font-family:'Outfit',sans-serif;font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s}
.field-input:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(0,212,170,0.1)}
.field-input::placeholder{color:var(--ink3)}
.field-input option{background:var(--bg2)}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 20px;border-radius:var(--r);border:none;cursor:pointer;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;letter-spacing:.04em;transition:all .2s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden}
.btn:active{transform:scale(.97)}
.btn-primary{background:linear-gradient(135deg,var(--teal),var(--teal2));color:#060810;width:100%;font-size:14px;font-weight:700;box-shadow:0 0 28px rgba(0,212,170,0.3)}
.btn-primary:hover{box-shadow:0 0 40px rgba(0,212,170,0.45);transform:translateY(-1px)}
.btn-ghost{background:var(--bg3);color:var(--ink2);border:1px solid var(--line2)}
.btn-ghost:hover{color:var(--ink);background:var(--bg4);border-color:var(--line3)}
.btn-outline{background:transparent;color:var(--teal);border:1px solid rgba(0,212,170,0.3)}
.btn-outline:hover{background:rgba(0,212,170,0.08);border-color:var(--teal)}
.btn-danger{background:rgba(255,84,112,0.1);color:var(--red);border:1px solid rgba(255,84,112,0.25)}
.btn-danger:hover{background:rgba(255,84,112,0.2)}
.btn-sm{padding:7px 14px;font-size:12px;border-radius:10px}
.btn-full{width:100%}
.btn:disabled{opacity:.5;pointer-events:none}

.alert{padding:10px 14px;border-radius:10px;font-size:13px;margin-top:12px;animation:riseIn .25s ease}
.alert-error{background:rgba(255,84,112,.08);color:var(--red);border:1px solid rgba(255,84,112,.2)}
.alert-success{background:rgba(0,212,170,.07);color:var(--teal);border:1px solid rgba(0,212,170,.2)}

@keyframes spin{to{transform:rotate(360deg)}}
.spin{width:18px;height:18px;border:2px solid var(--line2);border-top-color:var(--teal);border-radius:50%;animation:spin .65s linear infinite;display:inline-block}
.spin-lg{width:32px;height:32px;border-width:3px}
.loading-box{display:flex;align-items:center;justify-content:center;padding:80px;gap:12px;color:var(--ink3);font-size:13px}

.app-layout{display:flex;height:100vh;overflow:hidden}

.sidebar{width:240px;min-width:240px;height:100vh;background:var(--bg1);border-right:1px solid var(--line);display:flex;flex-direction:column;overflow:hidden}
.sidebar-logo{padding:22px 20px 18px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--line)}
.sidebar-logo-mark{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,var(--teal),var(--blue));display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;color:#060810;box-shadow:0 0 16px rgba(0,212,170,0.3)}
.sidebar-logo-text{font-size:15px;font-weight:800;letter-spacing:-.02em}
.sidebar-logo-text span{color:var(--teal)}

.sidebar-balance{margin:16px 14px;background:linear-gradient(135deg,rgba(245,197,66,0.12) 0%,rgba(245,197,66,0.04) 100%);border:1px solid rgba(245,197,66,0.22);border-radius:var(--r);padding:16px;position:relative;overflow:hidden}
.sidebar-balance::before{content:'';position:absolute;top:-20px;right:-20px;width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,rgba(245,197,66,0.15),transparent)}
.sidebar-balance-label{font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:rgba(245,197,66,.7);margin-bottom:6px}
.sidebar-balance-amount{font-size:24px;font-weight:800;letter-spacing:-.03em;color:var(--gold);font-family:'Outfit',sans-serif;line-height:1;margin-bottom:4px;transition:all .4s}
.sidebar-balance-sub{font-size:11px;color:rgba(245,197,66,.5)}
@keyframes balFlash{0%{color:#fff;text-shadow:0 0 20px var(--gold)}100%{color:var(--gold);text-shadow:none}}
.bal-flash{animation:balFlash .8s ease}

.sidebar-nav{flex:1;padding:8px 10px;display:flex;flex-direction:column;gap:2px;overflow-y:auto}
.nav-item{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:11px;cursor:pointer;color:var(--ink2);font-size:13px;font-weight:500;transition:all .15s ease;border:1px solid transparent;user-select:none}
.nav-item:hover{color:var(--ink);background:var(--bg3)}
.nav-item.active{color:var(--teal);background:rgba(0,212,170,0.09);border-color:rgba(0,212,170,0.15)}
.nav-item-icon{font-size:16px;width:20px;text-align:center;flex-shrink:0}

.sidebar-footer{padding:12px 14px;border-top:1px solid var(--line);display:flex;align-items:center;gap:10px}
.sidebar-user-avatar{width:32px;height:32px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,var(--purple),var(--blue));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff}
.sidebar-user-info{flex:1;min-width:0}
.sidebar-user-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sidebar-user-role{font-size:11px;color:var(--ink3)}
.sidebar-logout{width:28px;height:28px;border-radius:8px;background:transparent;border:1px solid var(--line2);color:var(--ink3);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:all .15s;flex-shrink:0}
.sidebar-logout:hover{color:var(--red);border-color:rgba(255,84,112,.3);background:rgba(255,84,112,.08)}

.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{height:54px;min-height:54px;border-bottom:1px solid var(--line);display:flex;align-items:center;padding:0 24px;gap:12px;background:var(--bg1)}
.topbar-title{font-size:15px;font-weight:700;letter-spacing:-.01em}
.topbar-badge{font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;background:var(--bg3);color:var(--ink3);border:1px solid var(--line);padding:3px 9px;border-radius:20px}
.topbar-right{margin-left:auto;display:flex;align-items:center;gap:10px}
.topbar-balance{display:flex;align-items:center;gap:7px;background:rgba(245,197,66,0.09);border:1px solid rgba(245,197,66,0.2);border-radius:20px;padding:5px 14px;font-size:13px;font-weight:700;color:var(--gold);font-family:'JetBrains Mono',monospace;transition:all .3s}
.content{flex:1;overflow-y:auto;padding:28px}

.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:28px}
.stat-tile{background:var(--bg1);border:1px solid var(--line);border-radius:var(--r2);padding:20px 22px;transition:border-color .2s,transform .2s;position:relative;overflow:hidden}
.stat-tile:hover{border-color:var(--line2);transform:translateY(-2px)}
.stat-tile-label{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);margin-bottom:10px}
.stat-tile-val{font-size:28px;font-weight:800;letter-spacing:-.03em;line-height:1}
.stat-tile-sub{font-size:11px;color:var(--ink3);margin-top:4px}
.stat-tile-icon{position:absolute;top:18px;right:18px;font-size:22px;opacity:.25}
.c-teal{color:var(--teal)}.c-gold{color:var(--gold)}.c-blue{color:var(--blue)}.c-red{color:var(--red)}.c-purple{color:var(--purple)}

.sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.sec-title{font-size:16px;font-weight:700;letter-spacing:-.02em}
.sec-count{font-size:11px;color:var(--ink3);background:var(--bg3);border:1px solid var(--line);padding:3px 10px;border-radius:20px}

.product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
.product-card{background:var(--bg1);border:1px solid var(--line);border-radius:var(--r2);overflow:hidden;cursor:default;transition:border-color .25s,transform .25s,box-shadow .25s}
.product-card:hover{border-color:rgba(0,212,170,.3);transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.5),0 0 0 1px rgba(0,212,170,.08)}
.product-thumb{height:120px;background:linear-gradient(135deg,var(--bg2),var(--bg3));display:flex;align-items:center;justify-content:center;font-size:44px;border-bottom:1px solid var(--line);position:relative;overflow:hidden}
.product-thumb::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 80%,rgba(0,212,170,.06),transparent)}
.product-body{padding:14px}
.product-name{font-size:13px;font-weight:700;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.product-desc{font-size:11px;color:var(--ink3);margin-bottom:12px;min-height:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.product-row{display:flex;align-items:center;justify-content:space-between}
.product-price{font-size:17px;font-weight:700;color:var(--teal);font-family:'JetBrains Mono',monospace}
.stock-tag{font-size:10px;font-weight:600;letter-spacing:.05em;padding:3px 8px;border-radius:6px}
.st-ok{background:rgba(0,212,170,.09);color:var(--teal);border:1px solid rgba(0,212,170,.2)}
.st-low{background:rgba(245,197,66,.09);color:var(--gold);border:1px solid rgba(245,197,66,.2)}
.st-out{background:rgba(255,84,112,.08);color:var(--red);border:1px solid rgba(255,84,112,.2)}

.profile-hero{background:linear-gradient(135deg,var(--bg2) 0%,var(--bg1) 100%);border:1px solid var(--line2);border-radius:var(--r2);padding:32px;display:flex;align-items:flex-start;gap:24px;margin-bottom:20px;position:relative;overflow:hidden}
.profile-hero::before{content:'';position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(0,212,170,.05),transparent);pointer-events:none}
.profile-avatar{width:76px;height:76px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,var(--purple),var(--blue));display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff;border:3px solid var(--bg0);box-shadow:0 0 0 2px rgba(157,123,255,.4);position:relative}
.profile-online{position:absolute;bottom:2px;right:2px;width:14px;height:14px;border-radius:50%;background:var(--teal);border:2px solid var(--bg1);box-shadow:0 0 8px var(--teal)}
.profile-name{font-size:22px;font-weight:800;letter-spacing:-.03em;margin-bottom:3px}
.profile-email{font-size:13px;color:var(--ink2);margin-bottom:14px}
.profile-chips{display:flex;gap:8px;flex-wrap:wrap}
.chip{font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:4px 11px;border-radius:20px}
.chip-teal{background:rgba(0,212,170,.09);color:var(--teal);border:1px solid rgba(0,212,170,.2)}
.chip-purple{background:rgba(157,123,255,.09);color:var(--purple);border:1px solid rgba(157,123,255,.2)}
.chip-blue{background:rgba(77,159,255,.09);color:var(--blue);border:1px solid rgba(77,159,255,.2)}

.balance-showcase{margin-left:auto;text-align:right;flex-shrink:0}
.balance-showcase-label{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);margin-bottom:6px}
.balance-showcase-val{font-size:36px;font-weight:900;letter-spacing:-.04em;color:var(--gold);font-family:'Outfit',sans-serif;line-height:1;text-shadow:0 0 30px rgba(245,197,66,.4);transition:all .4s}
.balance-showcase-sub{font-size:11px;color:rgba(245,197,66,.5);margin-top:4px}

.order-card{background:var(--bg1);border:1px solid var(--line);border-radius:var(--r2);margin-bottom:10px;overflow:hidden;transition:border-color .2s}
.order-card:hover{border-color:var(--line2)}
.order-head{display:flex;align-items:center;gap:12px;padding:14px 18px;cursor:pointer;user-select:none}
.order-id{font-size:13px;font-weight:700;font-family:'JetBrains Mono',monospace}
.order-date{font-size:11px;color:var(--ink3)}
.order-amt{margin-left:auto;font-size:15px;font-weight:700;color:var(--teal);font-family:'JetBrains Mono',monospace}
.order-chevron{color:var(--ink3);font-size:12px;transition:transform .2s}
.order-chevron.open{transform:rotate(180deg)}
.order-body{padding:0 18px 16px;border-top:1px solid var(--line)}
.order-items-list{padding-top:12px;display:flex;flex-direction:column;gap:6px}
.order-item-row{display:flex;justify-content:space-between;font-size:12px;color:var(--ink2)}
.order-actions{display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}

.status-pill{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:3px 10px;border-radius:20px}
.s-pending{background:rgba(245,197,66,.1);color:var(--gold);border:1px solid rgba(245,197,66,.25)}
.s-completed{background:rgba(0,212,170,.08);color:var(--teal);border:1px solid rgba(0,212,170,.2)}
.s-cancelled{background:rgba(255,84,112,.08);color:var(--red);border:1px solid rgba(255,84,112,.2)}

.form-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.form-panel{background:var(--bg1);border:1px solid var(--line2);border-radius:var(--r2);padding:28px;max-width:520px}
.form-panel-title{font-size:17px;font-weight:700;letter-spacing:-.02em;margin-bottom:20px}
.preview-strip{background:var(--bg2);border:1px solid var(--line);border-radius:var(--r);padding:14px;margin:16px 0;display:flex;align-items:center;gap:14px}
.preview-icon{font-size:28px;width:48px;height:48px;border-radius:10px;background:var(--bg3);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.preview-name{font-size:13px;font-weight:700}
.preview-price{font-size:18px;font-weight:800;color:var(--teal)}
.divider{height:1px;background:var(--line);margin:16px 0}
.empty{text-align:center;padding:60px 20px;color:var(--ink3)}
.empty-icon{font-size:40px;opacity:.3;margin-bottom:12px}
.empty-text{font-size:13px}

@keyframes riseIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.rise{animation:riseIn .4s cubic-bezier(.16,1,.3,1) both}
.rise-1{animation:riseIn .4s .06s cubic-bezier(.16,1,.3,1) both}
.rise-2{animation:riseIn .4s .12s cubic-bezier(.16,1,.3,1) both}
.rise-3{animation:riseIn .4s .18s cubic-bezier(.16,1,.3,1) both}
.rise-4{animation:riseIn .4s .24s cubic-bezier(.16,1,.3,1) both}

@media(max-width:768px){
  .sidebar{display:none}
  .content{padding:20px 16px}
  .stat-grid{grid-template-columns:1fr 1fr}
  .profile-hero{flex-direction:column}
  .balance-showcase{margin-left:0;text-align:left}
  .form-grid-2{grid-template-columns:1fr}
}
`;
document.head.appendChild(css);

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const emojiFor = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("phone") || n.includes("mobile") || n.includes("iphone")) return "📱";
  if (n.includes("laptop") || n.includes("mac") || n.includes("computer")) return "💻";
  if (n.includes("tablet") || n.includes("ipad")) return "📟";
  if (n.includes("shirt") || n.includes("cloth") || n.includes("jacket")) return "👕";
  if (n.includes("book")) return "📚";
  if (n.includes("watch") || n.includes("clock")) return "⌚";
  if (n.includes("shoe") || n.includes("sneaker")) return "👟";
  if (n.includes("headphone") || n.includes("earphone") || n.includes("audio")) return "🎧";
  if (n.includes("camera")) return "📷";
  if (n.includes("tv") || n.includes("television")) return "📺";
  if (n.includes("food") || n.includes("snack") || n.includes("paneer")) return "🍱";
  return "📦";
};
const stockInfo = (s) =>
  s === 0 ? ["st-out", "Out of stock"] : s < 5 ? ["st-low", `${s} left`] : ["st-ok", `${s} in stock`];
const fmt = (n) => Number(n ?? 0).toLocaleString("en-IN");
const fmtCur = (n) => `\u20b9${fmt(n)}`;

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin, onRegister }) {
  const [f, setF] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      const { data } = await http.post("/login", f);
      localStorage.setItem("tok", data.access_token);
      setToken(data.access_token);
      setOk(true);
      setTimeout(() => onLogin(), 700);
    } catch (e) { setErr(e.response?.data?.detail || "Invalid credentials."); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-eyebrow"><span className="auth-eyebrow-dot" />ProductOS</div>
        <div className="auth-heading">Sign in<br />to your workspace</div>
        <div className="auth-sub">Manage products, orders and inventory</div>
        <div className="field">
          <label className="field-label">Username</label>
          <input className="field-input" placeholder="your_username" value={f.username}
            onChange={set("username")} onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <div className="field">
          <label className="field-label">Password</label>
          <input className="field-input" type="password" placeholder="••••••••" value={f.password}
            onChange={set("password")} onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }} disabled={busy || ok} onClick={submit}>
          {busy ? <span className="spin" /> : ok ? "✓ Authenticated" : "Sign In →"}
        </button>
        {err && <div className="alert alert-error">{err}</div>}
        <button className="auth-footer-link" onClick={onRegister}>Don't have an account? Register →</button>
      </div>
    </div>
  );
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────
function Register({ onBack }) {
  const [f, setF] = useState({ username: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      await http.post("/register", f);
      setOk(true);
      setTimeout(onBack, 1400);
    } catch (e) { setErr(e.response?.data?.detail || "Registration failed."); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-eyebrow"><span className="auth-eyebrow-dot" />Create Account</div>
        <div className="auth-heading">Join<br />ProductOS</div>
        <div className="auth-sub">Create your free account to get started</div>
        <div className="field"><label className="field-label">Username</label>
          <input className="field-input" value={f.username} onChange={set("username")} /></div>
        <div className="field"><label className="field-label">Email</label>
          <input className="field-input" type="email" value={f.email} onChange={set("email")} /></div>
        <div className="field"><label className="field-label">Password</label>
          <input className="field-input" type="password" value={f.password} onChange={set("password")} /></div>
        <button className="btn btn-primary" style={{ marginTop: 8 }} disabled={busy || ok} onClick={submit}>
          {busy ? <span className="spin" /> : ok ? "✓ Account Created!" : "Create Account →"}
        </button>
        {err && <div className="alert alert-error">{err}</div>}
        {ok && <div className="alert alert-success">Account created! Redirecting…</div>}
        <button className="auth-footer-link" onClick={onBack}>← Back to Sign In</button>
      </div>
    </div>
  );
}

// ─── PROFILE VIEW ─────────────────────────────────────────────────────────────
function ProfileView({ user, balance, balLoading }) {
  if (!user) return <div className="loading-box"><span className="spin spin-lg" /></div>;
  const init = (user.username || "??").slice(0, 2).toUpperCase();
  return (
    <div>
      <div className="profile-hero rise">
        <div className="profile-avatar">
          {init}
          <div className="profile-online" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="profile-name">{user.username}</div>
          <div className="profile-email">{user.email}</div>
          <div className="profile-chips">
            <span className="chip chip-teal">Active</span>
            {user.is_admin && <span className="chip chip-purple">Admin</span>}
            <span className="chip chip-blue">ID #{user.id}</span>
          </div>
        </div>
        {/* ── BIG BALANCE DISPLAY ── */}
        <div className="balance-showcase">
          <div className="balance-showcase-label">Wallet Balance</div>
          <div className="balance-showcase-val">
            {balLoading ? <span style={{ opacity: .4, fontSize: 24 }}>Loading…</span> : fmtCur(balance)}
          </div>
          <div className="balance-showcase-sub">{balLoading ? "Refreshing…" : "Available to spend"}</div>
        </div>
      </div>

      <div className="stat-grid rise-1">
        {[
          ["Wallet Balance", balLoading ? "—" : fmtCur(balance), "c-gold", "💰", "Available funds"],
          ["Account Status", "Active", "c-teal", "✅", "Verified member"],
          ["Role", user.is_admin ? "Admin" : "User", "c-purple", "🔐", "Access level"],
          ["Member Since", user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—", "c-blue", "📅", "Registration date"],
        ].map(([label, val, cls, icon, sub]) => (
          <div className="stat-tile" key={label}>
            <div className="stat-tile-label">{label}</div>
            <div className={`stat-tile-val ${cls}`} style={{ fontSize: typeof val === "string" && val.length > 8 ? 18 : 28 }}>{val}</div>
            <div className="stat-tile-sub">{sub}</div>
            <div className="stat-tile-icon">{icon}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PRODUCTS VIEW ────────────────────────────────────────────────────────────
function ProductsView({ onAddProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http.get("/products/").then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-box"><span className="spin spin-lg" /><span>Loading products…</span></div>;

  const inStock = products.filter(p => p.stock > 0).length;
  const totalVal = products.reduce((s, p) => s + p.price * (p.stock || 0), 0);

  return (
    <div>
      <div className="stat-grid rise">
        {[
          ["Total Products", products.length, "c-blue", "📦"],
          ["In Stock", inStock, "c-teal", "✅"],
          ["Out of Stock", products.length - inStock, "c-red", "⚠️"],
          ["Inventory Value", fmtCur(totalVal), "c-gold", "💎"],
        ].map(([label, val, cls, icon]) => (
          <div className="stat-tile" key={label}>
            <div className="stat-tile-label">{label}</div>
            <div className={`stat-tile-val ${cls}`} style={{ fontSize: typeof val === "string" ? 18 : 28 }}>{val}</div>
            <div className="stat-tile-icon">{icon}</div>
          </div>
        ))}
      </div>
      <div className="sec-head rise-1">
        <div className="sec-title">All Products</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="sec-count">{products.length} items</span>
          <button className="btn btn-outline btn-sm" onClick={onAddProduct}>＋ Add Product</button>
        </div>
      </div>
      {products.length === 0
        ? <div className="empty"><div className="empty-icon">📦</div><div className="empty-text">No products yet</div></div>
        : <div className="product-grid">
          {products.map((p, i) => {
            const [cls, label] = stockInfo(p.stock ?? 0);
            return (
              <div key={p.id} className="product-card rise" style={{ animationDelay: `${i * 35}ms` }}>
                <div className="product-thumb">{emojiFor(p.name)}</div>
                <div className="product-body">
                  <div className="product-name">{p.name}</div>
                  <div className="product-desc">{p.description || "\u00a0"}</div>
                  <div className="product-row">
                    <div className="product-price">{fmtCur(p.price)}</div>
                    <span className={`stock-tag ${cls}`}>{label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}

// ─── CREATE PRODUCT ───────────────────────────────────────────────────────────
function CreateProduct({ onDone }) {
  const [f, setF] = useState({ name: "", description: "", price: "", stock: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    if (!f.name || !f.price) return setMsg({ t: "error", m: "Name and price are required." });
    setBusy(true); setMsg(null);
    try {
      await http.post("/products/", { ...f, price: parseFloat(f.price), stock: parseInt(f.stock) || 0 });
      setMsg({ t: "success", m: "Product created successfully!" });
      setF({ name: "", description: "", price: "", stock: "" });
      setTimeout(onDone, 1200);
    } catch (e) { setMsg({ t: "error", m: e.response?.data?.detail || "Failed to create." }); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <div className="sec-head rise"><div className="sec-title">Add New Product</div></div>
      <div className="form-panel rise-1">
        <div className="form-panel-title">Product Details</div>
        <div className="field"><label className="field-label">Product Name *</label>
          <input className="field-input" placeholder="e.g. iPhone 15 Pro" value={f.name} onChange={set("name")} /></div>
        <div className="field"><label className="field-label">Description</label>
          <input className="field-input" placeholder="Short description…" value={f.description} onChange={set("description")} /></div>
        <div className="form-grid-2">
          <div className="field"><label className="field-label">Price (Rs) *</label>
            <input className="field-input" type="number" placeholder="0.00" value={f.price} onChange={set("price")} /></div>
          <div className="field"><label className="field-label">Stock</label>
            <input className="field-input" type="number" placeholder="0" value={f.stock} onChange={set("stock")} /></div>
        </div>
        {f.name && (
          <div className="preview-strip">
            <div className="preview-icon">{emojiFor(f.name)}</div>
            <div style={{ flex: 1 }}>
              <div className="preview-name">{f.name}</div>
              <div style={{ fontSize: 11, color: "var(--ink3)" }}>Live Preview</div>
            </div>
            <div className="preview-price">{fmtCur(parseFloat(f.price) || 0)}</div>
          </div>
        )}
        <button className="btn btn-primary btn-full" disabled={busy} style={{ marginTop: 4 }} onClick={submit}>
          {busy ? <><span className="spin" /> Creating…</> : "Create Product →"}
        </button>
        {msg && <div className={`alert alert-${msg.t}`}>{msg.m}</div>}
      </div>
    </div>
  );
}

// ─── ORDERS VIEW ──────────────────────────────────────────────────────────────
function OrdersView({ onBalanceChange }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [oForm, setOForm] = useState({ product_id: "", qty: 1 });
  const [oMsg, setOMsg] = useState(null);
  const [oBusy, setOBusy] = useState(false);

  const fetchOrders = () => http.get("/orders").then(r => setOrders(r.data)).catch(() => {});
  const fetchProds = () => http.get("/products/").then(r => setProducts(r.data)).catch(() => {});

  useEffect(() => {
    Promise.all([fetchOrders(), fetchProds()]).finally(() => setLoading(false));
  }, []);

  const placeOrder = async () => {
    if (!oForm.product_id) return setOMsg({ t: "error", m: "Select a product." });
    setOBusy(true); setOMsg(null);
    try {
      await http.post("/orders", { items: [{ product_id: parseInt(oForm.product_id), stock: parseInt(oForm.qty) || 1 }] });
      setOMsg({ t: "success", m: "Order placed! Balance updated." });
      setOForm({ product_id: "", qty: 1 });
      fetchOrders();
      onBalanceChange?.();
    } catch (e) { setOMsg({ t: "error", m: e.response?.data?.detail || "Order failed." }); }
    finally { setOBusy(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await http.put(`/orders/${id}/status?new_status=${status}`);
      fetchOrders();
      if (status === "cancelled") onBalanceChange?.();
    } catch (e) { alert(e.response?.data?.detail || "Cannot update."); }
  };

  if (loading) return <div className="loading-box"><span className="spin spin-lg" /><span>Loading orders…</span></div>;

  const spent = orders.filter(o => o.status === "completed").reduce((s, o) => s + o.total_price, 0);

  return (
    <div>
      <div className="stat-grid rise">
        {[
          ["Total Orders", orders.length, "c-blue", "🛒"],
          ["Pending", orders.filter(o => o.status === "pending").length, "c-gold", "⏳"],
          ["Completed", orders.filter(o => o.status === "completed").length, "c-teal", "✅"],
          ["Total Spent", fmtCur(spent), "c-red", "💸"],
        ].map(([l, v, c, ic]) => (
          <div className="stat-tile" key={l}>
            <div className="stat-tile-label">{l}</div>
            <div className={`stat-tile-val ${c}`} style={{ fontSize: typeof v === "string" ? 18 : 28 }}>{v}</div>
            <div className="stat-tile-icon">{ic}</div>
          </div>
        ))}
      </div>

      <div className="form-panel rise-1" style={{ marginBottom: 24 }}>
        <div className="form-panel-title" style={{ fontSize: 14, marginBottom: 14 }}>Place New Order</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px auto", gap: 10, alignItems: "flex-end" }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label">Product</label>
            <select className="field-input" value={oForm.product_id}
              onChange={e => setOForm({ ...oForm, product_id: e.target.value })}>
              <option value="">Choose product…</option>
              {products.filter(p => p.stock > 0).map(p =>
                <option key={p.id} value={p.id}>{p.name} — {fmtCur(p.price)}</option>
              )}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label">Qty</label>
            <input className="field-input" type="number" min="1" value={oForm.qty}
              onChange={e => setOForm({ ...oForm, qty: e.target.value })} />
          </div>
          <button className="btn btn-primary" style={{ height: 42 }} disabled={oBusy} onClick={placeOrder}>
            {oBusy ? <span className="spin" /> : "Order →"}
          </button>
        </div>
        {oMsg && <div className={`alert alert-${oMsg.t}`}>{oMsg.m}</div>}
      </div>

      <div className="sec-head rise-2">
        <div className="sec-title">Your Orders</div>
        <span className="sec-count">{orders.length} orders</span>
      </div>

      {orders.length === 0
        ? <div className="empty"><div className="empty-icon">🛒</div><div className="empty-text">No orders yet. Place your first one above!</div></div>
        : orders.map(o => (
          <div key={o.order_id} className="order-card rise">
            <div className="order-head" onClick={() => setExpanded(expanded === o.order_id ? null : o.order_id)}>
              <span className="order-id">#{o.order_id}</span>
              <span className={`status-pill s-${o.status}`}>{o.status}</span>
              <span className="order-date">{o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN") : "—"}</span>
              <span className="order-amt">{fmtCur(o.total_price)}</span>
              <span className={`order-chevron${expanded === o.order_id ? " open" : ""}`}>▼</span>
            </div>
            {expanded === o.order_id && (
              <div className="order-body">
                <div className="order-items-list">
                  {o.items?.map((it, i) => (
                    <div key={i} className="order-item-row">
                      <span>{it.product_name} × {it.quantity}</span>
                      <span style={{ color: "var(--teal)", fontFamily: "'JetBrains Mono',monospace" }}>{fmtCur(it.subtotal)}</span>
                    </div>
                  ))}
                </div>
                {o.status === "pending" && (
                  <div className="order-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(o.order_id, "completed")}>✓ Mark Complete</button>
                    <button className="btn btn-danger btn-sm" onClick={() => updateStatus(o.order_id, "cancelled")}>✕ Cancel & Refund</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      }
    </div>
  );
}

// ─── SECURITY ─────────────────────────────────────────────────────────────────
function SecurityView({ onLogout }) {
  const [f, setF] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    setBusy(true); setMsg(null);
    try {
      await http.post("/change-password", f);
      setMsg({ t: "success", m: "Password changed! Logging you out…" });
      setTimeout(onLogout, 1800);
    } catch (e) { setMsg({ t: "error", m: e.response?.data?.detail || "Failed." }); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 20 }}>
      <div className="form-panel rise" style={{ width: "100%" }}>
        <div className="form-panel-title">Change Password</div>
        <div className="field"><label className="field-label">Current Password</label>
          <input className="field-input" type="password" value={f.current_password} onChange={set("current_password")} /></div>
        <div className="field"><label className="field-label">New Password</label>
          <input className="field-input" type="password" value={f.new_password} onChange={set("new_password")} /></div>
        <div className="field"><label className="field-label">Confirm New Password</label>
          <input className="field-input" type="password" value={f.confirm_password} onChange={set("confirm_password")} /></div>
        <button className="btn btn-primary btn-full" disabled={busy} style={{ marginTop: 4 }} onClick={submit}>
          {busy ? <><span className="spin" /> Updating…</> : "Update Password →"}
        </button>
        {msg && <div className={`alert alert-${msg.t}`}>{msg.m}</div>}
      </div>
    </div>
  );
}

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NAV = [
  { id: "profile",  icon: "👤", label: "Profile" },
  { id: "products", icon: "📦", label: "Products" },
  { id: "create",   icon: "＋", label: "Add Product" },
  { id: "orders",   icon: "🛒", label: "Orders" },
  { id: "security", icon: "🔒", label: "Security" },
];
const TITLES = { profile: "My Profile", products: "Products", create: "Add Product", orders: "Orders", security: "Security" };

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tok, setTok] = useState(() => localStorage.getItem("tok") || "");
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [balLoading, setBalLoading] = useState(false);
  const [tab, setTab] = useState("profile");
  const [screen, setScreen] = useState("login");

  // Fetch full user (on login)
  const fetchUser = useCallback(async () => {
    setBalLoading(true);
    try {
      const { data } = await http.get("/users/me");
      setUser(data);
      setBalance(data.balance ?? 0);
    } catch { doLogout(); }
    finally { setBalLoading(false); }
  }, []);

  // Refresh ONLY balance (fast, call after every order/cancel)
  const refreshBalance = useCallback(async () => {
    setBalLoading(true);
    try {
      const { data } = await http.get("/users/me");
      setBalance(data.balance ?? 0);
      setUser(prev => prev ? { ...prev, balance: data.balance } : prev);
    } catch {}
    finally { setBalLoading(false); }
  }, []);

  useEffect(() => {
    if (tok) { setToken(tok); fetchUser(); }
  }, [tok]);

  // Auto-refresh balance when switching to profile or orders
  useEffect(() => {
    if (tok && (tab === "profile" || tab === "orders")) refreshBalance();
  }, [tab]);

  const doLogin = () => setTok(localStorage.getItem("tok") || "");
  const doLogout = () => {
    http.post("/logout").catch(() => {});
    localStorage.removeItem("tok");
    setTok(""); setUser(null); setBalance(0);
    setToken(null); setScreen("login");
  };

  if (!tok) {
    if (screen === "register") return <Register onBack={() => setScreen("login")} />;
    return <Login onLogin={doLogin} onRegister={() => setScreen("register")} />;
  }

  return (
    <div className="app-layout">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">P</div>
          <div className="sidebar-logo-text">Product<span>OS</span></div>
        </div>

        {/* ── LIVE BALANCE CARD ── */}
        <div className="sidebar-balance">
          <div className="sidebar-balance-label">Wallet Balance</div>
          <div className="sidebar-balance-amount">
            {balLoading ? <span style={{ opacity: .5, fontSize: 18 }}>Updating…</span> : fmtCur(balance)}
          </div>
          <div className="sidebar-balance-sub">
            {balLoading ? "Please wait" : "Available to spend"}
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(n => (
            <div key={n.id} className={`nav-item${tab === n.id ? " active" : ""}`} onClick={() => setTab(n.id)}>
              <span className="nav-item-icon">{n.icon}</span>
              <span>{n.label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user && <>
            <div className="sidebar-user-avatar">{(user.username || "??").slice(0, 2).toUpperCase()}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.username}</div>
              <div className="sidebar-user-role">{user.is_admin ? "Administrator" : "User"}</div>
            </div>
          </>}
          <button className="sidebar-logout" title="Sign out" onClick={doLogout}>⏻</button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{TITLES[tab]}</div>
          <span className="topbar-badge">ProductOS</span>
          <div className="topbar-right">
            {/* Live balance pill always visible in topbar */}
            <div className="topbar-balance">
              💰 {balLoading ? "—" : fmtCur(balance)}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={doLogout}>Sign Out</button>
          </div>
        </div>

        <div className="content">
          {tab === "profile"  && <ProfileView user={user} balance={balance} balLoading={balLoading} />}
          {tab === "products" && <ProductsView onAddProduct={() => setTab("create")} />}
          {tab === "create"   && <CreateProduct onDone={() => setTab("products")} />}
          {tab === "orders"   && <OrdersView onBalanceChange={refreshBalance} />}
          {tab === "security" && <SecurityView onLogout={doLogout} />}
        </div>
      </div>
    </div>
  );
}