// Flow 07 Growth Tools (07.1 to 07.9), 13.3 Boost Purchased, 13.4 Boost Results, 12.1 Brand Sponsorship.
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Screen, Icon, Img, Tag, Button, SectionHeader, Footnote, Avatar, fmt, usd, useMe, useToast } from '../components/ui.jsx';
import { KeyValueCard } from '../components/MoneySheets.jsx';
import { StatTile } from './Profile.jsx';
import { useStore, actions, TOOL_PRICES } from '../data/store.js';

function SheetPage({ children }) {
  const nav = useNavigate();
  return (
    <Screen nav="radar" dark noPad>
      <div style={{ paddingTop: 56 }}>
        <div className="sheet" style={{ animation: 'none', maxHeight: 'none', minHeight: 'calc(100vh - 56px)', paddingBottom: 120 }}>
          <div className="grabber" onClick={() => nav(-1)} style={{ cursor: 'pointer' }} />
          {children}
        </div>
      </div>
    </Screen>
  );
}
function Head({ tag }) {
  const nav = useNavigate();
  return (
    <div className="sheethead">
      <div className="col grow" style={{ gap: 4 }}><div className="row gap8"><h2 className="h-lg" style={{ margin: 0 }}>GROWTH TOOLS</h2></div><span className="b-sm t2">Radar-linked · live status</span></div>
      <button className="closebtn" onClick={() => nav('/studio')}><Icon name="close" size={20} /></button>
      {tag}
    </div>
  );
}
function StatStrip({ items }) {
  return (
    <div className="card row" style={{ justifyContent: 'space-between', gap: 8 }}>
      {items.map(([l, v, d], i) => (
        <div key={l} className="row" style={{ gap: 8, flex: 1 }}>
          {i > 0 && <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--border-disabled)' }} />}
          <div className="col" style={{ gap: 4 }}><span className="l-sm t2" style={{ letterSpacing: 1, fontSize: 10 }}>{l}</span><span className="row" style={{ gap: 4, alignItems: 'baseline' }}><span className="h-lg">{v}</span>{d && <span className="l-md" style={{ color: d > 0 ? 'var(--green-700)' : 'var(--red-700)' }}>{d > 0 ? '↑' : '↓'}{Math.abs(d)}</span>}</span></div>
        </div>
      ))}
    </div>
  );
}

export function GrowthTools() {
  const nav = useNavigate();
  const { tab = 'available' } = useParams();
  const s = useStore();
  const me = useMe();
  const runs = s.tool_runs.filter((r) => r.creator_id === me);
  const active = runs.filter((r) => Date.now() - new Date(r.created_at) < Math.max(1, r.hours) * 3600e3);
  const spent = runs.reduce((a, r) => a + Number(r.price), 0) + 11.99;
  const go = (t) => nav('/tools/' + t, { replace: true });
  return (
    <SheetPage>
      <div className="col gap16">
        <div className="col gap8"><Head /><span style={{ alignSelf: 'flex-start' }}><Tag>PLATINUM CREATOR</Tag></span></div>
        {tab === 'spend'
          ? <StatStrip items={[['SPENT', usd(spent)], ['VIEWS BACK', fmt(640 + runs.length * 1240)], ['PER 1,000', usd(spent / ((640 + runs.length * 1240) / 1000))]]} />
          : <StatStrip items={[['DISCOVERY RANK', '#' + Math.max(7, 58 - runs.length * 7), runs.length ? runs.length * 7 : -14], ['VIEWS 24H', fmt(1204 + runs.length * 1240)], ['ACTIVE TOOLS', active.length + 1]]} />}
        <div className="seg">
          {[['active', 'Active', active.length + 1], ['available', 'Available', 4], ['spend', 'Spend']].map(([k, l, c]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => go(k)}>{l}{c !== undefined && <span className="cnt">{c}</span>}</button>)}
        </div>
        {tab === 'available' && <Available />}
        {tab === 'active' && <Active active={active} />}
        {tab === 'spend' && <Spend runs={runs} spent={spent} />}
      </div>
    </SheetPage>
  );
}

