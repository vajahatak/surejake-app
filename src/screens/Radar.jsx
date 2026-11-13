// Flow 06 Creator Radar: Health, Revenue (+ detail), Reach, Discovery, Fans. Numbers mix a seeded baseline with live fan activity.
import { useNavigate, useParams } from 'react-router-dom';
import { Screen, Icon, Hex, Tag, SectionHeader, fmt, usd, useMe, Avatar } from '../components/ui.jsx';
import { KeyValueCard } from '../components/MoneySheets.jsx';
import { useStore, creatorLive } from '../data/store.js';

const TABS = [['health', 'RADAR'], ['revenue', 'REVENUE'], ['reach', 'REACH'], ['discovery', 'DISCOVERY'], ['fans', 'FANS']];
const COLORS = { Yellow: 'var(--primary)', Blue: 'var(--info)', Red: 'var(--error)', Green: 'var(--success)', Neutral: 'var(--text-2)', Purple: 'var(--purple-500)', Orange: 'var(--orange-500)' };

export function Radar() {
  const nav = useNavigate();
  const { tab = 'health' } = useParams();
  return (
    <Screen nav="radar">
      <div className="hscroll">{TABS.map(([k, l]) => <button key={k} className={'chip' + (tab === k ? ' on' : '')} onClick={() => nav('/radar/' + k, { replace: true })}>{l}</button>)}<span style={{ width: 16 }} /></div>
      {tab === 'health' && <Health />}
      {tab === 'revenue' && <Revenue />}
      {tab === 'reach' && <Reach />}
      {tab === 'discovery' && <Discovery />}
      {tab === 'fans' && <Fans />}
    </Screen>
  );
}

function Info({ title, sub, icon = 'bolt' }) {
  return (
    <div className="card lift row gap16 mt16" style={{ boxShadow: 'var(--fx-card)' }}>
      <span className="badge-round"><Icon name={icon} size={20} /></span>
      <div className="col" style={{ gap: 4 }}><span className="l-lg">{title}</span><span className="b-sm t2">{sub}</span></div>
    </div>
  );
}
function DarkHero({ value, label, sub, delta, children, exact, exactValue }) {
  return (
    <div className="card dark p24 col gap16 mt16">
      <div className="row gap16">
        <Hex />
        <div className="col grow" style={{ gap: 4 }}>
          <span className="h-xl">{value}<br />{label}</span>
          <span className="row gap8"><span className="b-sm">{sub}</span>{delta && <span className="l-lg" style={{ color: 'var(--green-300)' }}>↑ {delta}</span>}</span>
        </div>
      </div>
      {children}
      {exact && <div className="row" style={{ borderTop: '1px solid var(--border-inverse-subtle)', paddingTop: 12, justifyContent: 'space-between' }}><span className="l-md-l">{exact}</span><span className="row gap8 l-md-b">{exactValue}<Icon name="info" size={16} /></span></div>}
    </div>
  );
}
function SourceRows({ rows, earnings }) {
  const total = rows.reduce((a, r) => a + r[2], 0);
  return (
    <div className="card col mt12" style={{ gap: 4 }}>
      <div className="trafficbar" style={{ marginBottom: 8 }}>{rows.map(([n, c, v]) => <i key={n} style={{ flex: v, background: COLORS[c] }} />)}</div>
      {rows.map(([n, c, v, fmtV]) => (
        <div key={n} className="srcrow">
          <span className="dot" style={{ background: COLORS[c] }} />
          {earnings ? (
            <><span className="col grow" style={{ gap: 2 }}><span className="l-lg-t">{n}</span><span className="b-xs t2">{Math.round(v / total * 100)}% of earnings</span></span><span className="amt">{fmtV}</span></>
          ) : (
            <><span className="l-lg-t grow">{n}</span><span className="l-lg-t">{Math.round(v / total * 100)}%</span><span className="b-xs t2" style={{ width: 44, textAlign: 'right' }}>{fmtV}</span></>
          )}
        </div>
      ))}
    </div>
  );
}

