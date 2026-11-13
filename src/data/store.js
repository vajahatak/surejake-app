// App data. Uses the Supabase database when it is set up (so a fan on one phone and a
// creator on another see each other's actions). Falls back to an in-browser copy of
// the same data if the database cannot be reached, so the demo never breaks.
import { useSyncExternalStore } from 'react';
import { createClient } from '@supabase/supabase-js';
import { buildSeed } from './seed.js';

const SUPABASE_URL = 'https://ncyznzdqxkpwbmuvngbt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Vxaj0nxUkfBeFi4stBMUrQ_cQl8TXja';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

const LOCAL_KEY = 'sj-demo-data-v1';
const TABLES = ['profiles', 'posts', 'follows', 'subscriptions', 'unlocks', 'tips', 'transactions', 'tool_runs'];

let state = loadLocal() || buildSeed();
let mode = 'local';
let ready = false;
const listeners = new Set();

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)); } catch { return null; }
}
function saveLocal() {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(state)); } catch { /* private mode */ }
}
function emit() { state = { ...state }; listeners.forEach((l) => l()); }
export function subscribeStore(l) { listeners.add(l); return () => listeners.delete(l); }
export function getState() { return state; }
export function getMode() { return mode; }
export function useStore(selector = (s) => s) {
  return selector(useSyncExternalStore(subscribeStore, getState));
}

async function fetchRemote() {
  const results = await Promise.all(TABLES.map((t) => supabase.from(t).select('*')));
  const bad = results.find((r) => r.error);
  if (bad) throw bad.error;
  const [profiles, posts, follows, subscriptions, unlocks, tips, transactions, tool_runs] = results.map((r) => r.data);
  if (!profiles.length) throw new Error('empty');
  return {
    profiles: Object.fromEntries(profiles.map((p) => [p.id, p])),
    posts, follows, subscriptions, unlocks, tips, transactions, tool_runs,
  };
}

export async function initStore() {
  try {
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000));
    const remote = await Promise.race([fetchRemote(), timeout]);
    // Check the write functions exist before trusting the database for actions.
    const probe = await Promise.race([supabase.rpc('follow_toggle', { p_fan: '__probe__', p_creator: '__probe__' }), timeout]);
    if (probe.error && /function|schema cache/i.test(probe.error.message)) throw probe.error;
    state = remote; mode = 'remote';
    setInterval(refresh, 4000);
  } catch (e) {
    mode = 'local';
    console.info('[SureJake] Using in-browser demo data:', e?.message || e);
  }
  ready = true;
  emit();
}
export function isReady() { return ready; }

let refreshing = false;
export async function refresh() {
  if (mode !== 'remote' || refreshing) return;
  refreshing = true;
  try { state = await fetchRemote(); emit(); } catch { /* keep last good copy */ }
  refreshing = false;
}

async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(error.message);
  await refresh();
  return data;
}

// ---------- local versions of the database functions ----------
const now = () => new Date().toISOString();
const nextId = (arr) => arr.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1;
function localSpend(user, amount, title, subtitle) {
  const p = state.profiles[user];
  if (!p || p.balance < amount) throw new Error('INSUFFICIENT_BALANCE');
  p.balance -= amount;
  state.transactions = [...state.transactions, { id: nextId(state.transactions), user_id: user, title, subtitle, amount: -amount, usd: amount / 100, created_at: now() }];
  return p.balance;
}
function commit() { saveLocal(); emit(); }

