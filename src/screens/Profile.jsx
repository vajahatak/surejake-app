// Flow 10.1 / 10.2 / 10.4 (Creator profile as a fan sees it), 04.1 (My Profile), 12.3/12.4/12.6/12.7 (Brand).
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Screen, Icon, Img, Avatar, Tag, Button, SectionHeader, Footnote, fmt, short, useMe, useToast } from '../components/ui.jsx';
import { PostTile } from '../components/Post.jsx';
import { useMoney } from '../components/MoneySheets.jsx';
import { Stat } from './Fan.jsx';
import { useStore, actions, isFollowing, subscriptionOf, canSee } from '../data/store.js';

function ProfileTop({ c, onBack }) {
  const nav = useNavigate();
  const toast = useToast();
  return (
    <>
      <div className="cover"><Img src={c.cover} seed={c.id + 'cover'} /></div>
      <button className="overlay-btn" style={{ left: 24 }} onClick={onBack || (() => nav(-1))}><Icon name="arrow_back" size={16} />BACK</button>
      <button className="overlay-btn icon" style={{ right: 24 }} onClick={() => toast('Notifications on for ' + c.name.split(' ')[0])} aria-label="Notify"><Icon name="notifications" size={18} /></button>
      <div className="pintro col gap12">
        <div className="row gap16" style={{ alignItems: 'flex-end' }}>
          <span style={{ position: 'relative', background: 'var(--surface-canvas)', borderRadius: '50%', padding: 4 }}>
            <Avatar p={c} size={72} />
            {c.kind !== 'brand' && <span className="verified"><Icon name="check" size={12} /></span>}
          </span>
          <span className="h-lg up" style={{ paddingBottom: 6 }}>{c.name}</span>
        </div>
        <div className="row gap8">
          <Tag tone="neutral">{c.category}</Tag>
          <Tag>{c.tier}</Tag>
          {c.kind === 'brand' && <span className="linkpill"><Icon name="shopping_bag" size={12} />SHOP</span>}
          <span className="linkpill"><Icon name="link" size={12} />LINKS</span>
        </div>
      </div>
    </>
  );
}

function Bio({ text }) {
  const [more, setMore] = useState(false);
  return (
    <div className="mt16">
      <p className="b-md" style={{ margin: 0, ...(more ? {} : { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }) }}>{text}</p>
      {text?.length > 110 && <button className="b-sm t2 mt8" onClick={() => setMore(!more)}>{more ? 'Less' : 'More'}</button>}
    </div>
  );
}