function Health() {
  return (
    <>
      <Info title="You're holding Platinum" sub="Health is 76, just above the Platinum line of 75." />
      <div className="card dark p24 col gap16 mt16">
        <div className="row gap16">
          <Hex />
          <div className="col grow" style={{ gap: 4 }}>
            <span className="h-xl">PLATINUM I</span>
            <span className="b-sm">4 points to Platinum II</span>
            <span className="row" style={{ gap: 4 }}>{[1, 0, 0].map((x, i) => <i key={i} style={{ width: 24, height: 4, borderRadius: 2, background: x ? 'var(--primary)' : 'var(--border-inverse-subtle)' }} />)}</span>
          </div>
        </div>
        <div className="row gap12"><div className="progress"><i style={{ width: '20%' }} /></div><span className="b-xs">1 of 5</span></div>
        <div className="row gap8" style={{ padding: '8px 16px', borderRadius: 16, background: 'var(--surface-glass)', boxShadow: 'inset 0 0 0 1px var(--border-inverse-subtle)' }}>
          <span className="badge-round sm"><Icon name="local_fire_department" size={18} /></span>
          <span className="col grow" style={{ gap: 0 }}><span className="l-md">12 day posting streak</span><span className="b-xs">3 more days unlocks a free Boost</span></span>
          <Tag>+2 Health</Tag>
        </div>
        <div className="row" style={{ borderTop: '1px solid var(--border-inverse-subtle)', paddingTop: 12, justifyContent: 'space-between' }}><span className="l-md-l">EXACT HEALTH SCORE</span><span className="row gap8 l-md-b">76/100<Icon name="info" size={16} /></span></div>
      </div>
      <div className="mt24"><SectionHeader title="Weekly achievements" /></div>
      <div className="card yellow col gap12 mt12">
        <div className="row gap12"><span className="badge-round dark"><Icon name="bolt" size={20} /></span><span className="col"><span className="l-xs">WEEKLY XP · TO PLATINUM II</span><span className="h-lg">2.1 / 4 pts</span></span></div>
        <div className="row gap12"><div style={{ width: 100, height: 10, borderRadius: 5, background: 'var(--yellow-400)', overflow: 'hidden' }}><i style={{ display: 'block', width: '52%', height: '100%', background: 'var(--surface-dark)' }} /></div><span className="b-xs">1.9 to go</span></div>
      </div>
      <div className="card col gap8 mt12" style={{ boxShadow: 'var(--fx-card)' }}>
        <div className="row gap16"><span className="badge-round md"><Icon name="photo_camera" size={18} /></span><span className="col grow" style={{ gap: 4 }}><span className="l-lg">Post 10 times</span><span className="b-sm t2">Keeps your consistency facet up</span></span></div>
        <div className="row gap8"><div className="progress"><i style={{ width: '40%' }} /></div><span className="b-xs t2">4 / 10</span></div>
        <span className="b-xs t2 row gap4" style={{ gap: 4 }}><Icon name="star" size={12} />+1.2 pts on complete</span>
      </div>
    </>
  );
}

