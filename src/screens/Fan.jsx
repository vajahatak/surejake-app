// Fan side: Flow 08 (Browse and Discovery), 09 (Feed), 10.5 to 10.7 (Fan profile), Messages.
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Screen, FlowHeader, Intro, Footnote, Button, Icon, Img, Avatar, Tag, SectionHeader, fmt, short, useMe, useToast } from '../components/ui.jsx';
import { PostCard, PostTile } from '../components/Post.jsx';
import { useMoney } from '../components/MoneySheets.jsx';
import { CategoryCard } from './Onboarding.jsx';
import { useStore, actions, isFollowing, setSession, getSession } from '../data/store.js';
import { CATEGORY_IMG, IMG } from '../data/seed.js';

const ALL_CATS = ['Music', 'Dance', 'Wildlife', 'Beauty', 'Sports', 'Dating', 'Food', 'Fitness'];
const SUBS = {
  Fitness: ['Training', 'Nutrition', 'Transformation', 'Home workouts', 'Recovery'],
  Beauty: ['Makeup', 'Skincare', 'Editorial', 'Behind the scenes', 'Hauls'],
  Food: ['Cooking', 'Reviews', 'Baking', 'Restaurants', 'Meal prep'],
  Music: ['Covers', 'Production', 'Live sets'], Dance: ['Choreo', 'Tutorials'], Wildlife: ['Safari', 'Birds'], Sports: ['Football', 'Running'], Dating: ['Advice', 'Stories'],
};

export function PickNiches() {
  const nav = useNavigate();
  const [sel, setSel] = useState(getSession().niches || ['Beauty', 'Food', 'Fitness']);
  const toggle = (c) => setSel(sel.includes(c) ? sel.filter((x) => x !== c) : [...sel, c]);
  return (
    <Screen nav="explore">
      <Intro title="What are you into?" sub="Pick at least one. Your Browse is built from these. Add more any time." />
      <div className="grid2 mt16">{ALL_CATS.map((c) => <CategoryCard key={c} name={c} on={sel.includes(c)} onClick={() => toggle(c)} />)}</div>
      <span className="eyebrow mt16">{sel.length} OF 8 SELECTED</span>
      <div className="mt16"><Button disabled={!sel.length} onClick={() => { setSession({ niches: sel }); nav('/explore/narrow'); }}>Save and browse</Button></div>
    </Screen>
  );
}

export function NarrowDown() {
  const nav = useNavigate();
  const niches = getSession().niches || ['Fitness', 'Beauty', 'Food'];
  const [on, setOn] = useState(['Training', 'Recovery', 'Makeup', 'Editorial', 'Cooking', 'Reviews']);
  const t = (x) => setOn(on.includes(x) ? on.filter((y) => y !== x) : [...on, x]);
  const done = () => { setSession({ interests: on, onboarded: true }); nav('/explore'); };
  return (
    <Screen nav="explore">
      <FlowHeader action="SKIP" onAction={done} />
      <Intro title="Narrow it down" sub="Choose what you want to see inside each niche. Leave one blank to see everything in it." />
      {niches.map((n) => (
        <div key={n} className="mt16">
          <span className="eyebrow">{n.toUpperCase()}</span>
          <div className="row mt8" style={{ flexWrap: 'wrap', gap: 8 }}>{(SUBS[n] || []).map((x) => <button key={x} className={'ichip' + (on.includes(x) ? ' on' : '')} onClick={() => t(x)}>{x}</button>)}</div>
        </div>
      ))}
      <div className="mt24"><Button onClick={done}>Save to browse</Button></div>
      <div className="mt16"><Footnote>Saved niches appear on your Browse. Everything else stays one tap away under Add an interest.</Footnote></div>
    </Screen>
  );
}