function ToolRow({ icon, title, desc, action, locked, onClick }) {
  return (
    <div className="toolrow">
      <span className="tile-ic" style={locked ? { background: 'var(--surface-muted)' } : undefined}><Icon name={locked ? 'lock' : icon} size={20} /></span>
      <span className="col grow" style={{ gap: 4 }}><span className="l-lg">{title}</span><span className="b-sm t2">{desc}</span></span>
      <button className={'btn xs ' + (locked ? 'outlined' : 'secondary')} style={{ fontSize: 11 }} onClick={onClick}>{action}</button>
    </div>
  );
}
function Available() {
  const nav = useNavigate();
  return (
    <>
      <div>
        <ToolRow icon="bolt" title="Creator Boost" desc="Extra discovery push, within your tier" action="ACTIVATE" onClick={() => nav('/tools/boost')} />
        <ToolRow icon="campaign" title="Creator Promotion" desc="Paid placement in fan discovery feeds" action="$49.99" onClick={() => nav('/tools/promotion')} />
        <ToolRow icon="star" title="Creator Top Picks" desc="Homepage feature, category highlight" action="$89.99" onClick={() => nav('/tools/top-picks')} />
        <ToolRow icon="podcasts" title="Creator Signal" desc="Spotlight window, free-message open" action="$9.99" onClick={() => nav('/tools/signal')} />
      </div>
      <div className="alert"><span className="aic"><Icon name="warning" size={14} /></span><div className="col" style={{ gap: 4 }}><span className="l-md" style={{ color: 'var(--yellow-800)' }}>Radar flagged a rank dip</span><span className="b-sm">Discovery rank fell 14 spots this week. Creator Promotion targets exactly this.</span></div></div>
      <Footnote>Spend this week $29.98 · returned 640 views.</Footnote>
    </>
  );
}
function Active({ active }) {
  const nav = useNavigate();
  const s = useStore();
  return (
    <>
      {active.length === 0 && <div className="card b-sm t2">No paid tools running. Start one from Available.</div>}
      {active.map((r) => {
        const post = s.posts.find((p) => p.id === r.post_id);
        const left = Math.max(0, new Date(r.created_at).getTime() + Math.max(1, r.hours) * 3600e3 - Date.now());
        const done = Math.min(1, (Date.now() - new Date(r.created_at)) / (Math.max(1, r.hours) * 3600e3));
        return (
          <button key={r.id} className="card col gap12" style={{ textAlign: 'left', boxShadow: 'inset 4px 0 0 var(--success), inset 0 0 0 1px var(--border-disabled)' }} onClick={() => nav(r.tool === 'boost' ? '/tools/boost/results/' + r.id : r.tool === 'signal' ? '/tools/signal' : r.tool === 'promotion' ? '/tools/promotion/running' : '/tools/available')}>
            <div className="row gap12"><span className="col grow" style={{ gap: 2 }}><span className="l-lg">Creator {TOOL_PRICES[r.tool]?.label}</span><span className="b-sm t2">{post ? post.title : 'Your profile'}</span></span><Tag tone="success">{left > 3600e3 ? Math.round(left / 3600e3) + 'h left' : Math.round(left / 60e3) + 'm left'}</Tag></div>
            <div className="row gap8" style={{ alignItems: 'baseline' }}><span className="h-lg">{fmt(Math.round(240 + done * 2200))}</span><span className="b-sm t2">views so far</span></div>
          </button>
        );
      })}
      <div className="card col gap8">
        <div className="row"><span className="col grow" style={{ gap: 2 }}><span className="l-lg">Creator PLUS</span><span className="b-sm t2">Analytics, scheduling, Radar breakdown</span></span><Tag tone="neutral">ONGOING</Tag></div>
        <div className="row"><span className="b-xs t2 grow">Renews monthly · $11.99/mo</span><span className="l-md">Manage</span></div>
      </div>
      <div className="alert success"><span className="aic"><Icon name="check" size={14} /></span><div className="col" style={{ gap: 4 }}><span className="l-md">Radar: the stack is working</span><span className="b-sm">Rank climbed while your tools ran together. Creator Pulse would convert that reach into direct fan replies.</span></div></div>
    </>
  );
}
function Spend({ runs, spent }) {
  const by = {};
  for (const r of runs) { by[r.tool] = by[r.tool] || [0, 0]; by[r.tool][0]++; by[r.tool][1] += Number(r.price); }
  const rows = Object.entries(by).map(([k, [n, v]]) => [`Creator ${TOOL_PRICES[k].label}`, `${n} run${n > 1 ? 's' : ''} · ${fmt(n * 1240)} views`, v, `${usd(v / (n * 1.24))} / 1k`]);
  return (
    <div className="card col" style={{ gap: 4 }}>
      {[...rows, ['Creator PLUS', 'Tooling · no reach', 11.99, '—']].map(([t, c, v, per]) => (
        <div key={t} className="row gap12" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-disabled)' }}><span className="col grow" style={{ gap: 2 }}><span className="l-lg">{t}</span><span className="b-xs t2">{c}</span></span><span className="col right" style={{ gap: 2 }}><span className="amt">{usd(v)}</span><span className="b-xs t2">{per}</span></span></div>
      ))}
      <div className="row" style={{ padding: '10px 0 0' }}><span className="l-lg-b grow">Total</span><span className="amt">{usd(spent)}</span></div>
    </div>
  );
}

