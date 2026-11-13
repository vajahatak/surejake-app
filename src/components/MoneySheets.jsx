// Fan money flows as bottom sheets: Send a Tip (11.3/11.4), Top Up to Tip (11.5), Tip Sent (11.6),
// Subscribe (13.1/13.2), DM Access (10.3) and a plain top up for locked posts.
import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetHeader, Icon, Avatar, Tag, Button, Footnote, fmt, jToUsd, usd, useMe, useToast, CoinCircle, JCoin } from './ui.jsx';
import { useStore, actions, isFollowing } from '../data/store.js';

const Ctx = createContext(null);
export const useMoney = () => useContext(Ctx);

export const PACKS = [
  { coins: 1000, bonus: 0, usd: 10 },
  { coins: 2500, bonus: 150, usd: 25 },
  { coins: 5000, bonus: 400, usd: 50 },
  { coins: 10000, bonus: 1200, usd: 100 },
  { coins: 25000, bonus: 0, usd: 250, best: true },
];

export function MoneyProvider({ children }) {
  const [sheet, setSheet] = useState(null);
  const api = {
    tip: (creator) => setSheet({ type: 'tip', creator }),
    subscribe: (creator) => setSheet({ type: 'sub', creator }),
    dm: (creator) => setSheet({ type: 'dm', creator }),
    topUpFor: (post) => setSheet({ type: 'unlock', post }),
  };
  const close = () => setSheet(null);
  return (
    <Ctx.Provider value={api}>
      {children}
      {sheet?.type === 'tip' && <TipFlow creatorId={sheet.creator.id} onClose={close} />}
      {sheet?.type === 'sub' && <SubscribeFlow creatorId={sheet.creator.id} onClose={close} />}
      {sheet?.type === 'dm' && <DmAccess creatorId={sheet.creator.id} onClose={close} onSubscribe={() => setSheet({ type: 'sub', creator: sheet.creator, plan: 1 })} />}
      {sheet?.type === 'unlock' && <UnlockTopUp post={sheet.post} onClose={close} />}
    </Ctx.Provider>
  );
}