export function BrowseReturning() {
  const nav = useNavigate();
  const s = useStore();
  const niches = getSession().niches || ['Beauty', 'Fitness', 'Food'];
  const count = (c) => ({ Fitness: 556, Beauty: 389, Food: 412 }[c] || 120 + Object.values(s.profiles).filter((p) => p.category === c).length);
  return (
    <Screen nav="explore">
      <Intro title="Browse" />
      <div className="mt16"><SectionHeader title="Your interests" action="EDIT" onAction={() => nav('/explore/niches')} /></div>
      <div className="grid2 mt12">
        {niches.map((c) => (
          <button key={c} className="catcard" onClick={() => nav('/explore/niche/' + c.toLowerCase())}>
            <Img src={CATEGORY_IMG[c]} seed={c} />
            <span className="col" style={{ gap: 0 }}><span className="l-md">{c}</span><span className="l-md-l">{count(c)} creators</span></span>
          </button>
        ))}
      </div>
      <button className="card mt12 col" style={{ height: 160, alignItems: 'center', justifyContent: 'center', gap: 8, borderStyle: 'dashed' }} onClick={() => nav('/explore/niches')}>
        <span className="badge-round muted"><Icon name="add" size={22} /></span><span className="l-md">Add Interest</span>
      </button>
      <div className="mt16"><Footnote>Tap a niche to browse its creators. {8 - niches.length} more niches are available.</Footnote></div>
    </Screen>
  );
}

function CategoryChips({ value, onChange }) {
  return (
    <div className="hscroll">
      {['ALL', 'FITNESS', 'BEAUTY', 'FOOD'].map((c) => <button key={c} className={'chip' + (value === c ? ' on' : '')} onClick={() => onChange(c)}>{c}</button>)}
      <span style={{ width: 16 }} />
    </div>
  );
}

export function Explore() {
  const nav = useNavigate();
  const { cat = 'all' } = useParams();
  const value = cat.toUpperCase();
  return (
    <Screen nav="explore">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="h-lg">EXPLORE</span>
        <button className="row gap4 l-md" style={{ gap: 4 }} onClick={() => nav('/explore/browse')}><Icon name="tune" size={16} />BROWSE</button>
      </div>
      <CategoryChips value={value} onChange={(c) => nav('/explore/' + c.toLowerCase(), { replace: true })} />
      {value === 'ALL' && <ExploreAll />}
      {value === 'FITNESS' && <ExploreFitness />}
      {(value === 'BEAUTY' || value === 'FOOD') && <ExploreCategory cat={value === 'BEAUTY' ? 'Beauty' : 'Food'} />}
    </Screen>
  );
}

function CreatorHero({ c }) {
  const nav = useNavigate();
  const me = useMe();
  const s = useStore();
  const following = isFollowing(s, me, c.id);
  return (
    <div className="hero" onClick={(e) => { if (!e.target.closest('button')) nav('/c/' + c.handle); }} style={{ cursor: 'pointer' }}>
      <Img src={c.cover} seed={c.id} />
      <span className="tierpill l-sm" style={{ background: c.tier === 'Diamond' ? 'var(--info)' : c.tier === 'Platinum' ? '#6b7a8c' : 'var(--yellow-600)' }}><Icon name="bolt" size={12} />{c.tier.toUpperCase()} · {c.category.toUpperCase()}</span>
      <span className="h-lg">{c.name}</span>
      <span className="b-sm ti2">{c.bio}</span>
      <div className="row gap12 mt8">
        <button className={'btn ' + (following ? 'outlined inv' : 'primary') + ' grow'} onClick={() => actions.follow(me, c.id)}>{following ? 'FOLLOWING' : 'FOLLOW'}</button>
        <button className="iconbtn-glass" onClick={() => nav('/c/' + c.handle)} aria-label="Open profile"><Icon name="arrow_back" size={20} style={{ transform: 'rotate(180deg)' }} /></button>
      </div>
    </div>
  );
}

function RailTile({ c, mins }) {
  const nav = useNavigate();
  return (
    <button className="railtile" onClick={() => nav('/c/' + c.handle)}>
      <div className="img">
        <Img src={c.cover} seed={c.id} />
        <span className="tt l-sm"><Icon name="bolt" size={10} />{c.tier.toUpperCase()}</span>
        {mins && <span className="timer tag dark"><Icon name="schedule" size={11} />{mins}m</span>}
      </div>
      <div className="txt"><span className="l-md" style={{ letterSpacing: .5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span><span className="l-sm t2" style={{ letterSpacing: .5 }}>@{c.handle}</span></div>
    </button>
  );
}

function ExploreAll() {
  const s = useStore();
  const nav = useNavigate();
  const creators = Object.values(s.profiles).filter((p) => p.kind === 'creator').sort((a, b) => a.sort - b.sort);
  const featured = creators.slice(0, 6);
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % featured.length), 5000); return () => clearInterval(t); }, [featured.length]);
  const trending = [...creators].sort((a, b) => b.fans - a.fans).slice(0, 6);
  return (
    <>
      <div className="mt16"><CreatorHero c={featured[i]} /></div>
      <div className="dots mt12">{featured.map((_, k) => <i key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} />)}</div>
      <div className="mt16"><SectionHeader title="Trending this week" action="SEE ALL" onAction={() => nav('/home/trending')} /></div>
      <div className="hscroll mt12" style={{ gap: 12 }}>{trending.map((c, k) => <RailTile key={c.id} c={c} mins={58 - k * 11} />)}</div>
    </>
  );
}