// ---------- 07.4 Post Performance ----------
export function PostPerformance() {
  const nav = useNavigate();
  const { id } = useParams();
  const s = useStore();
  const post = s.posts.find((p) => String(p.id) === id) || s.posts.find((p) => p.creator_id === 'sam');
  const tips = s.tips.filter((t) => t.creator_id === post.creator_id);
  const views = post.views || 240 + Math.round((Date.now() - new Date(post.created_at)) / 60e3) * 7;
  const runs = s.tool_runs.filter((r) => r.post_id === post.id);
  const src = [['Fitness category', 'Blue', .34], ['Trending & New', 'Yellow', .27], ['For You', 'Neutral', .16], ['Top Picks', 'Green', .09], ['Boost', 'Red', runs.length ? .14 : .08], ['Web', 'Neutral', .06]];
  const C = { Yellow: 'var(--primary)', Blue: 'var(--info)', Red: 'var(--error)', Green: 'var(--success)', Neutral: 'var(--text-2)' };
  const topTip = tips[tips.length - 1];
  return (
    <SheetPage>
      <div className="col" style={{ gap: 14 }}>
        <div className="row gap12"><span className="thumb"><Img src={post.media} /></span><span className="col grow" style={{ gap: 2 }}><span className="l-lg">{post.title}</span><span className="b-xs t2">{post.kind[0].toUpperCase() + post.kind.slice(1)} · {new Date(post.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span></span><button className="closebtn" onClick={() => nav(-1)}><Icon name="close" size={20} /></button></div>
        <div className="card row gap12"><span className="col grow" style={{ gap: 0 }}><span className="h-xl">{fmt(views)}</span><span className="l-sm t2">VIEWS</span></span><span className="col right" style={{ gap: 0 }}><span className="l-lg" style={{ color: 'var(--green-700)' }}>+38%</span><span className="b-xs t2">vs your average</span></span></div>
        <span className="eyebrow">WHERE THEY CAME FROM</span>
        <div>{src.map(([n, c, p]) => <div key={n} className="srcrow"><span className="dot" style={{ background: C[c] }} /><span className="l-lg-t grow">{n}</span><span className="l-lg-t">{Math.round(p * 100)}%</span><span className="b-xs t2" style={{ width: 44, textAlign: 'right' }}>{fmt(Math.round(views * p))}</span></div>)}</div>
        <span className="eyebrow">ENGAGEMENT</span>
        <div className="grid3">
          <StatTile l="FANS" v={fmt(Math.round(views * .11))} />
          <StatTile l="NON-FANS" v={fmt(Math.round(views * .89))} />
          <StatTile l="SUBS" v={96 + s.subscriptions.filter((x) => x.creator_id === post.creator_id).length} />
          <StatTile l="LIKES" v={fmt(post.likes)} />
          <StatTile l="SHARES" v="62" />
          <StatTile l="TIPS" v={'$' + (148 + tips.reduce((a, t) => a + t.amount, 0) / 100).toFixed(0)} />
        </div>
        <span className="eyebrow">TOP FAN ON THIS POST</span>
        <div className="card row gap16" style={{ padding: '8px 16px' }}>
          <Avatar p={topTip ? s.profiles[topTip.fan_id] : s.profiles.rae} size={32} ring={false} />
          <span className="col grow" style={{ gap: 2 }}><span className="l-lg" style={{ letterSpacing: .5 }}>@{topTip ? s.profiles[topTip.fan_id].handle : 'rae.k'}</span><span className="b-xs t2">{topTip ? 'Tipped · ' + (topTip.note || 'no note') : 'Tipped · shared 4'}</span></span>
          <span className="l-lg">${topTip ? (topTip.amount / 100).toFixed(0) : 40}</span>
        </div>
        <Button onClick={() => nav('/tools/boost?post=' + post.id)}>Boost this post · from $14.99</Button>
      </div>
    </SheetPage>
  );
}

// ---------- 07.5 to 07.9 setup screens ----------
function HeroHead({ title, sub, live }) {
  const nav = useNavigate();
  return (
    <div className="herohead">
      <div className="row" style={{ justifyContent: 'space-between' }}><button className="back" onClick={() => nav(-1)}>BACK</button>{live && <span className="livepill">LIVE</span>}</div>
      <span className="h-xl">{title}</span>
      <span className="b-sm ti2">{sub}</span>
    </div>
  );
}
function Option({ on, onClick, title, sub, price, stack }) {
  return (
    <button className={'optcard' + (stack ? ' stack' : '') + (on ? ' on' : '')} onClick={onClick}>
      <span className="col grow" style={{ gap: 4 }}><span className="l-md">{title}</span>{price && <span className="l-sm t2">{price}</span>}<span className="b-xs t2">{sub}</span></span>
      {!stack && <span className="ind"><Icon name="check" size={14} /></span>}
    </button>
  );
}
function Highlight({ head, value, metrics }) {
  return (
    <div className="card dark p24 col gap16">
      <span className="b-xs">{head}</span>
      <span className="h-xl">{value}</span>
      <div className="divider" />
      <div className="row" style={{ justifyContent: 'space-between' }}>{metrics.map(([l, v]) => <span key={l} className="col" style={{ gap: 4 }}><span className="b-xs">{l}</span><span className="amt">{v}</span></span>)}</div>
    </div>
  );
}
function useBest() {
  const s = useStore();
  const me = useMe();
  return s.posts.filter((p) => p.creator_id === me).sort((a, b) => b.views - a.views)[0];
}

export function BoostSetup() {
  const nav = useNavigate();
  const me = useMe();
  const s = useStore();
  const best = useBest();
  const qp = new URLSearchParams(location.hash.split('?')[1] || '');
  const chosen = s.posts.find((p) => String(p.id) === qp.get('post')) || best;
  const [what, setWhat] = useState(qp.get('post') ? 'post' : 'profile');
  const [h, setH] = useState(48);
  const [busy, setBusy] = useState(false);
  const price = h === 24 ? 14.99 : 19.99;
  const buy = async () => {
    setBusy(true);
    const postId = what === 'post' ? chosen.id : null;
    const rid = await actions.buyTool(me, postId, 'boost', h, price);
    sessionStorage.setItem('sj-boost', JSON.stringify({ postId, h, price, title: what === 'post' ? chosen.title : 'Your profile' }));
    setBusy(false);
    nav('/tools/boost/done', { replace: true });
    return rid;
  };
  return (
    <Screen nav="radar" inverseStatus>
      <HeroHead title={<>CREATOR<br />BOOST</>} sub="Lifts you inside the Platinum pool on Category and Trending. Your tier doesn't change." />
      <div className="col gap16 mt24">
        <SectionHeader title="What to boost" />
        <Option on={what === 'profile'} onClick={() => setWhat('profile')} title="My profile" sub="Sends fans to your profile" />
        <Option on={what === 'post'} onClick={() => setWhat('post')} title={chosen.title} sub={`Photo · ${(chosen.views / 1000).toFixed(1)}K views · ${chosen.id === best.id ? 'your best this week' : 'your latest'}`} />
        <SectionHeader title="How long" />
        <div className="row gap12">
          <Option stack on={h === 24} onClick={() => setH(24)} title="24 hours" price="$14.99" sub="Est. 900 – 1,400 in pool" />
          <Option stack on={h === 48} onClick={() => setH(48)} title="48 hours" price="$19.99" sub="Est. 1,800 – 2,600 in pool" />
        </div>
        <Highlight head="ESTIMATED REACH" value={h === 24 ? '900 – 1,400' : '1,800 – 2,600'} metrics={[['PER 1,000', '$8.90'], ['EST. NEW FANS', h === 24 ? '7 – 15' : '14 – 30'], ['POOL', 'Platinum']]} />
        <Button onClick={buy} disabled={busy}>{busy ? 'Starting…' : `Boost now · ${usd(price)}`}</Button>
      </div>
    </Screen>
  );
}

export function BoostDone() {
  const nav = useNavigate();
  const s = useStore();
  const me = useMe();
  const b = (() => { try { return JSON.parse(sessionStorage.getItem('sj-boost')); } catch { return null; } })() || { title: 'Morning Flow', h: 48, price: 19.99 };
  const run = s.tool_runs.filter((r) => r.creator_id === me && r.tool === 'boost').sort((a, z) => z.created_at.localeCompare(a.created_at))[0];
  const post = s.posts.find((p) => p.id === b.postId);
  return (
    <Screen nonav>
      <div className="col gap12 mt24" style={{ alignItems: 'center' }}>
        <span className="success-mark"><Icon name="bolt" size={36} /></span>
        <span className="h-lg center">Boost is live</span>
        <span className="b-sm t2 center">{b.title} is lifted in Fitness and Trending for {b.h} hours. Fans see a Boosted tag on it.</span>
      </div>
      <div className="card bordered row gap12 mt16" style={{ padding: 12 }}>
        <span className="thumb">{post?.media && <Img src={post.media} />}</span>
        <span className="col grow" style={{ gap: 2 }}><span className="l-lg-b">{b.title}</span><span className="b-xs t2">{post ? 'Photo' : 'Profile'} · Boosted for {b.h} hours</span></span>
      </div>
      <div className="receipt"><span className="col grow" style={{ gap: 2 }}><span className="l-lg-b">Boost</span><span className="b-xs t2">{b.h} hours, running</span></span><span className="amt">{usd(b.price)}</span></div>
      <div className="receipt"><span className="col grow" style={{ gap: 2 }}><span className="l-lg-b">Charged</span><span className="b-xs t2">From your balance</span></span><span className="amt">{usd(b.price)}</span></div>
      <div className="col gap12 mt20">
        <Button onClick={() => nav('/tools/boost/results/' + (run?.id || 0), { replace: true })}>View boost results</Button>
        <Button kind="text" onClick={() => nav('/studio')}>Back to profile</Button>
      </div>
    </Screen>
  );
}

export function BoostResults() {
  const nav = useNavigate();
  const { id } = useParams();
  const s = useStore();
  const run = s.tool_runs.find((r) => String(r.id) === id);
  const post = run && s.posts.find((p) => p.id === run.post_id);
  const elapsed = run ? Math.min(1, (Date.now() - new Date(run.created_at)) / (run.hours * 3600e3)) : 1;
  const [tick, setTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTick((t) => t + 1), 3000); return () => clearInterval(i); }, []);
  const imp = run ? Math.round(180 + elapsed * 2230 + tick * 7) : 2410;
  const ended = !run || elapsed >= 1;
  const fans = Math.round(imp / 39);
  return (
    <Screen nav="radar" inverseStatus>
      <HeroHead live={!ended} title={<>BOOST<br />RESULTS</>} sub={`${post ? post.title : run ? 'Your profile' : 'Morning Flow'} · ${run?.hours || 48} hours, ${ended ? 'finished' : 'running'}`} />
      <div className="col gap16 mt24">
        <div className="card bordered col gap12">
          <div className="row"><span className="col grow" style={{ gap: 2 }}><span className="l-lg-b">IMPRESSIONS</span><span className="b-xs t2">Of an estimated 1,800 – 2,600</span></span><span className="h-xl">{fmt(imp)}</span></div>
          <div className="row gap12"><div className="progress"><i style={{ width: Math.min(100, imp / 26) + '%' }} /></div><span className="b-xs t2">{ended ? 'Ended' : Math.round((1 - elapsed) * (run?.hours || 48)) + 'h left'}</span></div>
        </div>
        <div className="statgrid">
          <StatTile l="NEW FANS" v={fans} />
          <StatTile l="PROFILE VISITS" v={fmt(Math.round(imp / 6.2))} />
          <StatTile l="SUB CLICKS" v={Math.round(fans * .66)} />
          <StatTile l="COST PER FAN" v={'$' + (19.99 / Math.max(1, fans)).toFixed(2)} />
        </div>
        <SectionHeader title={ended ? 'Where it showed' : "Where it's showing"} />
        <KeyValueCard rows={[['Category browse', 'Fans browsing Fitness', fmt(Math.round(imp * .61))], ['For You', 'Fans matched to Fitness', fmt(Math.round(imp * .39))]]} />
        <Button onClick={() => nav('/tools/boost' + (post ? '?post=' + post.id : ''))}>Boost again · $19.99</Button>
      </div>
    </Screen>
  );
}