function CreatorLine({ c, sub }) {
  return (
    <div className="row gap12">
      <Avatar p={c} size={44} />
      <div className="col grow" style={{ gap: 2 }}>
        <span className="l-lg-b" style={{ letterSpacing: 1 }}>@{c.handle}</span>
        <span className="b-xs t2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{sub}</span>
      </div>
      <Tag>{c.tier}</Tag>
    </div>
  );
}
function DarkSummary({ rows }) {
  return (
    <div className="card dark p20 col" style={{ gap: 14 }}>
      {rows.map(([label, caption, value, yellow], i) => (
        <div key={i} className="col" style={{ gap: 14 }}>
          {i > 0 && <div className="divider" style={{ background: 'rgba(255,255,255,.2)' }} />}
          <div className="row gap12">
            <div className="col grow" style={{ gap: 2 }}><span className="l-lg-b">{label}</span>{caption && <span className="b-xs ti2">{caption}</span>}</div>
            <span className="amt" style={{ color: yellow ? 'var(--primary)' : '#fff' }}>{value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
function KeyValueCard({ rows }) {
  return (
    <div className="card bordered col gap12">
      {rows.map(([t, c, v], i) => (
        <div key={i} className="col gap12">
          {i > 0 && <div className="divider" style={{ background: 'var(--border)' }} />}
          <div className="kv-row"><div className="col grow" style={{ gap: 2 }}><span className="l-lg-b">{t}</span><span className="b-xs t2">{c}</span></div><span className="v">{v}</span></div>
        </div>
      ))}
    </div>
  );
}
export { KeyValueCard, DarkSummary };

function TipFlow({ creatorId, onClose }) {
  const nav = useNavigate();
  const me = useMe();
  const s = useStore();
  const c = s.profiles[creatorId];
  const bal = s.profiles[me]?.balance ?? 0;
  const lastPost = s.posts.filter((p) => p.creator_id === creatorId).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const [amount, setAmount] = useState(300);
  const [custom, setCustom] = useState('');
  const [note, setNote] = useState('');
  const [step, setStep] = useState('pick');
  const [pack, setPack] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const value = custom ? parseInt(custom, 10) || 0 : amount;
  const short = value > bal;

  const send = async () => {
    setErr('');
    if (value < 100) { setErr('Minimum tip is 100 J'); return; }
    if (short) { setPack(PACKS.findIndex((p) => p.coins + p.bonus + bal >= value)); setStep('topup'); return; }
    setBusy(true);
    try { await actions.tip(me, creatorId, value, note); setStep('sent'); } catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const topUpAndSend = async () => {
    setBusy(true);
    try {
      const p = PACKS[Math.max(0, pack)];
      await actions.topUp(me, p.coins, p.bonus, p.usd);
      await actions.tip(me, creatorId, value, note);
      setStep('sent');
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  if (step === 'sent') {
    const followed = isFollowing(s, me, creatorId);
    return (
      <Sheet onClose={onClose} tall>
        <div className="col gap16">
          <div className="card dark p20 col gap12">
            <span className="b-xs up">Tip sent to @{c.handle}</span>
            <div className="row gap12"><CoinCircle size={48} /><div className="col"><span className="h-xl">{fmt(value)}</span><span className="l-lg-b">J COIN</span></div></div>
            <span className="b-xs">Worth {jToUsd(value)} · {c.name.split(' ')[0]} sees your name{note ? ' and your note' : ''}</span>
          </div>
          <KeyValueCard rows={[['Your note', 'Sent with the tip', note ? (note.length > 14 ? note.slice(0, 13) + '…' : note) : 'None'], ['New balance', '1 J Coin = $0.01', fmt(s.profiles[me].balance) + ' J']]} />
          <div className="sechead"><h3 className="h-lg" style={{ margin: 0 }}>Receipt</h3><button className="l-md" onClick={() => { onClose(); nav('/wallet/history'); }}>WALLET HISTORY</button></div>
          {followed && (
            <div className="alert success"><span className="aic"><Icon name="check" size={14} /></span><div className="col" style={{ gap: 4 }}><span className="l-md">Founding Fan streak</span><span className="b-sm">You follow {c.name.split(' ')[0]} at {c.tier}. Keep supporting and the badge locks in when they climb a tier.</span></div></div>
          )}
          <div className="row gap12 mt16">
            <Button kind="outlined" onClick={() => { onClose(); nav('/messages'); }}>Message</Button>
            <Button onClick={() => { onClose(); nav('/home'); }}>Back to feed</Button>
          </div>
        </div>
      </Sheet>
    );
  }

  if (step === 'topup') {
    return (
      <Sheet onClose={onClose}>
        <div className="col gap16">
          <SheetHeader title="Top up to tip" onClose={onClose} />
          <CreatorLine c={c} sub={`Tip of ${fmt(value)} J waiting to send`} />
          <div className="alert notice"><span className="aic"><Icon name="account_balance_wallet" size={14} /></span><div className="col" style={{ gap: 4 }}><span className="l-md">Not enough J Coin</span><span className="b-sm">You have {fmt(bal)} J. Add a pack and the tip sends straight after.</span></div></div>
          <span className="eyebrow">CHOOSE A PACK</span>
          <div className="grid2">
            {PACKS.slice(0, 2).map((p, i) => <CoinPack key={i} p={p} on={pack === i} onClick={() => setPack(i)} />)}
          </div>
          <DarkSummary rows={[['Top up', null, usd(PACKS[Math.max(0, pack)].usd)], ['Tip to send', null, fmt(value) + ' J', true]]} />
          {err && <span className="err">{err}</span>}
          <Button onClick={topUpAndSend} disabled={busy || PACKS[Math.max(0, pack)].coins + PACKS[Math.max(0, pack)].bonus + bal < value}>{busy ? 'Working…' : 'Top up and send'}</Button>
          <Footnote>Demo mode: no card is charged. J Coin never expires and is spent anywhere on Sure Jake.</Footnote>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet onClose={onClose}>
      <div className="col gap16">
        <SheetHeader title="Send a tip" onClose={onClose} />
        <CreatorLine c={c} sub={lastPost?.caption || c.bio} />
        <div className="row"><span className="eyebrow grow">TIP AMOUNT</span><Tag tone="dark">{fmt(bal)} J COIN</Tag></div>
        <div className="row gap8">
          {[100, 300, 500, 1000].map((a) => (
            <button key={a} className={'amtchip' + (!custom && amount === a ? ' on' : '')} onClick={() => { setAmount(a); setCustom(''); }}>
              <span className="l-md">{fmt(a)}</span><span className="b-xs t2">{jToUsd(a)}</span>
            </button>
          ))}
        </div>
        <div className={'field' + (custom ? ' focus' : '')} style={{ height: 56, gap: 16 }}>
          <JCoin size={28} />
          <input placeholder="Other amount" inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14, letterSpacing: 1.5 }} />
          <span className="l-sm t2">{custom ? jToUsd(value) : 'MIN 100'}</span>
        </div>
        <div className="field"><input placeholder="Add a note, optional" value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} /></div>
        <DarkSummary rows={[['Tip', null, fmt(value) + ' J'], ['Balance after', `Worth ${jToUsd(Math.max(0, bal - value))}`, short ? 'Top up' : fmt(bal - value) + ' J', true]]} />
        {err && <span className="err">{err}</span>}
        <Button onClick={send} disabled={busy || value < 1}>{busy ? 'Sending…' : short ? `Top up to send ${fmt(value)} J` : `Send ${fmt(value)} J`}</Button>
        <Footnote>{note ? `Your note is shown to @${c.handle} with the tip. Tips are final and cannot be refunded.` : 'Paid from your J Coin balance. Nothing is charged to your card and no fee is added. Tips are final.'}</Footnote>
      </div>
    </Sheet>
  );
}

export function CoinPack({ p, on, onClick, wide }) {
  return (
    <button className={'coinpack' + (on ? ' on' : '') + (p.best ? ' best' : '')} onClick={onClick} style={wide ? { gridColumn: '1 / -1' } : undefined}>
      <div className="media">
        {p.bonus > 0 && <span className="bonus tag" style={{ background: '#fff' }}>+{fmt(p.bonus)} FREE</span>}
        {p.best && <span className="bonus tag brand">BEST VALUE</span>}
        <div className="row" style={{ gap: 0 }}>
          {Array.from({ length: Math.min(5, 1 + Math.round(Math.log10(p.coins / 500) * 2)) }).map((_, i) => <span key={i} style={{ marginLeft: i ? -12 : 0 }}><JCoin size={36 + (i % 2) * 10} /></span>)}
        </div>
      </div>
      <div className="info">
        <span className="row" style={{ gap: 6, alignItems: 'baseline' }}><span className="amt">{fmt(p.coins)}</span><span className="l-sm t2">J COIN</span></span>
        <span className="price">{usd(p.usd)}</span>
      </div>
    </button>
  );
}

const PLANS = [
  { name: 'Basic Access', price: 1200, sub: '1,200 J per month · Exclusive posts' },
  { name: 'Premium Access', price: 2500, sub: '2,500 J per month · Posts, DMs, Live VIP' },
  { name: 'Annual Plan', price: 24000, sub: '24,000 J per year · Save 20%' },
];
function SubscribeFlow({ creatorId, onClose }) {
  const nav = useNavigate();
  const me = useMe();
  const s = useStore();
  const c = s.profiles[creatorId];
  const bal = s.profiles[me]?.balance ?? 0;
  const [plan, setPlan] = useState(1);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [topup, setTopup] = useState(false);
  const p = PLANS[plan];
  const short = p.price > bal;
  const first = c.name.split(' ')[0];

  const go = async () => {
    setBusy(true);
    try {
      if (short) {
        const pack = PACKS.find((k) => k.coins + k.bonus + bal >= p.price) || PACKS[4];
        await actions.topUp(me, pack.coins, pack.bonus, pack.usd);
      }
      await actions.subscribe(me, creatorId, p.name, p.price);
      setDone(true);
    } catch (e) { alert(e.message); }
    setBusy(false);
  };

  if (done) {
    const renew = new Date(Date.now() + (plan === 2 ? 365 : 30) * 864e5).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return (
      <Sheet onClose={onClose} tall>
        <div className="col gap16">
          <div className="card dark p20 col gap12">
            <span className="b-xs up">Subscribed to @{c.handle}</span>
            <div className="row gap12"><CoinCircle size={48} /><div className="col"><span className="h-xl">{fmt(p.price)}</span><span className="l-lg-b">J COIN / {plan === 2 ? 'YEAR' : 'MONTH'}</span></div></div>
            <span className="b-xs">{p.name} · Renews every {plan === 2 ? 'year' : 'month'}</span>
          </div>
          <KeyValueCard rows={[['Next renewal', 'Cancel any time', renew], ['New balance', '1 J Coin = $0.01', fmt(s.profiles[me].balance) + ' J']]} />
          <h3 className="h-lg" style={{ margin: 0 }}>What's unlocked</h3>
          <div className="col gap12">
            <span className="checkli"><Icon name="check_circle" size={18} />Exclusive posts from {first}</span>
            {plan > 0 && <span className="checkli"><Icon name="check_circle" size={18} />Unlimited direct messages</span>}
            {plan > 0 && <span className="checkli"><Icon name="check_circle" size={18} />Live VIP entry</span>}
          </div>
          <div className="alert success"><span className="aic"><Icon name="check" size={14} /></span><div className="col" style={{ gap: 4 }}><span className="l-md">{p.name} is live</span><span className="b-sm">Exclusive posts{plan > 0 ? ', direct messages and Live VIP entry are' : ' are'} now open to you.</span></div></div>
          <div className="row gap12 mt8">
            <Button kind="outlined" onClick={() => { onClose(); nav('/messages/' + c.handle); }}>Message</Button>
            <Button onClick={onClose}>View posts</Button>
          </div>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet onClose={onClose}>
      <div className="col gap16">
        <SheetHeader title="Subscribe" sub="Choose a plan" onClose={onClose} />
        <Footnote>Paid in J Coin from your wallet. Cancel any time and keep access until the period ends.</Footnote>
        <div className="col gap12">
          {PLANS.map((x, i) => (
            <button key={x.name} className={'optcard' + (plan === i ? ' on' : '')} onClick={() => setPlan(i)}>
              <span className="col grow" style={{ gap: 4 }}><span className="l-md">{x.name}</span><span className="b-xs t2">{x.sub}</span></span>
              <span className="ind"><Icon name="check" size={14} /></span>
            </button>
          ))}
        </div>
        <KeyValueCard rows={[['Wallet balance', '1 J Coin = $0.01', fmt(bal) + ' J'], ['After subscribing', short ? 'Includes a top up' : p.name, short ? 'Top up' : fmt(bal - p.price) + ' J']]} />
        {short && !topup && <div className="alert notice"><span className="aic"><Icon name="account_balance_wallet" size={14} /></span><div className="col" style={{ gap: 4 }}><span className="l-md">Top up needed</span><span className="b-sm">You have {fmt(bal)} J. We'll add the smallest pack that covers it, then subscribe. Demo mode: no card is charged.</span></div></div>}
        <Button onClick={go} disabled={busy}>{busy ? 'Working…' : short ? `Top up and subscribe` : `Continue · ${fmt(p.price)} J/${plan === 2 ? 'YR' : 'MO'}`}</Button>
      </div>
    </Sheet>
  );
}

function DmAccess({ creatorId, onClose, onSubscribe }) {
  const s = useStore();
  const c = s.profiles[creatorId];
  return (
    <Sheet onClose={onClose}>
      <div className="col" style={{ gap: 14 }}>
        <SheetHeader title="DM Access" sub="Monthly subscription" onClose={onClose} />
        <div className="row gap16 mt8"><Avatar p={c} size={64} /><div className="col gap8"><span className="h-lg up">{c.name}</span><span className="row gap8"><Tag tone="neutral">{c.category}</Tag><Tag>{c.tier}</Tag></span></div></div>
        <Footnote>Message {c.name.split(' ')[0]} directly. Renews monthly, cancel any time. You keep access until the period ends.</Footnote>
        <KeyValueCard rows={[['Price', 'Billed monthly', '2,500 J'], ['Typical reply time', 'Last 30 days', '4h']]} />
        <span className="eyebrow">WHAT'S INCLUDED</span>
        {['Unlimited direct messages', 'Subscriber spotlight on their profile', 'Creator Live VIP entry', 'Priority comments during Creator Lives'].map((t) => <span key={t} className="checkli"><Icon name="check_circle" size={18} />{t}</span>)}
        <Button className="mt8" onClick={onSubscribe}>Subscribe · 2,500 J/mo</Button>
      </div>
    </Sheet>
  );
}

function UnlockTopUp({ post, onClose }) {
  const me = useMe();
  const toast = useToast();
  const s = useStore();
  const bal = s.profiles[me]?.balance ?? 0;
  const [pack, setPack] = useState(0);
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try { const p = PACKS[pack]; await actions.topUp(me, p.coins, p.bonus, p.usd); await actions.unlock(me, post.id); toast('Post unlocked'); onClose(); } catch (e) { alert(e.message); }
    setBusy(false);
  };
  return (
    <Sheet onClose={onClose}>
      <div className="col gap16">
        <SheetHeader title="Top up to unlock" onClose={onClose} />
        <span className="b-sm t2">This post costs {fmt(post.price)} J. You have {fmt(bal)} J.</span>
        <div className="grid2">{PACKS.slice(0, 2).map((p, i) => <CoinPack key={i} p={p} on={pack === i} onClick={() => setPack(i)} />)}</div>
        <Button onClick={go} disabled={busy}>{busy ? 'Working…' : `Top up and unlock`}</Button>
        <Footnote>Demo mode: no card is charged.</Footnote>
      </div>
    </Sheet>
  );
}