export function BrandBanner({ brand, campaign }) {
  const nav = useNavigate();
  const me = useMe();
  const s = useStore();
  const b = s.profiles[brand];
  const following = isFollowing(s, me, brand);
  const toast = useToast();
  return (
    <div className="hero" style={{ height: 420, cursor: 'pointer' }} onClick={(e) => { if (!e.target.closest('button')) nav('/brand/' + brand); }}>
      <Img src={b.cover} seed={brand} />
      <span className="tierpill l-sm" style={{ background: 'var(--surface-dark)' }}><Icon name="storefront" size={12} />BRAND PARTNER</span>
      <span className="h-xl up">{campaign?.title || b.name}</span>
      <span className="b-sm ti2">{campaign?.sub}</span>
      <div className="row gap12 mt8">
        <button className="btn primary grow" onClick={() => toast(`Opening ${b.name} shop`)}><Icon name="shopping_bag" size={16} />SHOP</button>
        <button className={'btn ' + (following ? 'outlined inv' : 'secondary') + ' grow'} style={following ? undefined : { background: 'rgba(0,0,0,.5)', boxShadow: 'inset 0 0 0 1px var(--border-scrim)' }} onClick={() => actions.follow(me, brand)}>{following ? 'FOLLOWING' : 'FOLLOW'}</button>
      </div>
    </div>
  );
}

function ExploreFitness() {
  const s = useStore();
  const nav = useNavigate();
  const [b, setB] = useState(0);
  const brands = [['aybl', { title: 'AYBL', sub: 'Summer Drop · 41 creators · Ends 30 Jun' }], ['nike', { title: 'NIKE', sub: 'Nike Pro · 68 creators · Ends 30 Jun' }]];
  const creators = Object.values(s.profiles).filter((p) => p.kind === 'creator' && p.category === 'Fitness').sort((a, b) => b.fans - a.fans);
  return (
    <>
      <div className="mt16"><BrandBanner brand={brands[b][0]} campaign={brands[b][1]} /></div>
      <div className="dots mt12">{brands.map((_, k) => <i key={k} className={k === b ? 'on' : ''} onClick={() => setB(k)} />)}</div>
      <div className="mt16"><SectionHeader title="Top picks" action="PAID SLOTS · NEW SET EACH HOUR" /></div>
      <div className="hscroll mt12" style={{ gap: 12 }}>{creators.slice(0, 6).map((c, k) => <RailTile key={c.id} c={c} mins={58 - k * 9} />)}</div>
      <button className="card mt16 row gap12" onClick={() => nav('/explore/niche/fitness')}>
        <span className="tile-ic"><Icon name="trending_up" size={20} /></span>
        <span className="col grow" style={{ gap: 2, textAlign: 'left' }}><span className="l-lg">Inside Fitness</span><span className="b-xs t2">Every creator, ranked by tier</span></span>
        <Icon name="chevron_right" size={20} />
      </button>
    </>
  );
}