export function PromotionSetup() {
  const nav = useNavigate();
  const me = useMe();
  const best = useBest();
  const [what, setWhat] = useState('post');
  const buy = async () => { await actions.buyTool(me, what === 'post' ? best.id : null, 'promotion', 72, 49.99); nav('/tools/promotion/running', { replace: true }); };
  return (
    <Screen nav="radar" inverseStatus>
      <HeroHead title={<>CREATOR<br />PROMOTION</>} sub="Paid placement in Fitness discovery, shown to fans who do not follow you yet." />
      <div className="col gap16 mt24">
        <SectionHeader title="What to promote" />
        <Option on={what === 'profile'} onClick={() => setWhat('profile')} title="My profile" sub="Sends fans to your profile" />
        <Option on={what === 'post'} onClick={() => setWhat('post')} title={best.title} sub={`Photo · ${(best.views / 1000).toFixed(1)}K views · your best this week`} />
        <SectionHeader title="Who sees it" />
        <div className="card col gap16">{[['Category', 'Fitness'], ['Audience', 'Not following you']].map(([a, b]) => <div key={a} className="row" style={{ justifyContent: 'space-between' }}><span className="b-sm t2">{a}</span><span className="l-md">{b}</span></div>)}</div>
        <Highlight head="ESTIMATED REACH" value="4,800–7,200" metrics={[['PER 1,000', '$8.20'], ['EST. NEW FANS', '40–90'], ['DURATION', '3 days']]} />
        <Button onClick={buy}>Confirm · $49.99</Button>
      </div>
    </Screen>
  );
}

