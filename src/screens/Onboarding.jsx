// Flows 01 (Role Select), 02 (Creator Account) and 03 (Creator Profile Setup).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, FlowHeader, Intro, Footnote, Button, Step, Icon, BrandMark, Img } from '../components/ui.jsx';
import { setSession, useSession, DEMO_USERS } from '../data/store.js';
import { CATEGORY_IMG } from '../data/seed.js';

export function RoleChoice() {
  const nav = useNavigate();
  const [role, setRole] = useState('creator');
  const creator = role === 'creator';
  return (
    <Screen nonav>
      <FlowHeader back={false} />
      <Intro title="What brings you to Sure Jake?" sub="Pick one to start. You can do the other later without making a second account." />
      <span className="eyebrow mt20">I'M HERE TO</span>
      <div className="row mt12" style={{ alignItems: 'stretch' }}>
        <RoleCard on={creator} icon="photo_camera" title="POST" sub="Get found and get paid" onClick={() => setRole('creator')} />
        <RoleCard on={!creator} icon="visibility" title="WATCH" sub="Follow and support" onClick={() => setRole('fan')} />
      </div>
      <div className="mt20"><Footnote>{creator ? 'Creator setup needs your ID and payout details. Watching needs neither.' : 'Browsing is free and nothing is charged until you choose to spend.'}</Footnote></div>
      <div className="mt20">
        <Button onClick={() => nav(creator ? '/creator/start' : '/fan/start')}>{creator ? 'Continue as a creator' : 'Continue as a fan'}</Button>
      </div>
    </Screen>
  );
}
function RoleCard({ on, icon, title, sub, onClick }) {
  return (
    <button className={'rolecard' + (on ? ' on' : '')} onClick={onClick}>
      <Icon name={icon} size={64} />
      <span className="h-lg">{title}</span>
      <span className="b-xs center">{sub}</span>
      <span className="sel">{on && <Icon name="check" size={14} />}</span>
    </button>
  );
}

export function FanStart() {
  const nav = useNavigate();
  const go = (to) => { setSession({ role: 'fan', userId: DEMO_USERS.fan }); nav(to); };
  return (
    <Screen nonav>
      <FlowHeader />
      <Intro title="You're in" sub="Nothing to set up. Pick what you are into and your Browse builds from there." />
      <div className="col gap16 mt16">
        <Step title="Browsing is free" desc="Every category, every profile, no card needed." />
        <Step title="Pay for what you choose" desc="Tips from 100 J, about £1. Nothing renews unless you say so." />
        <Step title="Follow early, keep the badge" desc="Back a creator before they climb a tier and you stay a Founding Fan." />
      </div>
      <div className="col gap16 mt24">
        <Button onClick={() => go('/explore/niches')}>Pick your categories</Button>
        <Button kind="text" onClick={() => nav('/creator/start')}>Set up as a creator instead</Button>
      </div>
    </Screen>
  );
}

export function CreatorStart() {
  const nav = useNavigate();
  const skip = () => { setSession({ role: 'creator', userId: DEMO_USERS.creator }); nav('/studio'); };
  return (
    <Screen nonav>
      <FlowHeader action="SKIP FOR NOW" onAction={skip} />
      <Intro title="Creator setup" sub="About five minutes. You can browse as a fan while it is reviewed." />
      <div className="col gap16 mt16">
        <Step n="1" title="Age and legal name" desc="You must be 18 or over. The name has to match your ID." />
        <Step n="2" title="Profile and category" desc="Display name, username, bio and the niche you post in." />
        <Step n="3" title="Payout and ID check" desc="Where the money goes, then a photo ID and a selfie." />
      </div>
      <div className="mt24"><Footnote>Posting works straight away. Payouts and subscriptions unlock once the ID check clears.</Footnote></div>
      <div className="mt20"><Button onClick={() => nav('/signin')}>Start setup</Button></div>
    </Screen>
  );
}

