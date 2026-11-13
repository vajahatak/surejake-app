import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ToastHost, Icon, Sheet, Button } from './components/ui.jsx';
import { MoneyProvider } from './components/MoneySheets.jsx';
import { useSession, setSession, DEMO_USERS, actions, getMode, useStore, initStore } from './data/store.js';
import * as O from './screens/Onboarding.jsx';
import * as F from './screens/Fan.jsx';
import * as P from './screens/Profile.jsx';
import * as W from './screens/Wallet.jsx';
import * as C from './screens/Post.jsx';
import { Radar } from './screens/Radar.jsx';
import * as T from './screens/Tools.jsx';

function RequireRole({ children, role }) {
  const s = useSession();
  if (!s.role) return <Navigate to="/" replace />;
  if (role && s.role !== role) return <Navigate to={s.role === 'creator' ? '/studio' : '/home'} replace />;
  return children;
}
const fan = (el) => <RequireRole role="fan">{el}</RequireRole>;
const creator = (el) => <RequireRole role="creator">{el}</RequireRole>;
const anyone = (el) => <RequireRole>{el}</RequireRole>;

function AppRoutes() {
  const loc = useLocation();
  useEffect(() => { document.querySelector('.screen')?.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <Routes>
      <Route path="/" element={<O.RoleChoice />} />
      <Route path="/fan/start" element={<O.FanStart />} />
      <Route path="/creator/start" element={<O.CreatorStart />} />
      <Route path="/signin" element={<O.Welcome />} />
      <Route path="/signin/phone" element={<O.PhoneNumber />} />
      <Route path="/signin/code" element={<O.ConfirmCode />} />
      <Route path="/signin/dob" element={<O.DateOfBirth />} />
      <Route path="/signin/name" element={<O.LegalName />} />
      <Route path="/setup/niche" element={<O.NameAndNiche />} />
      <Route path="/setup/profile" element={<O.ProfileSetup />} />
      <Route path="/setup/payout" element={<O.PayoutMethod />} />
      <Route path="/setup/verify" element={<O.IdVerification />} />

      <Route path="/home" element={anyone(<F.Feed />)} />
      <Route path="/home/:tab" element={anyone(<F.Feed />)} />
      <Route path="/explore" element={anyone(<F.Explore />)} />
      <Route path="/explore/niches" element={anyone(<F.PickNiches />)} />
      <Route path="/explore/narrow" element={anyone(<F.NarrowDown />)} />
      <Route path="/explore/browse" element={anyone(<F.BrowseReturning />)} />
      <Route path="/explore/niche/:cat" element={anyone(<F.InsideNiche />)} />
      <Route path="/explore/:cat" element={anyone(<F.Explore />)} />
      <Route path="/c/:handle" element={anyone(<P.CreatorProfile />)} />
      <Route path="/brand/:id" element={anyone(<P.BrandProfile />)} />
      <Route path="/brand/:id/exclusivity" element={anyone(<P.CategoryExclusivity />)} />
      <Route path="/messages" element={anyone(<F.Messages />)} />
      <Route path="/messages/:handle" element={anyone(<F.Thread />)} />

      <Route path="/me" element={fan(<F.FanProfile />)} />
      <Route path="/me/following" element={fan(<F.FanFollowing />)} />
      <Route path="/me/badges" element={fan(<F.FanBadges />)} />
      <Route path="/wallet" element={fan(<W.Shop />)} />
      <Route path="/wallet/history" element={fan(<W.History />)} />

      <Route path="/studio" element={creator(<P.MyProfile />)} />
      <Route path="/post/new" element={creator(<C.ChooseType />)} />
      <Route path="/post/photo" element={creator(<C.PhotoEditor />)} />
      <Route path="/post/text" element={creator(<C.TextEditor />)} />
      <Route path="/post/voice" element={creator(<C.VoiceEditor />)} />
      <Route path="/post/access" element={creator(<C.AccessPrice />)} />
      <Route path="/post/tools" element={creator(<C.GrowthToolsStep />)} />
      <Route path="/post/published" element={creator(<C.Published />)} />
      <Route path="/radar" element={creator(<Radar />)} />
      <Route path="/radar/:tab" element={creator(<Radar />)} />
      <Route path="/tools" element={creator(<T.GrowthTools />)} />
      <Route path="/tools/boost" element={creator(<T.BoostSetup />)} />
      <Route path="/tools/boost/done" element={creator(<T.BoostDone />)} />
      <Route path="/tools/boost/results/:id" element={creator(<T.BoostResults />)} />
      <Route path="/tools/promotion" element={creator(<T.PromotionSetup />)} />
      <Route path="/tools/promotion/running" element={creator(<T.PromotionRunning />)} />
      <Route path="/tools/top-picks" element={creator(<T.TopPicksSetup />)} />
      <Route path="/tools/signal" element={creator(<T.SignalLive />)} />
      <Route path="/tools/performance/:id" element={creator(<T.PostPerformance />)} />
      <Route path="/tools/:tab" element={creator(<T.GrowthTools />)} />
      <Route path="/sponsorship" element={creator(<T.Sponsorship />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function useSwitch() {
  const nav = useNavigate();
  return (role) => {
    setSession({ role, userId: DEMO_USERS[role] });
    nav(role === 'creator' ? '/studio' : '/home');
  };
}

function DemoControls({ onDone }) {
  const s = useSession();
  const sw = useSwitch();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const store = useStore();
  const reset = async () => {
    if (!confirm('Reset all demo data (tips, follows, posts) back to the start?')) return;
    setBusy(true);
    await actions.reset();
    sessionStorage.clear();
    setSession({ role: null, niches: undefined, interests: undefined });
    setBusy(false);
    nav('/');
    onDone?.();
  };
  return (
    <>
      <h3>DEMO CONTROLS</h3>
      <div className="who">
        <button className={s.role === 'fan' ? 'on' : ''} onClick={() => { sw('fan'); onDone?.(); }}>FAN · JILL</button>
        <button className={s.role === 'creator' ? 'on' : ''} onClick={() => { sw('creator'); onDone?.(); }}>CREATOR · SAM</button>
      </div>
      <div className="who">
        <button className="db" onClick={() => { nav('/'); onDone?.(); }}>START OVER</button>
        <button className="db" onClick={reset} disabled={busy}>{busy ? 'RESETTING…' : 'RESET DATA'}</button>
      </div>
      <span className="muted">Data: {getMode() === 'remote' ? 'live database, shared across devices' : 'saved in this browser'} · Jill has {store.profiles.jill?.balance?.toLocaleString()} J</span>
    </>
  );
}

function DemoPanel() {
  return (
    <aside className="demo-panel">
      <DemoControls />
      <h3 className="mt16">SUGGESTED SCRIPT</h3>
      <ol>
        <li>Start at Role Choice, run creator setup (01 → 02 → 03) and land on Sam's profile.</li>
        <li>Post a locked photo (05) with Boost on, or boost from Growth Tools (07.7 → 13.3 → 13.4).</li>
        <li>Switch to Jill. The post is at the top of her For You feed with a Boosted tag (09).</li>
        <li>Open Sam's profile, Be a fan, then Subscribe (10 → 13.1 → 13.2).</li>
        <li>Tip 1,000 J. Jill is short, so she tops up and sends in one step (11.3 → 11.5 → 11.6).</li>
        <li>Switch back to Sam. Radar Revenue and Fans show the new money and fan (06).</li>
        <li>Finish on Brand Sponsorship and the AYBL brand pages (12).</li>
      </ol>
      <span className="muted">On a phone the app fills the screen. Tap DEMO at the top to switch between Jill and Sam.</span>
    </aside>
  );
}

function MobileDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="demo-fab" onClick={() => setOpen(true)}><Icon name="swap_horiz" size={14} />DEMO</button>
      {open && (
        <Sheet onClose={() => setOpen(false)}>
          <div className="demo-panel" style={{ display: 'flex', width: 'auto', color: 'var(--text)' }}>
            <style>{`.sheet .demo-panel h3{color:var(--text)} .sheet .demo-panel .who button,.sheet .demo-panel .db{color:var(--text);box-shadow:inset 0 0 0 1px var(--border)} .sheet .demo-panel .who button.on{box-shadow:none}`}</style>
            <DemoControls onDone={() => setOpen(false)} />
            <Button kind="outlined" onClick={() => setOpen(false)}>Close</Button>
          </div>
        </Sheet>
      )}
    </>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => { initStore().finally(() => setReady(true)); }, []);
  return (
    <HashRouter>
      <div className="stage">
        <div className="phone">
          <ToastHost>
            <MoneyProvider>
              {ready ? <AppRoutes /> : <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="l-md t2">LOADING…</span></div>}
              <MobileDemo />
            </MoneyProvider>
          </ToastHost>
        </div>
        <DemoPanel />
      </div>
    </HashRouter>
  );
}