function Revenue() {
  const s = useStore();
  const me = useMe();
  const L = creatorLive(s, me);
  const tools = L.runs.reduce((a, r) => a + Number(r.price), 0);
  const content = 3450 + L.unlockJ / 100 * .82;
  const tips = 2755 + L.tipJ / 100 * .82;
  const subs = 1200 + L.subJ / 100 * .82;
  const earned = content + tips + subs + 800 + 650;
  const balance = earned - 921.8 - tools;
  const rows = [['Content', 'Yellow', content], ['Tips', 'Blue', tips], ['Subscriptions', 'Neutral', subs], ['Gifts', 'Green', 800], ['Engagement', 'Red', 650]].map(([n, c, v]) => [n, c, v, '$' + fmt(Math.round(v))]);
  const paying = 412 + new Set([...L.tips.map((t) => t.fan_id), ...L.subs.map((t) => t.fan_id)]).size;
  const pct = Math.round((L.tipJ + L.subJ + L.unlockJ) / 100 / 88.55) + 9;
  return (
    <>
      <Info title={L.tipJ + L.subJ ? 'Fans are spending right now' : 'Your best week this month'} sub={`Earnings up ${pct}% · payout lands Thursday.`} icon="paid" />
      <div className="card dark p24 col gap16 mt16">
        <div className="row gap16"><Hex /><div className="col grow" style={{ gap: 4 }}><span className="h-xl">${fmt(Math.round(balance))}<br />BALANCE</span><span className="row gap8"><span className="b-sm">Past 7 days</span><span className="l-lg" style={{ color: 'var(--green-300)' }}>↑ {pct}%</span></span></div></div>
        <div className="col gap12">
          {[['EARNED', usd(earned)], ['GROWTH TOOLS', '-' + usd(921.8 + tools)], ['PAYOUT DUE', 'Thursday']].map(([a, b]) => <div key={a} className="row" style={{ justifyContent: 'space-between' }}><span className="l-md-l t2">{a}</span><span className="l-md-b">{b}</span></div>)}
        </div>
        <div className="row gap12"><button className="btn primary grow" style={{ fontSize: 12 }}><Icon name="bolt" size={16} />RAPID PAYOUT</button><button className="btn secondary grow" style={{ background: 'var(--surface-inverse)', boxShadow: 'inset 0 0 0 1px var(--border-inverse-subtle)', fontSize: 12 }}>SUPPORT</button></div>
      </div>
      <div className="mt24"><SectionHeader title="Where it came from" /></div>
      <SourceRows rows={rows} earnings />
      {L.tips.length > 0 && (
        <>
          <div className="mt24"><SectionHeader title="Latest tips" action="LIVE" /></div>
          <div className="card col gap12 mt12">
            {[...L.tips].reverse().slice(0, 4).map((t) => (
              <div key={t.id} className="row gap12"><Avatar p={s.profiles[t.fan_id]} size={36} ring={false} /><span className="col grow" style={{ gap: 0 }}><span className="l-md" style={{ letterSpacing: .5 }}>@{s.profiles[t.fan_id]?.handle}</span><span className="b-xs t2">{t.note || 'Tip'}</span></span><span className="l-md-b">{fmt(t.amount)} J</span></div>
            ))}
          </div>
        </>
      )}
      <div className="mt24"><SectionHeader title="Fan spend" /></div>
      <div className="mt12"><KeyValueCard rows={[['Paying fans', `Of your ${fmt(s.profiles[me].fans)} fans`, fmt(paying)], ['Average per paying fan', 'Per month', '$93'], ['Monthly run rate', `${paying} fans × $93`, '$' + (paying * 93 / 1000).toFixed(1) + 'k']]} /></div>
    </>
  );
}

function Reach() {
  const s = useStore();
  const me = useMe();
  const views = s.posts.filter((p) => p.creator_id === me).reduce((a, p) => a + p.views, 0);
  const boost = s.tool_runs.filter((r) => r.creator_id === me).length * 1240;
  const total = 39612 - 17000 + views + boost;
  const pts = [8, 12, 9, 14, 13, 18, 16, 20, 19, 24, 22, 27, 26, 30 + boost / 400];
  const max = Math.max(...pts);
  const path = pts.map((v, i) => `${i ? 'L' : 'M'}${(i / (pts.length - 1) * 300).toFixed(1)},${(52 - v / max * 46).toFixed(1)}`).join(' ');
  return (
    <>
      <Info title="More people are finding you" sub={`Reach is up ${14 + Math.round(boost / 1000)}% on the previous fortnight.`} icon="trending_up" />
      <DarkHero value={(total / 1000).toFixed(1) + 'K'} label="REACH" sub="Last 14 days" delta={14 + Math.round(boost / 1000) + '%'} exact="EXACT IMPRESSIONS" exactValue={fmt(total)}>
        <div className="chart">
          <svg viewBox="0 0 300 56" height="56"><path d="M0,54 H300" stroke="var(--text-2)" /><path d={path} fill="none" stroke="var(--primary)" strokeWidth="2" /><circle cx="300" cy={52 - pts[pts.length - 1] / max * 46} r="4" fill="#fff" stroke="var(--primary)" strokeWidth="2" /></svg>
          <div className="row l-md-l t2 mt8" style={{ justifyContent: 'space-between' }}><span>{dt(13)}</span><span>{dt(7)}</span><span>{dt(0)}</span></div>
        </div>
      </DarkHero>
      <div className="mt24"><SectionHeader title="Where fans saw you" /></div>
      <SourceRows rows={[['Trending & New', 'Yellow', 18400 + boost * .6], ['Category Browse', 'Blue', 11900 + boost * .4], ['For You', 'Red', 6200], ['Search', 'Green', 3100]].map(([a, b, c]) => [a, b, c, (c / 1000).toFixed(1) + 'k'])} />
    </>
  );
}
const dt = (d) => new Date(Date.now() - d * 864e5).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();