export function Welcome() {
  const nav = useNavigate();
  const go = () => nav('/signin/phone');
  return (
    <Screen nonav>
      <div style={{ height: 150 }} />
      <BrandMark size={72} />
      <div style={{ height: 180 }} />
      <div className="d-lg" style={{ fontSize: 40 }}>SureJake</div>
      <div className="h-md mt8">Get paid for what you make.</div>
      <div className="col gap12 mt16">
        <AuthButton icon="apple" label="Continue with Apple" onClick={go} />
        <AuthButton icon="google" label="Continue with Google" onClick={go} />
        <AuthButton icon="mail" label="Continue with email" onClick={go} />
      </div>
      <p className="b-xs t2 mt16" style={{ margin: '16px 0 0' }}>You must be 18 or over. Every creator is identity-verified before a first payout. By continuing you agree to the Creator Terms and Privacy Policy.</p>
    </Screen>
  );
}
const PROVIDER = {
  apple: <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M16.37 12.6c-.02-2.28 1.86-3.38 1.95-3.43-1.06-1.55-2.71-1.77-3.3-1.79-1.4-.14-2.74.83-3.45.83-.71 0-1.81-.81-2.97-.79-1.53.02-2.94.89-3.73 2.26-1.59 2.76-.41 6.84 1.14 9.08.76 1.09 1.66 2.32 2.84 2.28 1.14-.05 1.57-.74 2.95-.74 1.38 0 1.77.74 2.97.71 1.23-.02 2-1.11 2.75-2.21.87-1.27 1.22-2.49 1.24-2.56-.03-.01-2.37-.91-2.39-3.64zM14.11 5.9c.63-.76 1.05-1.82.94-2.87-.9.04-2 .6-2.65 1.36-.58.67-1.09 1.75-.95 2.78 1 .08 2.03-.51 2.66-1.27z"/></svg>,
  google: <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M21.35 11.1H12.18v2.83h5.24c-.23 1.25-.94 2.3-2 3.01v2.5h3.24c1.9-1.75 2.99-4.32 2.99-7.37 0-.68-.06-1.33-.18-1.97zM12.18 21c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.75-5.59-4.11H3.25v2.58A9.99 9.99 0 0 0 12.18 21zM6.59 12.92a6 6 0 0 1 0-3.84V6.5H3.25a10 10 0 0 0 0 8.99l3.34-2.57zM12.18 4.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C17.13 1.97 14.87 1 12.18 1A9.99 9.99 0 0 0 3.25 6.5l3.34 2.58c.79-2.36 2.99-4.1 5.59-4.1z"/></svg>,
};
function AuthButton({ icon, label, onClick }) {
  return (
    <button className="btn secondary full" style={{ height: 52, letterSpacing: 1.5, fontSize: 12 }} onClick={onClick}>
      {PROVIDER[icon] || <Icon name={icon} size={18} />}{label}
    </button>
  );
}

export function PhoneNumber() {
  const nav = useNavigate();
  const [v, setV] = useState('7700 900123');
  return (
    <Screen nonav>
      <FlowHeader />
      <Intro title="What's your phone number?" sub="We text a six-digit code to confirm it is you. This number is never shown to fans." />
      <div className="field mt20"><span className="l-lg-b">+44</span><input value={v} onChange={(e) => setV(e.target.value)} inputMode="tel" /></div>
      <button className="b-sm mt20" style={{ textAlign: 'left', textDecoration: 'underline' }} onClick={() => nav('/signin/code')}>Use email instead</button>
      <div className="mt20"><Button onClick={() => nav('/signin/code')}>Send code</Button></div>
      <div className="mt20"><Footnote>Message and data rates may apply. Reply STOP to cancel.</Footnote></div>
    </Screen>
  );
}

export function ConfirmCode() {
  const nav = useNavigate();
  const [code, setCode] = useState('418');
  return (
    <Screen nonav>
      <FlowHeader />
      <Intro title="Enter the code" sub="Sent to +44 7700 •••123. It expires in ten minutes. For the demo, any six digits work." />
      <label className="codecells mt20" style={{ position: 'relative' }}>
        {Array.from({ length: 6 }).map((_, i) => <span key={i} className={'codecell' + (i === code.length ? ' on' : '')}>{code[i] || ''}</span>)}
        <input autoFocus inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{ position: 'absolute', inset: 0, opacity: 0 }} aria-label="Code" />
      </label>
      <span className="b-sm t2 mt20">Request another code in 45s</span>
      <div className="mt20"><Button disabled={code.length < 6} onClick={() => nav('/signin/dob')}>Confirm</Button></div>
      <span className="b-sm center mt20">Need help signing in?</span>
    </Screen>
  );
}

