// Flow 11.1 (J Coin Shop) and 11.2 (J Coin History).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, FlowHeader, Intro, Footnote, Button, Icon, Tag, fmt, usd, useMe, useToast, CoinCircle } from '../components/ui.jsx';
import { CoinPack, PACKS } from '../components/MoneySheets.jsx';
import { useStore, actions } from '../data/store.js';

export function Shop() {
  const nav = useNavigate();
  const s = useStore();
  const me = useMe();
  const toast = useToast();
  const [sel, setSel] = useState(3);
  const [busy, setBusy] = useState(false);
  const bal = s.profiles[me]?.balance ?? 0;
  const buy = async () => {
    setBusy(true);
    const p = PACKS[sel];
    try { await actions.topUp(me, p.coins, p.bonus, p.usd); toast(`Added ${fmt(p.coins + p.bonus)} J Coin`); } catch (e) { toast(e.message); }
    setBusy(false);
  };
  return (
    <Screen nav="wallet">
      <div className="row gap12" style={{ height: 44 }}>
        <Button kind="outlined" size="sm" full={false} onClick={() => nav(-1)}>Close</Button>
        <span className="h-xl grow">Shop</span>
        <button onClick={() => nav('/wallet/history')}><Tag><Icon name="bolt" size={11} />{fmt(bal)}</Tag></button>
      </div>
      <div className="grid2 mt16">{PACKS.slice(0, 4).map((p, i) => <CoinPack key={i} p={p} on={sel === i} onClick={() => setSel(i)} />)}</div>
      <div className="grid2 mt12"><CoinPack p={PACKS[4]} on={sel === 4} onClick={() => setSel(4)} wide /></div>
      <div className="mt16"><Button onClick={buy} disabled={busy}>{busy ? 'Adding…' : `Buy ${fmt(PACKS[sel].coins + PACKS[sel].bonus)} J · ${usd(PACKS[sel].usd)}`}</Button></div>
      <div className="mt16"><Footnote>Bonus J Coin is added on top and never expires. J Coin is spent on Sure Jake and cannot be transferred or cashed out. Demo mode: no card is charged.</Footnote></div>
    </Screen>
  );
}

export function History() {
  const nav = useNavigate();
  const s = useStore();
  const me = useMe();
  const [f, setF] = useState('ALL');
  const bal = s.profiles[me]?.balance ?? 0;
  const tx = s.transactions.filter((t) => t.user_id === me && (f === 'ALL' || (f === 'SPENT' ? t.amount < 0 : t.amount > 0))).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const groups = [];
  for (const t of tx) {
    const d = new Date(t.created_at);
    const days = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 864e5);
    const label = days === 0 ? 'TODAY' : days === 1 ? 'YESTERDAY' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }).toUpperCase();
    const g = groups.find((x) => x[0] === label);
    g ? g[1].push(t) : groups.push([label, [t]]);
  }
  return (
    <Screen nav="wallet">
      <FlowHeader action="EXPORT" />
      <Intro title="History" />
      <div className="card dark row mt16" style={{ padding: '18px 20px', justifyContent: 'space-between' }}>
        <span className="row gap8"><CoinCircle size={32} /><span className="h-lg">{fmt(bal)}</span><span className="b-xs">J COIN</span></span>
        <button className="btn primary xs" style={{ height: 30, fontSize: 11 }} onClick={() => nav('/wallet')}><Icon name="add" size={12} />TOP UP</button>
      </div>
      <div className="seg mt16">{['ALL', 'SPENT', 'ADDED'].map((x) => <button key={x} className={f === x ? 'on' : ''} onClick={() => setF(x)}>{x}</button>)}</div>
      {groups.map(([label, list]) => (
        <div key={label} className="mt16">
          <span className="eyebrow">{label}</span>
          <div className="card mt8" style={{ padding: '0 16px' }}>
            {list.map((t, i) => (
              <div key={t.id} className="txrow" style={i ? { borderTop: '1px solid var(--border-disabled)' } : undefined}>
                <span className="ico"><Icon name={t.amount > 0 ? 'add' : t.title.startsWith('Tip') ? 'paid' : t.title.startsWith('Unlock') ? 'lock_open' : t.title.startsWith('Subscribed') ? 'star' : 'redeem'} size={20} /></span>
                <span className="col grow" style={{ gap: 0 }}><span className="l-md" style={{ letterSpacing: .5 }}>{t.title}</span><span className="b-xs t2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subtitle}</span></span>
                <span className="col right" style={{ gap: 2 }}><span className="l-md" style={{ color: t.amount > 0 ? 'var(--green-700)' : undefined }}>{t.amount > 0 ? '+' : '-'}{fmt(Math.abs(t.amount))}</span><span className="b-xs t2">{usd(t.usd)}</span></span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="mt16"><Footnote>Dollar figures are what each transaction cost you, based on the rate you paid at top-up.</Footnote></div>
    </Screen>
  );
}