export const actions = {
  async follow(fan, creator) {
    if (mode === 'remote') return rpc('follow_toggle', { p_fan: fan, p_creator: creator });
    const has = state.follows.some((f) => f.fan_id === fan && f.creator_id === creator);
    if (has) {
      state.follows = state.follows.filter((f) => !(f.fan_id === fan && f.creator_id === creator));
      state.subscriptions = state.subscriptions.filter((f) => !(f.fan_id === fan && f.creator_id === creator));
      state.profiles[creator].fans = Math.max(0, state.profiles[creator].fans - 1);
    } else {
      state.follows = [...state.follows, { fan_id: fan, creator_id: creator, created_at: now() }];
      state.profiles[creator].fans += 1;
    }
    commit();
    return !has;
  },
  async topUp(user, coins, bonus, usd) {
    if (mode === 'remote') return rpc('top_up', { p_user: user, p_coins: coins, p_bonus: bonus, p_usd: usd });
    state.profiles[user].balance += coins + bonus;
    state.transactions = [...state.transactions, { id: nextId(state.transactions), user_id: user, title: 'Topped up', subtitle: `${coins.toLocaleString()}${bonus ? ` + ${bonus.toLocaleString()} free` : ''}`, amount: coins + bonus, usd, created_at: now() }];
    commit();
    return state.profiles[user].balance;
  },
  async tip(fan, creator, amount, note) {
    if (mode === 'remote') return rpc('send_tip', { p_fan: fan, p_creator: creator, p_amount: amount, p_note: note || '' });
    const b = localSpend(fan, amount, `Tip to @${state.profiles[creator].handle}`, note || 'Tip');
    state.tips = [...state.tips, { id: nextId(state.tips), fan_id: fan, creator_id: creator, amount, note, created_at: now() }];
    commit();
    return b;
  },
  async subscribe(fan, creator, plan, price) {
    if (mode === 'remote') return rpc('subscribe', { p_fan: fan, p_creator: creator, p_plan: plan, p_price: price });
    const b = localSpend(fan, price, `Subscribed to @${state.profiles[creator].handle}`, plan);
    if (!state.follows.some((f) => f.fan_id === fan && f.creator_id === creator)) {
      state.follows = [...state.follows, { fan_id: fan, creator_id: creator, created_at: now() }];
      state.profiles[creator].fans += 1;
    }
    state.subscriptions = [...state.subscriptions.filter((s) => !(s.fan_id === fan && s.creator_id === creator)), { fan_id: fan, creator_id: creator, plan, price, created_at: now() }];
    commit();
    return b;
  },
  async unlock(fan, postId) {
    if (mode === 'remote') return rpc('unlock_post', { p_fan: fan, p_post: postId });
    const post = state.posts.find((p) => p.id === postId);
    const b = localSpend(fan, post.price, 'Unlocked a post', `@${state.profiles[post.creator_id].handle} · 1 photo`);
    state.unlocks = [...state.unlocks, { fan_id: fan, post_id: postId, created_at: now() }];
    commit();
    return b;
  },
  async publish(creator, { kind, title, caption, media, access, price, tools }) {
    if (mode === 'remote') return rpc('publish_post', { p_creator: creator, p_kind: kind, p_title: title, p_caption: caption, p_media: media, p_access: access, p_price: price || 0, p_tools: tools });
    const id = nextId(state.posts);
    state.posts = [...state.posts, { id, creator_id: creator, kind, title, caption, media, access, price: price || 0, views: 0, likes: 0, comments: 0, boosted: tools.includes('boost'), promoted: tools.includes('promotion'), created_at: now() }];
    state.profiles[creator].posts_count += 1;
    for (const t of tools) state.tool_runs = [...state.tool_runs, { id: nextId(state.tool_runs), creator_id: creator, post_id: id, tool: t, hours: TOOL_PRICES[t].hours, price: TOOL_PRICES[t].price, created_at: now() }];
    commit();
    return id;
  },
  async buyTool(creator, postId, tool, hours, price) {
    if (mode === 'remote') return rpc('buy_tool', { p_creator: creator, p_post: postId, p_tool: tool, p_hours: hours, p_price: price });
    state.tool_runs = [...state.tool_runs, { id: nextId(state.tool_runs), creator_id: creator, post_id: postId, tool, hours, price, created_at: now() }];
    if (postId) state.posts = state.posts.map((p) => (p.id === postId ? { ...p, boosted: p.boosted || tool === 'boost', promoted: p.promoted || tool === 'promotion' } : p));
    commit();
  },
  async reset() {
    if (mode === 'remote') return rpc('reset_demo', {});
    state = buildSeed();
    commit();
  },
};

export const TOOL_PRICES = {
  boost: { label: 'Boost', hours: 48, price: 19.99 },
  promotion: { label: 'Promotion', hours: 72, price: 49.99 },
  top_picks: { label: 'Top Picks', hours: 1, price: 89.99 },
  pulse: { label: 'Pulse', hours: 0, price: 19.99 },
  signal: { label: 'Signal', hours: 8, price: 9.99 },
};

// ---------- session (who is using the app on this device) ----------
const SESSION_KEY = 'sj-session-v1';
let session = (() => { try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || {}; } catch { return {}; } })();
const sessionListeners = new Set();
export function getSession() { return session; }
export function setSession(patch) {
  session = { ...session, ...patch };
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* ignore */ }
  sessionListeners.forEach((l) => l());
}
export function useSession() {
  return useSyncExternalStore((l) => { sessionListeners.add(l); return () => sessionListeners.delete(l); }, getSession);
}
export const DEMO_USERS = { fan: 'jill', creator: 'sam' };

// ---------- derived helpers ----------
export function isFollowing(s, fan, creator) { return s.follows.some((f) => f.fan_id === fan && f.creator_id === creator); }
export function subscriptionOf(s, fan, creator) { return s.subscriptions.find((f) => f.fan_id === fan && f.creator_id === creator); }
export function canSee(s, fan, post) {
  if (!post) return false;
  if (post.access === 'everyone') return true;
  if (fan === post.creator_id) return true;
  if (post.access === 'fans') return isFollowing(s, fan, post.creator_id);
  if (post.access === 'subscribers') return !!subscriptionOf(s, fan, post.creator_id);
  if (post.access === 'paid') return !!subscriptionOf(s, fan, post.creator_id) || s.unlocks.some((u) => u.fan_id === fan && u.post_id === post.id);
  return true;
}
export function creatorLive(s, creator) {
  // Live numbers for the creator's Radar: seeded baseline plus real activity in the app.
  const tips = s.tips.filter((t) => t.creator_id === creator);
  const subs = s.subscriptions.filter((t) => t.creator_id === creator);
  const unlockJ = s.unlocks.reduce((sum, u) => { const p = s.posts.find((x) => x.id === u.post_id); return p && p.creator_id === creator ? sum + p.price : sum; }, 0);
  const tipJ = tips.reduce((a, t) => a + t.amount, 0);
  const subJ = subs.reduce((a, t) => a + t.price, 0);
  const newFans = s.follows.filter((f) => f.creator_id === creator && Date.now() - new Date(f.created_at).getTime() < 7 * 24 * 3600 * 1000).length;
  const runs = s.tool_runs.filter((r) => r.creator_id === creator);
  return { tips, subs, tipJ, subJ, unlockJ, earnedUsd: (tipJ + subJ + unlockJ) / 100 * 0.82, newFans, runs };
}
