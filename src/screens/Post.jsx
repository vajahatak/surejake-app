// Flow 05 Creator Post Content: choose type, photo / text / voice editor, access and price, growth tools, published.
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, FlowHeader, Intro, Footnote, Button, Icon, Img, fmt, usd, useMe } from '../components/ui.jsx';
import { SummaryCard } from './Onboarding.jsx';
import { actions, useStore, TOOL_PRICES } from '../data/store.js';
import { IMG } from '../data/seed.js';

const KEY = 'sj-draft';
const empty = { kind: 'photo', title: '', caption: 'Twenty minutes, no equipment. Full flow, tag me if you try it.', media: IMG.fitness[3], access: 'paid', price: 600, tools: ['boost', 'promotion'] };
function useDraft() {
  const [d, setD] = useState(() => { try { return JSON.parse(sessionStorage.getItem(KEY)) || empty; } catch { return empty; } });
  useEffect(() => { sessionStorage.setItem(KEY, JSON.stringify(d)); }, [d]);
  return [d, (patch) => setD((x) => ({ ...x, ...patch }))];
}

export function ChooseType() {
  const nav = useNavigate();
  const [, set] = useDraft();
  const pick = (kind) => { set({ ...empty, kind, caption: kind === 'text' ? 'Three years of chasing the last rep and the only thing that changed was how long recovery took. Here is what I do now, and the numbers behind it.' : kind === 'voice' ? 'Answering the three questions I get most about recovery.' : empty.caption, title: kind === 'text' ? 'Why I stopped training to failure' : '' }); nav('/post/' + (kind === 'video' ? 'photo' : kind)); };
  return (
    <Screen nonav>
      <FlowHeader action="DRAFTS" />
      <Intro title="What are you posting?" />
      <div className="grid2 mt20">
        {[['photo', 'image', 'Photos', 'Up to 10, one post'], ['video', 'movie', 'Video', 'Up to 10 minutes'], ['text', 'article', 'Text', 'Write something'], ['voice', 'mic', 'Voice', 'Record up to 5 min']].map(([k, ic, t, c]) => (
          <button key={k} className="choice" onClick={() => pick(k)}><span className="tile-ic"><Icon name={ic} size={22} /></span><span className="col" style={{ gap: 2 }}><span className="l-lg-b">{t}</span><span className="b-xs t2">{c}</span></span></button>
        ))}
      </div>
      <span className="fieldlabel mt24">CONTINUE A DRAFT</span>
      <button className="card bordered row gap12" style={{ padding: 12 }} onClick={() => { set({ ...empty, title: 'Mobility reset', media: IMG.fitness[6] }); nav('/post/photo'); }}>
        <span className="thumb"><Img src={IMG.fitness[6]} /></span>
        <span className="col grow" style={{ gap: 2, textAlign: 'left' }}><span className="l-lg-b">Mobility reset</span><span className="b-xs t2">Photos, edited 2 days ago</span></span>
        <Icon name="chevron_right" size={18} />
      </button>
    </Screen>
  );
}

const PHOTOS = [IMG.fitness[3], IMG.fitness[1], IMG.fitness[6], IMG.fitness[4], IMG.fitness[2]];
export function PhotoEditor() {
  const nav = useNavigate();
  const [d, set] = useDraft();
  const file = useRef();
  const onFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); const s = Math.min(1, 900 / img.width); c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); set({ media: c.toDataURL('image/jpeg', .72) }); }; img.src = r.result; };
    r.readAsDataURL(f);
  };
  return (
    <Screen nonav>
      <FlowHeader action="NEXT" onAction={() => nav('/post/access')} />
      <div className="photo-prev mt8"><Img src={d.media} /><button className="pill" style={{ position: 'absolute', right: 12, bottom: 12, height: 32 }} onClick={() => file.current.click()}><Icon name="photo_camera" size={14} />FROM DEVICE</button></div>
      <input ref={file} type="file" accept="image/*" hidden onChange={onFile} />
      <div className="media-strip mt16">
        {PHOTOS.map((p) => <button key={p} className={'mt' + (d.media === p ? ' on' : '')} onClick={() => set({ media: p })}><Img src={p} /></button>)}
        <span className="spacer" /><span className="l-xs t2">{PHOTOS.indexOf(d.media) + 1 || 1} OF 10</span>
      </div>
      <span className="fieldlabel mt20">TITLE</span>
      <div className="field"><input placeholder="Give it a short title" value={d.title} onChange={(e) => set({ title: e.target.value })} /></div>
      <span className="fieldlabel mt16">CAPTION</span>
      <div className="area"><textarea rows={3} maxLength={300} value={d.caption} onChange={(e) => set({ caption: e.target.value })} /></div>
      <div className="counter">{d.caption.length} / 300</div>
      <div className="mt16"><Button onClick={() => nav('/post/access')}>Next</Button></div>
    </Screen>
  );
}