export function PromotionRunning() {
  const nav = useNavigate();
  const me = useMe();
  const best = useBest();
  const s = useStore();
  const run = s.tool_runs.filter((r) => r.creator_id === me && r.tool === 'promotion').sort((a, z) => z.created_at.localeCompare(a.created_at))[0];
  const el = run ? Math.min(1, (Date.now() - new Date(run.created_at)) / (72 * 3600e3)) : .44;
  const reach = Math.round(320 + el * 6000);
  return (
    <Screen nav="radar" inverseStatus>
      <HeroHead live title={<>CREATOR<br />PROMOTION</>} sub={`${best.title} · running in Fitness discovery`} />
      <div className="col gap16 mt24">
        <div className="card bordered col gap12">
          <div className="row"><span className="col grow" style={{ gap: 2 }}><span className="l-lg-b">REACH DELIVERED</span><span className="b-xs t2">Of an estimated 4,800 – 7,200</span></span><span className="h-xl">{fmt(reach)}</span></div>
          <div className="row gap12"><div className="progress"><i style={{ width: Math.min(100, reach / 72) + '%' }} /></div><span className="b-xs t2">{Math.round((1 - el) * 72)}h left</span></div>
        </div>
        <div className="statgrid">
          <StatTile l="NEW FANS" v={Math.round(reach / 37)} />
          <StatTile l="PROFILE VISITS" v={Math.round(reach / 6)} />
          <StatTile l="COST PER FAN" v={'$' + (49.99 / Math.max(1, reach / 37)).toFixed(2)} />
          <StatTile l="PER 1,000" v={'$' + (49.99 / (reach / 1000)).toFixed(2)} />
        </div>
        <SectionHeader title="Where it's showing" />
        <KeyValueCard rows={[['Category browse', 'Fans browsing Fitness', fmt(Math.round(reach * .7))], ['For You', 'Fans matched to Fitness', fmt(Math.round(reach * .3))]]} />
        <Button onClick={() => nav('/tools/promotion')}>Extend 3 more days · $49.99</Button>
      </div>
    </Screen>
  );
}