function FoundingFans({ c }) {
  const s = useStore();
  const fans = [['Nadia R.', 'GOLD', 'photo-1544005313-94ddf0286df2'], ['Amara O.', 'GOLD', 'photo-1531123897727-8f129e1688ce'], ['Clio K.', 'GOLD', 'photo-1517841905240-472988babdf9'], ['Priya S.', 'PLATINUM', 'photo-1529626455594-4ff0802cfb7e']];
  const live = s.subscriptions.filter((x) => x.creator_id === c.id).map((x) => s.profiles[x.fan_id]).filter(Boolean);
  const list = [...live.map((p) => [p.name.split(' ')[0] + ' ' + p.name.split(' ')[1][0] + '.', 'NEW', p]), ...fans].slice(0, 4);
  return (
    <div className="mt24">
      <div className="sechead"><h2 className="h-lg" style={{ margin: 0 }}>FOUNDING FANS</h2><span className="l-md" style={{ color: 'var(--text)' }}>VIEW ALL {84 + live.length}</span></div>
      <div className="row mt12" style={{ justifyContent: 'space-between' }}>
        {list.map(([n, t, img]) => (
          <div key={n} className="col" style={{ width: 72, alignItems: 'center', gap: 4 }}>
            <Avatar p={typeof img === 'object' ? img : { id: n, name: n, tier: t === 'PLATINUM' ? 'Platinum' : 'Gold', avatar: `https://images.unsplash.com/${img}?auto=format&fit=crop&w=200&q=70` }} size={64} />
            <span className="l-xs t2">{t}</span>
            <span className="b-xs">{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostsGrid({ posts, onOpen }) {
  const [f, setF] = useState('PHOTOS');
  const shown = posts.filter((p) => (f === 'PHOTOS' ? p.kind === 'photo' : f === 'TEXT' ? p.kind === 'text' : f === 'AUDIO' ? p.kind === 'voice' : p.kind === 'video'));
  return (
    <>
      <div className="hscroll mt16">{['PHOTOS', 'VIDEO', 'TEXT', 'AUDIO'].map((x) => <button key={x} className={'chip' + (f === x ? ' on' : '')} onClick={() => setF(x)}>{x}</button>)}</div>
      {shown.length === 0 && <div className="card mt16 b-sm t2 center">Nothing here yet.</div>}
      {shown[0] && <div className="mt16"><PostTile post={shown[0]} large onClick={() => onOpen(shown[0])} /></div>}
      <div className="grid2 mt12">{shown.slice(1).map((p) => <PostTile key={p.id} post={p} onClick={() => onOpen(p)} />)}</div>
    </>
  );
}

function signalLive(s, creator) {
  const r = s.tool_runs.filter((x) => x.creator_id === creator && x.tool === 'signal').sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  if (!r) return null;
  const left = new Date(r.created_at).getTime() + 8 * 3600e3 - Date.now();
  return left > 0 ? left : null;
}

export function CreatorProfile() {
  const { handle } = useParams();
  const nav = useNavigate();
  const s = useStore();
  const me = useMe();
  const money = useMoney();
  const toast = useToast();
  const c = Object.values(s.profiles).find((p) => p.handle === handle);
  const [open, setOpen] = useState(null);
  const [qp] = useSearchParams();
  if (!c) return <Screen nav="explore"><p>Not found</p></Screen>;
  if (c.kind === 'brand') { nav('/brand/' + c.id, { replace: true }); return null; }
  if (c.id === me && !qp.get('preview')) { nav('/studio', { replace: true }); return null; }
  const following = isFollowing(s, me, c.id);
  const sub = subscriptionOf(s, me, c.id);
  const posts = s.posts.filter((p) => p.creator_id === c.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const followRow = s.follows.find((f) => f.fan_id === me && f.creator_id === c.id);
  const live = signalLive(s, c.id);
  const first = c.name.split(' ')[0];
  const newFans = s.follows.filter((f) => f.creator_id === c.id && Date.now() - new Date(f.created_at) < 7 * 864e5).length;

  return (
    <Screen nav="explore" inverseStatus>
      <ProfileTop c={c} />
      <div className="stats mt16">
        <Stat v={short(c.posts_count)} l="Posts" />
        <Stat v={short(c.fans)} l="Fans" />
        <Stat v={'+' + (38 + newFans)} l="Past 7 days" green />
      </div>
      <Bio text={c.bio} />
      {live && (
        <div className="card dark row gap12 mt16" style={{ alignItems: 'center' }}>
          <div className="col grow" style={{ gap: 6 }}>
            <span className="livepill" style={{ alignSelf: 'flex-start' }}>SIGNAL LIVE · {Math.floor(live / 3600e3)}:{String(Math.floor(live / 60e3) % 60).padStart(2, '0')} LEFT</span>
            <span className="l-lg-b">Message them free</span>
            <span className="b-xs ti2">No subscription needed while the signal is live. One thread, yours to keep.</span>
          </div>
          <button className="btn primary xs" style={{ height: 40 }} onClick={() => nav('/messages/' + c.handle)}><Icon name="chat_bubble" size={14} />MESSAGE</button>
        </div>
      )}
      <div className="col gap12 mt16">
        {c.id === me ? <span className="b-sm t2">This is how fans see your profile.</span> : !following ? (
          <Button onClick={async () => { await actions.follow(me, c.id); toast(`You're a fan of ${first}`); }}>Be a fan</Button>
        ) : (
          <>
            <Button kind="outlined" onClick={() => actions.follow(me, c.id)}>{sub ? 'Subscribed · ' + sub.plan : 'Following'}</Button>
            {!sub && !live && <Button onClick={() => money.subscribe(c)}>Subscribe · 2,500 J</Button>}
            {!sub && live && <Button onClick={() => money.dm(c)}>DM Access · 2,500 J</Button>}
            <div className="row gap8">
              <Button kind="outlined" size="sm" icon="paid" onClick={() => money.tip(c)}>Tip</Button>
              <Button kind="outlined" size="sm" icon="chat_bubble" onClick={() => (sub || live ? nav('/messages/' + c.handle) : money.dm(c))}>Message</Button>
            </div>
          </>
        )}
      </div>
      <FoundingFans c={c} />
      <div className="mt24"><SectionHeader title="Posts" action={`${fmt(c.posts_count)} TOTAL`} /></div>
      <PostsGrid posts={posts} onOpen={(p) => setOpen(p)} />
      <div className="mt16"><Footnote>{followRow ? `A fan since ${new Date(followRow.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · ${Math.max(1, 11 - Math.floor((Date.now() - new Date(followRow.created_at)) / 864e5))} days from Founding Fan eligibility` : 'View counts update hourly'}</Footnote></div>
      {open && <PostViewer post={open} onClose={() => setOpen(null)} />}
    </Screen>
  );
}

function PostViewer({ post, onClose }) {
  const s = useStore();
  const me = useMe();
  const money = useMoney();
  const toast = useToast();
  const ok = canSee(s, me, post);
  const unlock = async () => {
    if (post.access !== 'paid') { onClose(); money.subscribe(s.profiles[post.creator_id]); return; }
    try { await actions.unlock(me, post.id); toast('Unlocked'); } catch (e) { if (/INSUFFICIENT/.test(e.message)) { onClose(); money.topUpFor(post); } }
  };
  return (
    <div className="scrim" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ justifyContent: 'center', padding: 16 }}>
      <div className="post" style={{ animation: 'fade .2s' }}>
        <div className="row"><span className="l-lg grow">{post.title}</span><button className="closebtn" onClick={onClose}><Icon name="close" size={18} /></button></div>
        <div className="media" style={{ height: 360 }}>
          <Img src={post.media} seed={'p' + post.id} />
          {!ok && <div className="lock"><button className="pill" onClick={unlock}><Icon name="lock" size={14} />{post.access === 'paid' ? `UNLOCK FOR ${fmt(post.price)} J` : post.access === 'fans' ? 'FOLLOW TO SEE' : 'SUBSCRIBE TO SEE'}</button></div>}
        </div>
        <p className="b-md" style={{ margin: 0 }}>{post.caption}</p>
        <span className="b-xs t2">{fmt(post.views)} views · {fmt(post.likes)} likes</span>
      </div>
    </div>
  );
}

// ---------- 04.1 My Profile ----------
export function MyProfile() {
  const nav = useNavigate();
  const s = useStore();
  const me = useMe();
  const c = s.profiles[me];
  const [open, setOpen] = useState(null);
  const posts = s.posts.filter((p) => p.creator_id === me).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const runs = s.tool_runs.filter((r) => r.creator_id === me && Date.now() - new Date(r.created_at) < r.hours * 3600e3);
  const boosts = runs.filter((r) => r.tool === 'boost');
  const newFans = s.follows.filter((f) => f.creator_id === me && Date.now() - new Date(f.created_at) < 7 * 864e5).length;
  if (!c) return null;
  return (
    <Screen nav="profile" inverseStatus>
      <div className="cover"><Img src={c.cover} seed={c.id + 'cover'} /></div>
      <button className="overlay-btn" style={{ left: 24 }} onClick={() => nav('/home')}><Icon name="arrow_back" size={16} />BACK</button>
      <button className="btn primary sm" style={{ position: 'absolute', right: 24, top: 56, zIndex: 3, width: 88 }} onClick={() => nav('/post/new')}><Icon name="add" size={16} />POST</button>
      <div className="pintro col gap12">
        <div className="row gap16" style={{ alignItems: 'flex-end' }}>
          <span style={{ position: 'relative', background: 'var(--surface-canvas)', borderRadius: '50%', padding: 4 }}><Avatar p={c} size={72} /><span className="verified"><Icon name="check" size={12} /></span></span>
          <span className="h-lg up" style={{ paddingBottom: 6 }}>{c.name}</span>
        </div>
        <div className="row gap8"><Tag tone="neutral">{c.category}</Tag><Tag>{c.tier}</Tag><span className="linkpill"><Icon name="link" size={12} />LINKS</span></div>
      </div>
      <div className="stats mt16">
        <Stat v={short(c.posts_count)} l="Posts" />
        <Stat v={fmt(c.fans)} l="Fans" />
        <Stat v={'+' + (38 + newFans)} l="Past 7 days" green />
      </div>
      <Bio text={c.bio} />
      <div className="mt16"><Button onClick={() => nav('/tools')}>Growth tools</Button></div>
      <div className="row gap8 mt12">
        <Button kind="outlined" size="sm" onClick={() => nav('/setup/profile')}>Edit</Button>
        <Button kind="outlined" size="sm" onClick={() => nav('/sponsorship')}>Brand deal</Button>
        <Button kind="outlined" size="sm" onClick={() => nav('/c/' + c.handle + '?preview=1')}>Fan view</Button>
      </div>
      <span className="b-sm t2 mt16">{boosts.length ? `${boosts.length} boost live · ${Math.max(1, Math.round((new Date(boosts[0].created_at).getTime() + boosts[0].hours * 3600e3 - Date.now()) / 3600e3))}h left` : 'No boost running'} · Top Picks queued for Friday</span>
      <button className="card bordered row gap12 mt16" onClick={() => nav('/radar/discovery')}>
        <span className="col grow" style={{ gap: 2, textAlign: 'left' }}><span className="l-lg-b">23rd of 556 in Fitness</span><span className="b-xs t2">7th of 356 in Platinum · discovery rank 58</span></span>
        <Icon name="chevron_right" size={18} />
      </button>
      <FoundingFans c={c} />
      <div className="mt24"><SectionHeader title="Posts" action={`${fmt(c.posts_count)} TOTAL`} /></div>
      <PostsGrid posts={posts} onOpen={(p) => nav('/tools/performance/' + p.id)} />
      <div className="mt16"><Footnote>View counts update hourly</Footnote></div>
      {open && <PostViewer post={open} onClose={() => setOpen(null)} />}
    </Screen>
  );
}

// ---------- Brand ----------
const BRAND = {
  aybl: { campaign: 'SUMMER DROP 2026', desc: 'Twelve creators training in the new range. Fans who follow AYBL see every drop first.', creators: 41, live: 2, site: 'aybl.com' },
  nike: { campaign: 'NIKE PRO SPRING 2026', desc: 'Eighteen creators training in the Nike Pro range. Fans who follow Nike see every drop first.', creators: 68, live: 5, site: 'nike.com' },
};
export function BrandProfile() {
  const { id } = useParams();
  const nav = useNavigate();
  const s = useStore();
  const me = useMe();
  const toast = useToast();
  const b = s.profiles[id];
  const meta = BRAND[id];
  if (!b) return null;
  const following = isFollowing(s, me, id);
  return (
    <Screen nav="explore" inverseStatus>
      <ProfileTop c={b} />
      <div className="stats mt16"><Stat v={short(b.fans)} l="Followers" /><Stat v={meta.creators} l="Creators" /><Stat v={meta.live} l="Live campaigns" /></div>
      <Bio text={b.bio} />
      <div className="mt16"><Button kind={following ? 'outlined' : 'primary'} onClick={() => actions.follow(me, id)}>{following ? 'Following' : 'Follow'}</Button></div>
      <div className="mt24"><SectionHeader title="Live campaign" action={`${meta.live} RUNNING`} /></div>
      <div className="hero mt12" style={{ height: 420 }}>
        <Img src={s.posts.find((p) => p.creator_id === 'mia')?.media || b.cover} seed={id + 'camp'} />
        <span className="tierpill l-sm" style={{ background: 'var(--surface-dark)' }}>{b.name.toUpperCase()}</span>
        <span className="h-xl">{meta.campaign}</span>
        <span className="b-sm ti2">{meta.desc}</span>
        <div className="row gap12 mt8">
          <button className="btn primary grow" onClick={() => toast(`Opening ${meta.site}`)}><Icon name="shopping_bag" size={16} />SHOP</button>
          <button className="btn outlined inv grow" onClick={() => nav('/brand/' + id + '/exclusivity')}>DETAILS</button>
        </div>
      </div>
    </Screen>
  );
}

export function CategoryExclusivity() {
  const { id } = useParams();
  const nav = useNavigate();
  const s = useStore();
  const toast = useToast();
  const b = s.profiles[id];
  const meta = BRAND[id];
  return (
    <Screen nav="explore" inverseStatus>
      <div className="herohead">
        <button className="back" onClick={() => nav(-1)}>BACK</button>
        <span className="h-xl">CATEGORY EXCLUSIVITY</span>
        <span className="b-sm ti2">{b.name} owns Fitness · 1 Apr to 30 Jun</span>
      </div>
      <div className="card row gap12 mt16">
        <Avatar p={b} size={40} />
        <div className="col grow" style={{ gap: 6 }}><span className="h-md" style={{ fontWeight: 600 }}>Fitness</span><span className="row gap8"><Tag tone="neutral">CATEGORY</Tag><Tag>EXCLUSIVE</Tag></span></div>
        <div className="col right" style={{ gap: 2 }}><span className="h-md" style={{ fontWeight: 600 }}>1 of 1</span><span className="l-xs t2">BRAND SLOT</span></div>
      </div>
      <div className="card bordered col gap12 mt16">
        <div className="row"><span className="l-lg-b grow">CATEGORY REACH</span><span className="h-xl">312K</span></div>
        <div className="row gap12"><div className="progress"><i style={{ width: '58%' }} /></div><span className="b-xs t2">38d left</span></div>
      </div>
      <div className="statgrid mt16">
        <StatTile l="CTR · SHOP" v="3.0%" c={`9,400 taps to ${meta.site}`} />
        <StatTile l="CTR · PROFILE" v="6.0%" c="18,700 taps" />
        <StatTile l="NEW FANS" v="1,340" c={`Across ${meta.creators} creators`} />
        <StatTile l="PER ENGAGEMENT" v="$0.91" c="$40,000 ÷ 44,100" />
        <div style={{ gridColumn: '1 / -1' }}><StatTile l="CONVERSION RATE" v="0.7%" c="2,180 purchases from 312K reached" /></div>
      </div>
      <div className="card col gap8 mt16"><span className="h-md" style={{ fontWeight: 600 }}>WHAT IT LOCKS</span><Footnote>Sole brand on Fitness discovery · presented-by lockup on the category header</Footnote></div>
      <div className="row gap12 mt16"><Button kind="outlined" onClick={() => toast('Opening campaign settings')}>Manage</Button><Button onClick={() => toast('Renewal request sent')}>Renew</Button></div>
    </Screen>
  );
}
export function StatTile({ l, v, c, suffix }) {
  return (
    <div className="stattile">
      <span className="l-sm t2" style={{ letterSpacing: 1 }}>{l}</span>
      <span className="row" style={{ gap: 4, alignItems: 'baseline' }}><span className="h-lg">{v}</span>{suffix && <span className="b-sm t2">{suffix}</span>}</span>
      {c && <span className="b-xs t2">{c}</span>}
    </div>
  );
}