export function DateOfBirth() {
  const nav = useNavigate();
  const [d, setD] = useState({ dd: '18', mm: '03', yyyy: '1996' });
  const age = (() => {
    const b = new Date(+d.yyyy, +d.mm - 1, +d.dd); if (isNaN(b)) return null;
    const n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--; return a;
  })();
  const ok = age !== null && age >= 18 && age < 110;
  return (
    <Screen nonav>
      <FlowHeader />
      <Intro title="What's your date of birth?" sub="You must be 18 or over to earn on Sure Jake. This has to match the ID you verify with later." />
      <div className="dateboxes mt20">
        <div className="field" style={{ width: 72 }}><input value={d.dd} maxLength={2} inputMode="numeric" onChange={(e) => setD({ ...d, dd: e.target.value })} /></div>
        <span className="t2">/</span>
        <div className="field" style={{ width: 72 }}><input value={d.mm} maxLength={2} inputMode="numeric" onChange={(e) => setD({ ...d, mm: e.target.value })} /></div>
        <span className="t2">/</span>
        <div className="field grow"><input value={d.yyyy} maxLength={4} inputMode="numeric" onChange={(e) => setD({ ...d, yyyy: e.target.value })} /></div>
      </div>
      <div className="card lift row gap16 mt20" style={{ alignItems: 'center' }}>
        <span className="badge-round"><Icon name={ok ? 'check' : 'warning'} size={20} /></span>
        <div className="col" style={{ gap: 4 }}>
          <span className="l-lg">{ok ? `You're ${age}` : 'You must be 18 or over'}</span>
          <span className="b-sm t2">Age is checked again at ID verification. A mismatch closes the account.</span>
        </div>
      </div>
      <div className="mt20"><Button disabled={!ok} onClick={() => nav('/signin/name')}>Continue</Button></div>
    </Screen>
  );
}

export function LegalName() {
  const nav = useNavigate();
  const [f, setF] = useState('Samuel');
  const [l, setL] = useState('Delgado');
  return (
    <Screen nonav>
      <FlowHeader />
      <Intro title="What's your legal name?" sub="This must match your government ID. Fans never see it. They see the display name you pick next." />
      <div className="mt20"><span className="fieldlabel">LEGAL FIRST NAME</span><div className="field"><input value={f} onChange={(e) => setF(e.target.value)} /></div></div>
      <div className="mt16"><span className="fieldlabel">LEGAL LAST NAME</span><div className="field"><input value={l} onChange={(e) => setL(e.target.value)} /></div></div>
      <div className="mt20"><Footnote>Held for payouts and verification only. Never shown on your profile.</Footnote></div>
      <div className="mt20"><Button disabled={!f || !l} onClick={() => nav('/setup/niche')}>Continue</Button></div>
    </Screen>
  );
}

const CATS = ['Music', 'Dance', 'Wildlife', 'Beauty', 'Sports', 'Dating', 'Food', 'Fitness'];
export function NameAndNiche() {
  const nav = useNavigate();
  const [cat, setCat] = useState('Fitness');
  const [name, setName] = useState('Sam Delgado');
  return (
    <Screen nonav>
      <FlowHeader />
      <Intro title="Name and niche" />
      <div className="mt12"><span className="fieldlabel">DISPLAY NAME</span><div className="field"><input value={name} onChange={(e) => setName(e.target.value)} /></div></div>
      <span className="fieldlabel mt20">CHOOSE YOUR CATEGORY</span>
      <div className="grid2">
        {CATS.map((c) => <CategoryCard key={c} name={c} on={cat === c} onClick={() => setCat(c)} upper />)}
      </div>
      <div className="mt20"><Button onClick={() => nav('/setup/profile')}>Continue</Button></div>
    </Screen>
  );
}
export function CategoryCard({ name, on, onClick, upper }) {
  return (
    <button className={'catcard' + (on ? ' on' : '')} onClick={onClick}>
      <Img src={CATEGORY_IMG[name]} seed={name} />
      <span className="l-md">{upper ? name.toUpperCase() : name}</span>
      <i className="chk"><Icon name="check" size={12} /></i>
    </button>
  );
}

export function ProfileSetup() {
  const nav = useNavigate();
  const [bio, setBio] = useState('Coach and mobility specialist. Training breakdowns, recovery routines and the occasional 6am session.');
  return (
    <Screen nonav>
      <FlowHeader action="SKIP" onAction={() => nav('/setup/payout')} />
      <Intro title="Set up your profile" sub="This is the page a fan lands on from your link. You can change all of it later." />
      <span className="fieldlabel mt20">DISPLAY PICTURE</span>
      <div style={{ position: 'relative', height: 170, borderRadius: 20, overflow: 'hidden', background: 'var(--surface-dark)' }}>
        <Img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=70" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .8 }} />
        <span className="av" style={{ position: 'absolute', left: 16, bottom: 16, width: 64, height: 64, boxShadow: '0 0 0 3px #fff' }}><Img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=70" /></span>
        <span className="pill" style={{ position: 'absolute', right: 12, top: 12, height: 32 }}><Icon name="photo_camera" size={14} />CHANGE COVER</span>
      </div>
      <span className="fieldlabel mt20">USERNAME</span>
      <div className="field ok"><input defaultValue="sam.delgado" /><span className="row gap4 l-xs" style={{ color: 'var(--success)', gap: 4 }}><Icon name="check_circle" size={12} />FREE</span></div>
      <span className="fieldlabel mt20">BIO</span>
      <div className="area"><textarea rows={3} value={bio} maxLength={160} onChange={(e) => setBio(e.target.value)} /></div>
      <div className="counter">{bio.length} / 160</div>
      <span className="fieldlabel mt16">LINKS</span>
      <div className="col gap12">
        <div className="field"><span className="l-xs t2" style={{ width: 70 }}>INSTAGRAM</span><input defaultValue="@sam.delgado" /></div>
        <div className="field"><span className="l-xs t2" style={{ width: 70 }}>TIKTOK</span><input placeholder="Add handle" /></div>
      </div>
      <div className="mt24"><Button onClick={() => nav('/setup/payout')}>Continue</Button></div>
    </Screen>
  );
}