export function TopPicksSetup() {
  const nav = useNavigate();
  const me = useMe();
  const toast = useToast();
  const best = useBest();
  const [slot, setSlot] = useState('19:00');
  const [what, setWhat] = useState('profile');
  const slots = [['19:00', 'PEAK', 3], ['20:00', 'PEAK', 5], ['21:00', 'EVENING', 6], ['22:00', 'LATE', 7]];
  const book = async () => { await actions.buyTool(me, what === 'post' ? best.id : null, 'top_picks', 1, 89.99); toast(`Booked ${slot} in the Fitness rail`); nav('/tools/active', { replace: true }); };
  return (
    <Screen nav="radar" inverseStatus>
      <HeroHead title={<>CREATOR<br />TOP PICKS</>} sub="Seven creators fill the Fitness rail each hour. Book earlier to sit further left." />
      <div className="col gap16 mt24">
        <SectionHeader title="Pick your slot" />
        <div className="row gap8">{slots.map(([t, l, n]) => <button key={t} className={'slot' + (slot === t ? ' on' : '')} onClick={() => setSlot(t)}><span className="l-lg-b">{t}</span><span className="l-xs">{l}</span><span className="b-xs" style={{ opacity: .7 }}>{n} left</span></button>)}</div>
        <SectionHeader title="What fans see" />
        <Option on={what === 'profile'} onClick={() => setWhat('profile')} title="My profile" sub="Your cover shot and tagline" />
        <Option on={what === 'post'} onClick={() => setWhat('post')} title={best.title} sub={`Photo · ${(best.views / 1000).toFixed(1)}K views · your best this week`} />
        <Highlight head="ESTIMATED REACH" value="4,200 – 6,800" metrics={[['POSITION', '5th of 7'], ['PER 1,000', '$15.40'], ['EST. NEW FANS', '30 – 70']]} />
        <Button onClick={book}>Book {slot} · $89.99</Button>
      </div>
    </Screen>
  );
}