function ExploreCategory({ cat }) {
  const s = useStore();
  const nav = useNavigate();
  const creators = Object.values(s.profiles).filter((p) => p.kind === 'creator' && p.category === cat);
  const [t, setT] = useState(2 * 3600 + 14 * 60 + 9);
  useEffect(() => { const i = setInterval(() => setT((x) => x - 1), 1000); return () => clearInterval(i); }, []);
  const hms = [Math.floor(t / 3600), Math.floor(t / 60) % 60, t % 60].map((x) => String(x).padStart(2, '0')).join(':');
  return (
    <>
      <div className="banner mt16" onClick={() => nav('/explore/niche/' + cat.toLowerCase())} style={{ cursor: 'pointer' }}>
        <Img src={CATEGORY_IMG[cat]} seed={cat} />
        <span className="l-sm">{cat === 'Beauty' ? 556 : 412} CREATORS</span>
        <span className="h-xl up">{cat}</span>
        <span className="b-xs ti2">31 new this week</span>
      </div>
      <div className="mt16"><SectionHeader title="Top picks" action="PAID SLOTS · NEW SET EACH HOUR" /></div>
      <div className="hscroll mt12" style={{ gap: 12 }}>
        {creators.map((c) => (
          <button key={c.id} className="timercard" onClick={() => nav('/c/' + c.handle)}>
            <Img src={c.cover} seed={c.id} />
            <span className="tag brand" style={{ alignSelf: 'flex-start' }}><Icon name="timer" size={11} />{hms}</span>
            <span className="col" style={{ gap: 2 }}><span className="l-md">{c.name}</span><span className="b-xs ti2">Ends soon · {cat}</span></span>
          </button>
        ))}
      </div>
      <div className="mt16"><SectionHeader title="For you" action="WHY THESE?" /></div>
      <div className="grid2 mt12">
        <button className="promo" onClick={() => nav('/home/trending')}><span className="badge-round sm"><Icon name="celebration" size={16} /></span><span className="col" style={{ gap: 2 }}><span className="l-md">New this week</span><span className="b-xs t2">31 creators in {cat}</span></span></button>
        <button className="promo" onClick={() => nav('/home')}><span className="badge-round sm"><Icon name="lock_open" size={16} /></span><span className="col" style={{ gap: 2 }}><span className="l-md">Free previews</span><span className="b-xs t2">No subscription needed</span></span></button>
      </div>
    </>
  );
}