export function PayoutMethod() {
  const nav = useNavigate();
  const [m, setM] = useState('bank');
  const opts = [['bank', 'Bank transfer', 'Your payout window, no fee', 'RECOMMENDED'], ['paypal', 'PayPal', 'Same day, PayPal fee'], ['card', 'Debit card', 'Rapid payout, within the hour, card fee']];
  return (
    <Screen nonav>
      <FlowHeader />
      <Intro title="Where should the money go?" sub="Fans pay in J Coin. You are paid out in cash, minus the 15 to 20% platform fee." />
      <div className="col gap12 mt20">
        {opts.map(([k, t, c, tag]) => (
          <button key={k} className={'selrow' + (m === k ? ' on' : '')} onClick={() => setM(k)}>
            <span className="radio" />
            <span className="col grow" style={{ gap: 2 }}>
              <span className="row gap8"><span className="l-lg-b">{t}</span>{tag && <span className="tag brand">{tag}</span>}</span>
              <span className="b-xs t2">{c}</span>
            </span>
          </button>
        ))}
      </div>
      <SummaryCard className="mt12" rows={[['Platform fee', 'On what fans pay you', '15 to 20%'], ['Minimum payout', null, '$20.00', true]]} />
      <div className="mt16"><Footnote>Bank details are held by our payments partner, not by Sure Jake.</Footnote></div>
      <div className="mt20"><Button onClick={() => nav('/setup/verify')}>Continue</Button></div>
    </Screen>
  );
}
export function SummaryCard({ rows, className = '' }) {
  return (
    <div className={'card dark p20 col ' + className} style={{ gap: 14, borderRadius: 24 }}>
      {rows.map(([t, c, v, yellow], i) => (
        <div key={i} className="col" style={{ gap: 14 }}>
          {i > 0 && <div className="divider" />}
          <div className="row gap12">
            <div className="col grow" style={{ gap: 2 }}>
              <span className="l-md-b">{t}</span>
              {c && <span className="b-xs ti2">{c}</span>}
            </div>
            <span className="amt" style={{ color: yellow ? 'var(--primary)' : '#fff' }}>{v}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function IdVerification() {
  const nav = useNavigate();
  const [selfie, setSelfie] = useState(false);
  const submit = () => { setSession({ role: 'creator', userId: DEMO_USERS.creator }); nav('/studio'); };
  return (
    <Screen nonav>
      <FlowHeader />
      <Intro title="Verify it's you" sub="Required before your first payout, and before fans can subscribe. It usually takes a few minutes." />
      <div className="row mt20" style={{ alignItems: 'stretch' }}>
        <div className="choice on"><span className="tile-ic"><Icon name="id_card" size={22} /></span><span className="col" style={{ gap: 2 }}><span className="l-lg-b">Photo ID</span><span className="b-xs t2">Passport, added</span></span></div>
        <button className={'choice' + (selfie ? ' on' : '')} onClick={() => setSelfie(true)}><span className="tile-ic"><Icon name={selfie ? 'check' : 'photo_camera'} size={22} /></span><span className="col" style={{ gap: 2 }}><span className="l-lg-b">Selfie check</span><span className="b-xs t2">{selfie ? 'Done, matched' : 'Takes 20 seconds'}</span></span></button>
      </div>
      <div className="col gap12 mt20">
        <Step title="18+ confirmed" desc="Checked against the date of birth you entered." />
        <Step title="Name matched" desc="Against the legal name on your payout account." />
        <Step title="Handled by our verification partner" desc="Sure Jake never stores your documents." />
      </div>
      <div className="mt20"><Button onClick={submit}>Submit for review</Button></div>
      <div className="mt16"><Footnote>You can browse and post while this is reviewed. Payouts and subscriptions unlock once it clears.</Footnote></div>
    </Screen>
  );
}

export function useRoleGuard() { return useSession(); }