export function SignalLive() {
  const me = useMe();
  const s = useStore();
  const nav = useNavigate();
  const run = s.tool_runs.filter((r) => r.creator_id === me && r.tool === 'signal').sort((a, z) => z.created_at.localeCompare(a.created_at))[0];
  const left = run ? new Date(run.created_at).getTime() + 8 * 3600e3 - Date.now() : 0;
  const live = left > 0;
  const [, setT] = useState(0);
  useEffect(() => { const i = setInterval(() => setT((x) => x + 1), 30000); return () => clearInterval(i); }, []);
  const start = () => actions.buyTool(me, null, 'signal', 8, 9.99);
  const fans = s.tips.filter((t) => t.creator_id === me).length;
  return (
    <Screen nav="radar" inverseStatus>
      <HeroHead live={live} title={<>CREATOR<br />SIGNAL</>} sub="Free message window · Fitness" />
      <div className="col gap16 mt24">
        <div className="card dark p24 col gap12">
          <div className="row" style={{ justifyContent: 'space-between' }}><span className="livepill" style={live ? undefined : { background: 'var(--surface-muted)' }}>{live ? 'SIGNAL LIVE' : 'NOT LIVE'}</span><span className="h-lg">{live ? `${Math.floor(left / 3600e3)}:${String(Math.floor(left / 60e3) % 60).padStart(2, '0')}` : '8:00'}</span></div>
          <span className="l-md" style={{ color: 'var(--primary)' }}>FREE MESSAGES ARE {live ? 'OPEN' : 'CLOSED'}</span>
          <span className="b-sm">“I’m live for the next 8 hours. Ask me anything about training, mobility or recovery.”</span>
          <div className="row" style={{ justifyContent: 'space-between' }}>{[['MESSAGES', live ? 34 : 0], ['NEW FANS', live ? 11 + fans : 0], ['NEW SUBS', live ? 3 : 0]].map(([l, v]) => <span key={l} className="col"><span className="h-lg">{v}</span><span className="l-xs ti2">{l}</span></span>)}</div>
        </div>
        {live ? (
          <div className="card dark row gap12"><span className="col grow" style={{ gap: 6 }}><span className="l-lg-b">27 waiting on a reply</span><span className="b-xs ti2">Replies during the window convert best. Most subs happen in the first exchange.</span></span><button className="btn primary xs" onClick={() => nav('/messages')}>OPEN</button></div>
        ) : (
          <Button onClick={start}>Go live · $9.99</Button>
        )}
        <SectionHeader title="While it's running" />
        <KeyValueCard rows={[['Profile visits', '1,240 normally 310', '4×'], ['Reach in Fitness', 'Lifted while live', '+2,180'], ['Cost per new fan', '$9.99 ÷ 11 so far', '$0.91']]} />
        {live && <Footnote>Fans see a Signal Live card on your profile and can message you free while it runs.</Footnote>}
      </div>
    </Screen>
  );
}