export function TextEditor() {
  const nav = useNavigate();
  const [d, set] = useDraft();
  return (
    <Screen nonav>
      <FlowHeader action="NEXT" onAction={() => nav('/post/access')} />
      <div className="field mt8"><input value={d.title} onChange={(e) => set({ title: e.target.value })} style={{ fontWeight: 600 }} /></div>
      <div className="area mt16"><textarea rows={6} maxLength={2000} value={d.caption} onChange={(e) => set({ caption: e.target.value })} /></div>
      <div className="counter">{d.caption.length} / 2,000</div>
      <div className="toolbar mt12"><button><Icon name="format_bold" size={20} /></button><button><Icon name="format_italic" size={20} /></button><button><Icon name="format_list_bulleted" size={20} /></button><span className="spacer" /><button onClick={() => set({ media: IMG.fitness[2] })}><Icon name="image" size={20} /></button></div>
      <div className="mt20"><Button onClick={() => { set({ kind: 'text', media: d.media || null }); nav('/post/access'); }}>Next</Button></div>
    </Screen>
  );
}

export function VoiceEditor() {
  const nav = useNavigate();
  const [d, set] = useDraft();
  const [rec, setRec] = useState(true);
  const [t, setT] = useState(84);
  useEffect(() => { if (!rec) return; const i = setInterval(() => setT((x) => Math.min(300, x + 1)), 1000); return () => clearInterval(i); }, [rec]);
  const bars = Array.from({ length: 40 }, (_, i) => 20 + Math.abs(Math.sin(i * 1.7 + t / 3)) * 80);
  return (
    <Screen nonav>
      <FlowHeader action="NEXT" onAction={() => nav('/post/access')} />
      <div className="card dark p24 col gap16 mt8" style={{ alignItems: 'center' }}>
        <span className="livepill" style={rec ? undefined : { background: 'var(--surface-muted)' }}>{rec ? 'RECORDING' : 'PAUSED'}</span>
        <span className="row" style={{ gap: 6, alignItems: 'baseline' }}><span className="h-xl">{Math.floor(t / 60)}:{String(t % 60).padStart(2, '0')}</span><span className="b-sm ti2">/ 5:00</span></span>
        <div className="voicewave" style={{ width: '100%' }}>{bars.map((h, i) => <i key={i} style={{ height: h + '%', opacity: i / 40 < t / 300 + .3 ? 1 : .3 }} />)}</div>
        <button className="recbtn" onClick={() => setRec(!rec)}><Icon name={rec ? 'pause' : 'mic'} size={28} /></button>
      </div>
      <span className="fieldlabel mt20">CAPTION</span>
      <div className="area"><textarea rows={3} value={d.caption} onChange={(e) => set({ caption: e.target.value })} /></div>
      <div className="mt12"><Footnote>Voice posts are transcribed automatically. You can edit the transcript before publishing.</Footnote></div>
      <div className="mt16"><Button onClick={() => { set({ kind: 'voice', title: d.title || 'Recovery Q&A', media: IMG.fitness[4] }); nav('/post/access'); }}>Next</Button></div>
    </Screen>
  );
}

const ACCESS = [['everyone', 'Everyone', 'Appears in Browse, Trending and For You'], ['fans', 'Fans only', 'Anyone who follows you'], ['subscribers', 'Subscribers only', '2,500 J a month'], ['paid', 'Pay to unlock', 'One-off, any fan']];
export function AccessPrice() {
  const nav = useNavigate();
  const [d, set] = useDraft();
  const keep = [Math.round(d.price * .8), Math.round(d.price * .85)];
  return (
    <Screen nonav>
      <FlowHeader action="NEXT" onAction={() => nav('/post/tools')} />
      <Intro title="Who can see it?" />
      <div className="col gap12 mt16">
        {ACCESS.map(([k, t, c]) => (
          <button key={k} className={'selrow' + (d.access === k ? ' on' : '')} onClick={() => set({ access: k })}>
            <span className="radio" />
            <span className="col grow" style={{ gap: 2 }}><span className="row gap8"><span className="l-lg-b">{t}</span>{d.access === k && <span className="tag brand">SELECTED</span>}</span><span className="b-xs t2">{c}</span></span>
          </button>
        ))}
      </div>
      {d.access === 'paid' && (
        <>
          <span className="fieldlabel mt20">UNLOCK PRICE</span>
          <div className="field focus" style={{ height: 56, gap: 16 }}>
            <Icon name="bolt" size={24} />
            <input inputMode="numeric" value={d.price} onChange={(e) => set({ price: parseInt(e.target.value.replace(/\D/g, '') || '0', 10) })} style={{ fontFamily: 'var(--display)', fontWeight: 700, letterSpacing: 1.5 }} />
            <span className="l-sm t2">{usd(d.price / 100)}</span>
          </div>
          <SummaryCard className="mt12" rows={[['You keep', 'After the 15 to 20% fee', `${fmt(keep[0])} to ${fmt(keep[1])} J`], ['Typical unlock in Fitness', null, '500 to 900 J', true]]} />
        </>
      )}
      <div className="mt20"><Button onClick={() => nav('/post/tools')} disabled={d.access === 'paid' && d.price < 100}>Next</Button></div>
    </Screen>
  );
}