function Discovery() {
  const nav = useNavigate();
  return (
    <>
      <Info title="You're climbing" sub="Up 4 places in Platinum since Monday." icon="trending_up" />
      <DarkHero value="7TH IN" label="PLATINUM" sub="23rd in Fitness" delta="4" exact="EXACT DISCOVERY RANK" exactValue="58/100">
        <div className="row gap12"><div className="progress"><i style={{ width: '58%' }} /></div><span className="b-xs">Top 2%</span></div>
      </DarkHero>
      <div className="mt24"><SectionHeader title="Where you place" /></div>
      <div className="card col gap12 mt12">
        {[['Category Browse', 'Position 7', 'Page 1', 'Of 41 creators', 'explore'], ['For You', 'Fans matched', '2,140', 'This week', 'favorite'], ['Trending & New', 'In Fitness', '31st', 'Of 120', 'trending_up']].map(([a, b, c, d, ic]) => (
          <div key={a} className="row gap12"><span className="badge-round muted"><Icon name={ic} size={18} /></span><span className="col grow" style={{ gap: 0 }}><span className="l-md">{a}</span><span className="b-xs t2">{b}</span></span><span className="col right" style={{ gap: 0 }}><span className="l-md">{c}</span><span className="b-xs t2">{d}</span></span></div>
        ))}
      </div>
      <div className="card yellow p20 col gap12 mt16">
        <div className="row gap12"><span className="badge-round dark"><Icon name="campaign" size={20} /></span><span className="col"><span className="l-md-l">PROMOTION</span><span className="h-lg">REACH PAST YOUR TIER</span></span></div>
        <span className="b-sm">Placement across all of Fitness, every tier. $49.99 for 3 days.</span>
        <button className="btn secondary full" onClick={() => nav('/tools/promotion')}><Icon name="bolt" size={16} />BUY PROMOTION</button>
      </div>
    </>
  );
}

function Fans() {
  const s = useStore();
  const me = useMe();
  const L = creatorLive(s, me);
  const c = s.profiles[me];
  const active = 540 + L.newFans * 1;
  const spend = {};
  for (const t of L.tips) spend[t.fan_id] = (spend[t.fan_id] || 0) + t.amount / 100;
  for (const t of L.subs) spend[t.fan_id] = (spend[t.fan_id] || 0) + t.price / 100;
  const live = Object.entries(spend).map(([id, v]) => [s.profiles[id]?.handle, `Live · ${L.subs.some((x) => x.fan_id === id) ? 'Subscriber' : 'Tipped'}`, v]);
  const top = [...live, ['jill.park', 'Subscriber · 12 comments', 148], ['nightbird', 'Subscriber · shared 9', 96], ['maya_zhang', 'Subscriber · 18 comments', 74]].filter((x, i, a) => a.findIndex((y) => y[0] === x[0]) === i).sort((a, b) => b[2] - a[2]).slice(0, 4);
  return (
    <>
      <Info title="Your fans are showing up" sub={`${active} of ${fmt(c.fans)} fans active this week.`} icon="group" />
      <DarkHero value={active} label="ACTIVE FANS" sub={`Of ${fmt(c.fans)} following`} delta="6%" exact="FAN SIGNALS" exactValue="62/100">
        <div className="row gap12"><div className="progress"><i style={{ width: Math.round(active / c.fans * 100) + '%' }} /></div><span className="b-xs">{Math.round(active / c.fans * 100)}% active</span></div>
      </DarkHero>
      <div className="card bordered row gap16 mt16" style={{ padding: '8px 16px' }}><span className="badge-round sm"><Icon name="workspace_premium" size={18} /></span><span className="col grow" style={{ gap: 2 }}><span className="l-lg">Founding fans</span><span className="b-xs t2">Badge on your profile</span></span><span className="l-lg">{84 + L.subs.length}</span></div>
      <div className="mt24"><SectionHeader title="Top fans" /></div>
      <div className="card col mt12" style={{ gap: 0 }}>
        {top.map(([h, d, v], i) => (
          <div key={h} className="row gap12" style={{ padding: '8px 0' }}><span className="l-md" style={{ width: 10 }}>{i + 1}</span><span className="av ring" style={{ width: 44, height: 44, padding: 4 }}><span className="in l-md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{h[0].toUpperCase()}</span></span><span className="col grow" style={{ gap: 2 }}><span className="l-lg" style={{ letterSpacing: .5 }}>@{h}</span><span className="b-xs t2">{d}</span></span><span className="l-lg-b">${Math.round(v)}</span></div>
        ))}
      </div>
    </>
  );
}