// ---------- 12.1 Brand Sponsorship ----------
export function Sponsorship() {
  const nav = useNavigate();
  const s = useStore();
  const me = useMe();
  const c = s.profiles[me];
  const toast = useToast();
  return (
    <Screen nav="radar" inverseStatus>
      <div className="herohead">
        <button className="back" onClick={() => nav(-1)}>BACK</button>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}><span className="h-xl">BRAND<br />SPONSORSHIP</span><Tag>$3,000</Tag></div>
        <span className="b-sm ti2">AYBL · Summer Drop 2026 · ends 30 Jun</span>
      </div>
      <div className="card row gap12 mt16">
        <Avatar p={c} size={52} />
        <div className="col grow" style={{ gap: 6 }}><span className="h-md" style={{ fontWeight: 600 }}>{c.name}</span><span className="row gap8"><Tag tone="neutral">{c.category}</Tag><Tag>{c.tier}</Tag></span></div>
        <div className="col right" style={{ gap: 2 }}><span className="h-md" style={{ fontWeight: 600 }}>#7</span><span className="l-xs t2">IN FITNESS</span></div>
      </div>
      <div className="card bordered col gap12 mt16">
        <div className="row"><span className="col grow" style={{ gap: 2 }}><span className="l-lg-b">ENGAGED IMPRESSIONS</span><span className="b-xs t2">Of 60,000 committed</span></span><span className="h-xl">41,800</span></div>
        <div className="row gap12"><div className="progress"><i style={{ width: '70%' }} /></div><span className="b-xs t2">12d left</span></div>
      </div>
      <div className="statgrid mt16">
        <StatTile l="ENGAGEMENTS" v="5,910" c="14.1% · 6× category avg" />
        <StatTile l="PROFILE VISITS" v="2,240" c="From brand posts" />
        <StatTile l="NEW FANS" v="168" c="Since the campaign" />
        <StatTile l="PER ENGAGEMENT" v="$0.51" c="$3,000 ÷ 5,910" />
      </div>
      <div className="card col gap12 mt16">
        <span className="h-md" style={{ fontWeight: 600 }}>ACTIVITY</span>
        {[['MorningFlow', '4d ago', '18.4K'], ['MobilityReset', '9d ago', '14.1K']].map(([a, b, v]) => <div key={a} className="row gap12"><span className="badge-round muted sm"><Icon name="image" size={16} /></span><span className="col grow" style={{ gap: 0 }}><span className="l-md">#{a}</span><span className="b-xs t2">@{c.handle} · {b}</span></span><span className="l-md">{v}</span></div>)}
      </div>
      <div className="row gap12 mt16"><Button kind="outlined" onClick={() => nav('/messages')}>Message</Button><Button onClick={() => toast('Extension request sent to AYBL')}>Extend</Button></div>
    </Screen>
  );
}
