import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ICONS from '../lib/icons.js';
import { useSession, DEMO_USERS } from '../data/store.js';

// ---------- formatting ----------
export const fmt = (n) => Number(n || 0).toLocaleString('en-US');
export const usd = (n) => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const jToUsd = (j) => usd(j / 100);
export const short = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.0', '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1).replace('.0', '') + 'K' : String(n));
export function ago(iso) {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

// ---------- icons and images ----------
export function Icon({ name, size = 20, style, className = '' }) {
  const d = ICONS[name];
  if (!d) return <span style={{ width: size, height: size, display: 'inline-block' }} />;
  return (
    <svg className={'ic ' + className} width={size} height={size} viewBox="0 -960 960 960" style={style} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
let seedN = 0;
export function Img({ src, alt = '', seed, style, className }) {
  const [s, setS] = useState(src);
  useEffect(() => setS(src), [src]);
  const fb = `https://picsum.photos/seed/${encodeURIComponent(seed || src || 'sj' + seedN++)}/600/800`;
  if (!s) return null;
  return <img src={s} alt={alt} style={style} className={className} loading="lazy" onError={() => setS(s !== fb && !s.startsWith('data:') ? fb : null)} />;
}
export function Hex({ size = 56, color = 'var(--primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" style={{ flex: 'none' }}>
      <path d="M50.749 14.8652V41.1338L28 54.2676L5.25098 41.1338V14.8652L28 1.73145L50.749 14.8652Z" stroke={color} strokeWidth="3" />
      <path d="M25.6437 36.5316L33.1999 27.4587H28.3249L29.2999 19.7128L22.4478 29.6253H26.6187L25.6437 36.5316ZM23.6666 38.8337L24.7499 31.2503H19.3333L29.0833 17.167H31.2499L30.1666 25.8337H36.6666L25.8333 38.8337H23.6666Z" fill={color} />
    </svg>
  );
}
export function JCoin({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ flex: 'none' }}>
      <path d="M36.3203 10.5771V29.4219L20 38.8447L3.67969 29.4219V10.5771L20 1.1543L36.3203 10.5771Z" fill="#FEE70D" stroke="#8A7F00" strokeWidth="2" />
      <path d="M16.6666 28.3337L17.5 22.5003H13.3333L20.8333 11.667H22.5L21.6666 18.3337H26.6666L18.3333 28.3337H16.6666Z" fill="#111111" />
    </svg>
  );
}
export function CoinCircle({ size = 32, icon = 20 }) {
  return <span className="badge-round" style={{ width: size, height: size }}><Icon name="bolt" size={icon} /></span>;
}
export function BrandMark({ size = 72 }) {
  return (
    <svg className="brandmark" width={size} height={size * 86 / 73} viewBox="0 0 73 86" fill="none">
      <path d="M28.6446 1.38681C27.7747 1.38466 26.9687 1.84493 26.5285 2.59557L1.72231 44.5219C1.43009 45.0201 1.32377 45.6058 1.42205 46.1749C1.52034 46.7441 1.81678 47.2602 2.25891 47.632C2.70131 48.0035 3.26065 48.2066 3.83842 48.2053H22.3775L13.8558 81.5035C13.6733 82.2018 13.8087 82.9451 14.2254 83.5343C14.6421 84.1235 15.2976 84.4988 16.0167 84.5594C16.7358 84.6201 17.4448 84.3601 17.9544 83.8492L70.1319 31.7755C70.5886 31.316 70.8442 30.694 70.8431 30.0463C70.8417 29.3983 70.5838 28.7775 70.1254 28.3199C69.6671 27.8623 69.0457 27.6051 68.3981 27.6048H44.6953L58.6295 5.12221C58.9381 4.62479 59.0581 4.03288 58.9676 3.45428C58.8769 2.8759 58.5818 2.34901 58.1359 1.96935C57.69 1.58998 57.1228 1.38313 56.5372 1.38639L28.6446 1.38681Z" fill="#FEE70D" stroke="#0A0A0A" strokeWidth="2.77275" />
    </svg>
  );
}
export function Avatar({ p, size = 44, ring = true }) {
  if (!p) return null;
  if (!p.avatar) return <span className="av initials" style={{ width: size, height: size }}>{p.name.slice(0, 4).toUpperCase()}</span>;
  if (!ring) return <span className="av" style={{ width: size, height: size }}><Img src={p.avatar} seed={p.id} /></span>;
  const t = (p.tier || '').toLowerCase();
  return <span className={'av ring ' + t} style={{ width: size, height: size, padding: size > 50 ? 5 : 4 }}><span className="in"><Img src={p.avatar} seed={p.id} /></span></span>;
}

// ---------- layout ----------
export function StatusBar({ inverse, abs }) {
  const [t, setT] = useState(() => clock());
  useEffect(() => { const i = setInterval(() => setT(clock()), 20000); return () => clearInterval(i); }, []);
  return (
    <div className={'status' + (inverse ? ' inv' : '') + (abs ? ' abs' : '')}>
      <span className="time">{t}</span>
      <span className="status-icons">
        <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="6" rx="1" /><rect x="10" y="3" width="3" height="8" rx="1" /><rect x="15" y="0" width="3" height="11" rx="1" /></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 4.2a10 10 0 0 1 14 0M3.5 6.8a6.3 6.3 0 0 1 9 0" /><circle cx="8" cy="10" r="1.3" fill="currentColor" stroke="none" /></svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="currentColor"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".6" /><rect x="3" y="3" width="17" height="6" rx="1.5" /><rect x="24" y="4" width="2" height="4" rx="1" opacity=".6" /></svg>
      </span>
    </div>
  );
}
function clock() { const d = new Date(); return d.getHours() % 12 === 0 ? '12:' + String(d.getMinutes()).padStart(2, '0') : (d.getHours() % 12) + ':' + String(d.getMinutes()).padStart(2, '0'); }

export function Screen({ children, nav, dark, inverseStatus, noPad, className = '', nonav }) {
  const loc = useLocation();
  return (
    <>
      <div className={'screen' + (dark ? ' dark' : '')} key={loc.pathname}>
        <StatusBar inverse={inverseStatus ?? dark} abs={noPad} />
        <div className={(noPad ? '' : 'pad ') + (nonav || !nav ? 'nonav ' : '') + className} style={noPad ? undefined : { paddingTop: 12 }}>
          {children}
        </div>
      </div>
      {nav && <BottomNav active={nav} />}
    </>
  );
}

export function FlowHeader({ back = true, action, onAction, onBack }) {
  const nav = useNavigate();
  return (
    <div className="flowhead">
      {back ? <button onClick={onBack || (() => nav(-1))}><Icon name="arrow_back" size={14} />BACK</button> : <span />}
      {action && <button onClick={onAction}>{action}</button>}
    </div>
  );
}
export function Intro({ title, sub }) {
  return (
    <div className="intro">
      <h1 className="h-xl up">{title}</h1>
      {sub && <p className="b-sm t2">{sub}</p>}
    </div>
  );
}
export function Footnote({ children, icon = 'info' }) {
  return <div className="footnote">{icon && <Icon name={icon} size={12} />}<span>{children}</span></div>;
}
export function SectionHeader({ title, action, onAction }) {
  return (
    <div className="sechead">
      <h2 className="h-lg up" style={{ margin: 0 }}>{title}</h2>
      {action && (onAction ? <button className="l-md" onClick={onAction}>{action}</button> : <span className="l-md">{action}</span>)}
    </div>
  );
}
export function Button({ kind = 'primary', size, full = true, children, icon, className = '', ...rest }) {
  return (
    <button className={`btn ${kind} ${size || ''} ${full ? 'full' : ''} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={16} />}{children}
    </button>
  );
}
export function Tag({ tone = 'brand', children, icon }) {
  return <span className={'tag ' + tone}>{icon && <Icon name={icon} size={11} />}{children}</span>;
}
export function Step({ n, title, desc }) {
  return (
    <div className="step">
      <span className="bdg">{n ?? <Icon name="bolt" size={13} />}</span>
      <div className="col gap4" style={{ gap: 2 }}>
        <span className="l-md-b">{title}</span>
        <span className="b-sm t2">{desc}</span>
      </div>
    </div>
  );
}

// ---------- bottom nav ----------
export function BottomNav({ active }) {
  const nav = useNavigate();
  const { role } = useSession();
  const creator = role === 'creator';
  const items = creator
    ? [['home', 'HOME', '/home'], ['explore', 'EXPLORE', '/explore'], ['mid', 'RADAR', '/radar'], ['chat_bubble', 'MESSAGES', '/messages'], ['person', 'PROFILE', '/studio']]
    : [['home', 'HOME', '/home'], ['explore', 'EXPLORE', '/explore'], ['mid', 'J COIN', '/wallet'], ['chat_bubble', 'MESSAGES', '/messages'], ['person', 'PROFILE', '/me']];
  return (
    <nav className="bnav">
      {items.map(([icon, label, to]) => {
        const key = label.toLowerCase();
        const on = active === key || (icon === 'mid' && (active === 'radar' || active === 'wallet'));
        if (icon === 'mid') return (
          <button key={label} className="mid" onClick={() => nav(to)}>
            <span className="fab">{creator ? <Icon name="radar" size={26} /> : <Icon name="bolt" size={26} />}</span>
            <span>{label}</span>
          </button>
        );
        return (
          <button key={label} className={on ? 'on' : ''} onClick={() => nav(to)}>
            <Icon name={icon} size={22} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ---------- sheets ----------
export function Sheet({ onClose, children, tall }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="scrim" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={'sheet' + (tall ? ' tall' : '')}>
        <div className="grabber" />
        {children}
      </div>
    </div>
  );
}
export function SheetHeader({ title, sub, tag, onClose }) {
  return (
    <div className="sheethead">
      <div className="grow col" style={{ gap: 4 }}>
        <div className="row gap8"><h2 className="h-lg up" style={{ margin: 0 }}>{title}</h2>{tag && <Tag>{tag}</Tag>}</div>
        {sub && <span className="b-sm t2">{sub}</span>}
      </div>
      {onClose && <button className="closebtn" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>}
    </div>
  );
}

// ---------- toast ----------
const ToastCtx = createContext(() => {});
export function ToastHost({ children }) {
  const [msg, setMsg] = useState(null);
  const show = useCallback((m) => { setMsg(m); setTimeout(() => setMsg(null), 2600); }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && <div className="toast"><Icon name="check_circle" size={20} style={{ color: 'var(--primary)' }} /><span className="b-sm">{msg}</span></div>}
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

export function useMe() {
  const { role } = useSession();
  return role === 'creator' ? DEMO_USERS.creator : DEMO_USERS.fan;
}