export function InsideNiche() {
  const nav = useNavigate();
  const { cat = 'fitness' } = useParams();
  const Cat = cat[0].toUpperCase() + cat.slice(1);
  const s = useStore();
  const [f, setF] = useState('VERIFIED');
  const creators = Object.values(s.profiles).filter((p) => p.kind === 'creator' && p.category === Cat).sort((a, b) => b.fans - a.fans);
  const groups = ['Diamond', 'Platinum', 'Gold'].map((t) => [t, creators.filter((c) => c.tier === t)]).filter(([, l]) => l.length);
  return (
    <Screen nav="explore" inverseStatus>
      <div className="herohead" style={{ background: 'var(--blue-400)', paddingBottom: 20 }}>
        <button className="back" onClick={() => nav(-1)}>BACK</button>
        <span className="l-sm">{Cat === 'Fitness' ? 556 : 389} CREATORS</span>
        <span className="h-xl">{Cat.toUpperCase()}</span>
      </div>
      <div className="hscroll mt16">
        {['CONTENT ALL', 'COUNTRY UK', 'TIER ALL'].map((x) => <span key={x} className="chip" style={{ height: 32 }}>{x}<Icon name="chevron_right" size={14} style={{ transform: 'rotate(90deg)' }} /></span>)}
      </div>
      <div className="hscroll mt12">
        {['VERIFIED', 'DM ACCESS', 'FREE PREVIEW'].map((x) => <button key={x} className={'chip' + (f === x ? ' on' : '')} onClick={() => setF(x)}>{x}</button>)}
      </div>
      {groups.map(([tier, list]) => (
        <div key={tier} className="mt20">
          <div className="row" style={{ justifyContent: 'space-between' }}><span className="row gap8 l-md"><Icon name="bolt" size={14} />{tier.toUpperCase()}</span><span className="l-sm t2">{list.length} CREATORS</span></div>
          <div className="card mt8 col" style={{ gap: 4, padding: 8 }}>
            {list.map((c, k) => (
              <button key={c.id} className="row gap12" style={{ padding: 6, textAlign: 'left' }} onClick={() => nav('/c/' + c.handle)}>
                <span className="l-md" style={{ width: 14 }}>{k + 1}</span>
                <Avatar p={c} size={44} />
                <span className="col grow" style={{ gap: 2 }}><span className="l-lg" style={{ letterSpacing: .5 }}>{c.name}</span><span className="b-xs t2">@{c.handle} · {short(c.fans)} fans</span></span>
                <Icon name="chevron_right" size={18} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </Screen>
  );
}

// ---------- 09 Feed ----------
export function Feed() {
  const nav = useNavigate();
  const { tab = 'foryou' } = useParams();
  const s = useStore();
  const me = useMe();
  const money = useMoney();
  const [sub, setSub] = useState('Rising');
  const niches = getSession().niches || ['Beauty', 'Fitness', 'Food'];
  let posts = [...s.posts].filter((p) => s.profiles[p.creator_id]?.kind === 'creator');
  if (tab === 'foryou') {
    posts.sort((a, b) => (b.promoted - a.promoted) || (b.boosted - a.boosted) || b.created_at.localeCompare(a.created_at));
  } else if (tab === 'category') {
    posts = posts.filter((p) => niches.includes(s.profiles[p.creator_id].category)).sort((a, b) => b.created_at.localeCompare(a.created_at));
  } else {
    posts.sort((a, b) => (sub === 'New' ? b.created_at.localeCompare(a.created_at) : b.views - a.views));
  }
  return (
    <Screen nav="home">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="utabs">
          {[['foryou', 'FOR YOU'], ['category', 'CATEGORY'], ['trending', 'TRENDING']].map(([k, l]) => <button key={k} className={'utab' + (tab === k ? ' on' : '')} onClick={() => nav('/home/' + k, { replace: true })}>{l}</button>)}
        </div>
        <button className="row l-md" style={{ gap: 4 }} onClick={() => nav('/wallet')}><Icon name="bolt" size={14} />{fmt(s.profiles[me]?.balance)}</button>
      </div>
      {tab === 'trending' && <div className="subtabs mt16">{['Rising', 'New'].map((x) => <button key={x} className={sub === x ? 'on' : ''} onClick={() => setSub(x)}>{x}</button>)}</div>}
      <div className="col gap12 mt16" style={{ margin: '16px -9px 0' }}>
        {posts.map((p) => <PostCard key={p.id} post={p} onTip={(c) => money.tip(c)} onLocked={(post) => money.topUpFor(post)} />)}
      </div>
    </Screen>
  );
}

// ---------- 10.5 to 10.7 fan profile ----------
export function FanProfile() {
  const nav = useNavigate();
  const s = useStore();
  const me = useMe();
  const p = s.profiles[me];
  const [tab, setTab] = useState('LIKED');
  const following = s.follows.filter((f) => f.fan_id === me);
  const subs = s.subscriptions.filter((f) => f.fan_id === me);
  const liked = s.posts.filter((x) => following.some((f) => f.creator_id === x.creator_id) && x.access === 'everyone').slice(0, 4);
  return (
    <Screen nav="profile" inverseStatus>
      <div className="cover" style={{ height: 200 }}><Img src={p.cover} seed="fancover" /></div>
      <div className="pintro col gap12" style={{ marginTop: -40 }}>
        <div className="row gap16" style={{ alignItems: 'flex-end' }}><span style={{ background: 'var(--surface-canvas)', borderRadius: '50%', padding: 4 }}><Avatar p={p} size={72} /></span><span className="h-lg up" style={{ paddingBottom: 8 }}>{p.name}</span></div>
        <div className="row gap8"><Tag>GOLD FAN</Tag><Tag tone="neutral">MEMBER SINCE 2024</Tag></div>
      </div>
      <div className="stats mt16">
        <Stat v={following.length} l="Following" onClick={() => nav('/me/following')} />
        <Stat v={subs.length} l="Subscribed" />
        <Stat v={3} l="Founding" onClick={() => nav('/me/badges')} />
      </div>
      <div className="card dark p20 row gap12 mt16">
        <Hexy />
        <div className="col grow" style={{ gap: 4 }}><span style={{ fontFamily: 'var(--grotesk)', fontWeight: 600, fontSize: 22 }}>GOLD FAN</span><span className="b-sm">2 more months supporting to reach Platinum</span></div>
        <Icon name="chevron_right" size={24} />
      </div>
      <div className="row gap8 mt16">
        <Button kind="outlined" size="sm" onClick={() => alert('Profile editing is not part of the demo')}>Edit</Button>
        <Button kind="outlined" size="sm" onClick={() => nav('/wallet')}>{fmt(p.balance)} J Coin</Button>
      </div>
      <div className="utabs fill mt24">{['LIKED', 'SAVED', 'BADGES'].map((t) => <button key={t} className={'utab' + (tab === t ? ' on' : '')} onClick={() => (t === 'BADGES' ? nav('/me/badges') : setTab(t))}>{t}</button>)}</div>
      <div className="grid2 mt16">{(tab === 'LIKED' ? liked : liked.slice(2)).map((x) => <PostTile key={x.id} post={x} onClick={() => nav('/c/' + s.profiles[x.creator_id].handle)} />)}</div>
      <button className="b-sm t2 mt24" style={{ textDecoration: 'underline' }} onClick={() => { setSession({ role: null }); nav('/'); }}>Log out of the demo</button>
    </Screen>
  );
}
function Stat({ v, l, onClick, green }) {
  return <button onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}><span className="amt" style={green ? { color: 'var(--green-700)' } : undefined}>{v}</span><span className="b-xs t2">{l}</span></button>;
}
export { Stat };
function Hexy() { return <svg width="56" height="56" viewBox="0 0 56 56" fill="none"><path d="M50.749 14.8652V41.1338L28 54.2676L5.25098 41.1338V14.8652L28 1.73145L50.749 14.8652Z" stroke="#F2B705" strokeWidth="3" /><path d="M23.6666 38.8337L24.7499 31.2503H19.3333L29.0833 17.167H31.2499L30.1666 25.8337H36.6666L25.8333 38.8337H23.6666Z" fill="#F2B705" /></svg>; }

export function FanFollowing() {
  const nav = useNavigate();
  const s = useStore();
  const me = useMe();
  const [cat, setCat] = useState('ALL');
  const [q, setQ] = useState('');
  const list = s.follows.filter((f) => f.fan_id === me).map((f) => s.profiles[f.creator_id]).filter((c) => c && c.kind === 'creator');
  const shown = list.filter((c) => (cat === 'ALL' || c.category.toUpperCase() === cat) && (c.handle + c.name).toLowerCase().includes(q.toLowerCase()));
  const groups = ['Fitness', 'Beauty', 'Food'].map((g) => [g, shown.filter((c) => c.category === g)]).filter(([, l]) => l.length);
  return (
    <Screen nav="profile">
      <FlowHeader action="SELECT" />
      <Intro title="Following" />
      <div className="hscroll mt16">{['ALL', 'FITNESS', 'BEAUTY', 'FOOD'].map((c) => <button key={c} className={'chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c === 'ALL' ? `ALL ${list.length}` : c}</button>)}</div>
      <label className="search mt16"><Icon name="search" size={18} /><input placeholder="Search the creators you follow" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      {groups.map(([g, l]) => (
        <div key={g} className="mt20">
          <SectionHeader title={`${g} · ${l.length}`} />
          <div className="grid3 mt12">
            {l.map((c) => (
              <button key={c.id} className="gridtile" onClick={() => nav('/c/' + c.handle)}>
                <div className="img"><Img src={c.cover} seed={c.id} /><span className="tag dark" style={{ position: 'absolute', top: 6, left: 6, fontSize: 8, padding: '0 6px', height: 18 }}>{c.tier.toUpperCase()}</span></div>
                <div className="txt l-sm" style={{ letterSpacing: .3, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{c.handle}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </Screen>
  );
}

export function FanBadges() {
  const s = useStore();
  const me = useMe();
  const tipped = s.tips.some((t) => t.fan_id === me) || s.transactions.some((t) => t.user_id === me && t.title.startsWith('Tip'));
  return (
    <Screen nav="profile">
      <FlowHeader action="SHARE" />
      <Intro title="Badges" />
      <div className="utabs fill mt16">{['LIKED', 'SAVED', 'BADGES'].map((t) => <span key={t} className={'utab' + (t === 'BADGES' ? ' on' : '')}>{t}</span>)}</div>
      <div className="mt20"><SectionHeader title="Founding fan" action="3 EARNED" /></div>
      <div className="mt8"><Footnote>Creators you followed before they climbed a tier. Can't be bought.</Footnote></div>
      <div className="row gap8 mt12">
        {[['rae', 'Gold → Diamond'], ['mia', 'Gold → Diamond'], ['michelle', 'Rising → Gold']].map(([id, t]) => (
          <div key={id} className="col" style={{ width: 96, alignItems: 'center', gap: 4 }}>
            <Avatar p={s.profiles[id]} size={64} />
            <span className="l-xs t2 center">{t}</span>
            <span className="b-xs center">{s.profiles[id].name.split(' ')[0]} {s.profiles[id].name.split(' ')[1][0]}.</span>
          </div>
        ))}
      </div>
      <div className="mt20"><SectionHeader title="Achievements" action="4 OF 9" /></div>
      <div className="card mt12 col gap12">
        {[['Early riser', 'Follow 5 creators before they hit Platinum', 5, 5], ['Regular', 'Read every Pulse for 30 days', 30, 30], ['First tip', 'Send your first tip', tipped ? 1 : 0, 1]].map(([t, d, a, b]) => (
          <div key={t} className="row gap12">
            <span className="badge-round md"><Icon name="trophy" size={18} /></span>
            <div className="col grow" style={{ gap: 2 }}><span className="row gap8"><span className="l-md">{t}</span><span className="tag neutral" style={{ height: 18, fontSize: 9 }}>LEVEL 2</span></span><span className="b-xs t2">{d}</span></div>
            <span className="l-md" style={{ whiteSpace: 'nowrap' }}>{a}/{b}</span>
          </div>
        ))}
      </div>
    </Screen>
  );
}

// ---------- Messages (no Figma screen, built from the Message Row and Signal components) ----------
export function Messages() {
  const nav = useNavigate();
  const s = useStore();
  const me = useMe();
  const people = me === 'sam'
    ? s.tips.filter((t) => t.creator_id === me).map((t) => [s.profiles[t.fan_id], t.note || `Sent a ${fmt(t.amount)} J tip`]).concat([[s.profiles.jill, 'Loved the mobility series'], [s.profiles.mia, 'Collab next month?']])
    : s.subscriptions.filter((x) => x.fan_id === me).map((x) => [s.profiles[x.creator_id], 'Thanks for subscribing! Ask me anything.']).concat([[s.profiles.rae, 'New backstage drop on Friday'], [s.profiles.elin, 'Glad the home workout helped']]);
  const seen = new Set();
  const rows = people.filter(([p]) => p && !seen.has(p.id) && seen.add(p.id));
  return (
    <Screen nav="messages">
      <Intro title="Messages" />
      <label className="search mt16"><Icon name="search" size={18} /><input placeholder="Search messages" /></label>
      <div className="col mt8">
        {rows.map(([p, last], i) => (
          <button key={p.id} className="msgrow" onClick={() => nav('/messages/' + p.handle)}>
            <Avatar p={p} size={48} />
            <span className="col grow" style={{ gap: 2 }}><span className="l-lg" style={{ letterSpacing: .5 }}>{p.name}</span><span className="b-xs t2" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{last}</span></span>
            {i < 2 && <span className="unread" />}
          </button>
        ))}
      </div>
    </Screen>
  );
}
export function Thread() {
  const { handle } = useParams();
  const s = useStore();
  const p = Object.values(s.profiles).find((x) => x.handle === handle);
  const [msgs, setMsgs] = useState([['them', p ? `Hey! Thanks for the support. What are you training for?` : '']]);
  const [v, setV] = useState('');
  if (!p) return null;
  const send = () => { if (!v.trim()) return; setMsgs([...msgs, ['me', v]]); setV(''); setTimeout(() => setMsgs((m) => [...m, ['them', 'Love that. I will put something together for you this week.']]), 1400); };
  return (
    <Screen nonav>
      <FlowHeader />
      <div className="row gap12"><Avatar p={p} size={44} /><span className="col"><span className="l-lg">{p.name}</span><span className="b-xs t2">@{p.handle} · usually replies in 4h</span></span></div>
      <div className="col gap8 mt24" style={{ minHeight: 420 }}>{msgs.map(([w, t], i) => <div key={i} className={'bubble ' + w}>{t}</div>)}</div>
      <div className="field mt16"><input placeholder="Message" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} /><button onClick={send} aria-label="Send"><Icon name="send" size={20} /></button></div>
    </Screen>
  );
}

export { IMG };