const TOOLS = [['boost', 'Boost', '48 hours inside Platinum, est. 1,800 to 2,600', 1800, 2600], ['promotion', 'Promotion', '3 days across all of Fitness, est. 4,800 to 7,200', 4800, 7200], ['top_picks', 'Top Picks', 'One hour in the Fitness rail, 7 slots', 4200, 6800], ['pulse', 'Pulse', 'Broadcast to all 750 fans, pinned in messages', 300, 500]];
export function GrowthToolsStep() {
  const nav = useNavigate();
  const me = useMe();
  const [d, set] = useDraft();
  const [busy, setBusy] = useState(false);
  const t = (k) => set({ tools: d.tools.includes(k) ? d.tools.filter((x) => x !== k) : [...d.tools, k] });
  const sel = TOOLS.filter(([k]) => d.tools.includes(k));
  const total = sel.reduce((a, [k]) => a + TOOL_PRICES[k].price, 0);
  const reach = sel.reduce((a, x) => [a[0] + x[3], a[1] + x[4]], [0, 0]);
  const publish = async (tools) => {
    setBusy(true);
    try {
      const id = await actions.publish(me, { kind: d.kind, title: d.title || d.caption.split(/[.,]/)[0].slice(0, 28), caption: d.caption, media: d.media, access: d.access, price: d.access === 'paid' ? d.price : 0, tools });
      sessionStorage.setItem('sj-last-post', JSON.stringify({ ...d, id, tools }));
      sessionStorage.removeItem(KEY);
      nav('/post/published', { replace: true });
    } catch (e) { alert(e.message); }
    setBusy(false);
  };
  return (
    <Screen nonav>
      <FlowHeader action="SKIP" onAction={() => publish([])} />
      <Intro title="Give it a push?" sub="Optional. Tools buy reach. They never move your health score or tier." />
      <div className="col gap12 mt16">
        {TOOLS.map(([k, n, c]) => (
          <button key={k} className={'selrow' + (d.tools.includes(k) ? ' on' : '')} onClick={() => t(k)}>
            <span className="checkbox">{d.tools.includes(k) && <Icon name="check" size={16} />}</span>
            <span className="col grow" style={{ gap: 2 }}><span className="l-lg-b">{n}</span><span className="b-xs t2">{c}</span></span>
            <span className="amt">{usd(TOOL_PRICES[k].price)}</span>
          </button>
        ))}
      </div>
      <SummaryCard className="mt12" rows={[[`${sel.length} tool${sel.length === 1 ? '' : 's'} selected`, 'Charged when the post publishes', usd(total)], ['Estimated extra reach', null, sel.length ? `${fmt(reach[0])} to ${fmt(reach[1])}` : 'None', true]]} />
      <div className="mt16"><Button onClick={() => publish(d.tools)} disabled={busy}>{busy ? 'Publishing…' : 'Publish post'}</Button></div>
    </Screen>
  );
}

export function Published() {
  const nav = useNavigate();
  const s = useStore();
  const last = (() => { try { return JSON.parse(sessionStorage.getItem('sj-last-post')); } catch { return null; } })();
  if (!last) return <Screen nonav><Button onClick={() => nav('/studio')}>Back to profile</Button></Screen>;
  const total = last.tools.reduce((a, k) => a + TOOL_PRICES[k].price, 0);
  const access = last.access === 'paid' ? `Pay to unlock, ${fmt(last.price)} J` : ACCESS.find((a) => a[0] === last.access)[1];
  return (
    <Screen nonav>
      <div className="col gap12 mt24" style={{ alignItems: 'center' }}>
        <span className="success-mark"><Icon name="check" size={36} /></span>
        <span className="h-lg center">Post is live</span>
        <span className="b-sm t2 center">It is in Fitness Browse now, and in Trending within the hour. Fans see it in their feed straight away.</span>
      </div>
      <div className="card bordered row gap12 mt16" style={{ padding: 12 }}>
        <span className="thumb">{last.media && <Img src={last.media} />}</span>
        <span className="col grow" style={{ gap: 2 }}><span className="l-lg-b">{last.title || last.caption.slice(0, 28)}</span><span className="b-xs t2">{access}</span></span>
      </div>
      <div className="mt8">
        {last.tools.map((k) => <div key={k} className="receipt"><span className="col grow" style={{ gap: 2 }}><span className="l-lg-b">{TOOL_PRICES[k].label}</span><span className="b-xs t2">{TOOL_PRICES[k].hours ? `${TOOL_PRICES[k].hours >= 48 ? TOOL_PRICES[k].hours / 24 + ' days' : TOOL_PRICES[k].hours + ' hour'}, running` : 'Sent'}</span></span><span className="amt">{usd(TOOL_PRICES[k].price)}</span></div>)}
        {last.tools.length > 0 && <div className="receipt"><span className="col grow" style={{ gap: 2 }}><span className="l-lg-b">Charged</span><span className="b-xs t2">To your balance</span></span><span className="amt">{usd(total)}</span></div>}
      </div>
      <div className="col gap12 mt20">
        <Button onClick={() => nav('/tools/performance/' + last.id)}>View post performance</Button>
        <Button kind="text" onClick={() => nav('/studio')}>Back to profile</Button>
      </div>
      {s && null}
    </Screen>
  );
}
