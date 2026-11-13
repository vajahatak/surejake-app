import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Img, Avatar, fmt, ago, jToUsd, useMe, useToast } from './ui.jsx';
import { useStore, actions, isFollowing, canSee } from '../data/store.js';

const CAT_DOT = { Fitness: 'var(--yellow-400)', Beauty: 'var(--purple-500)', Food: 'var(--orange-500)' };

export function PostCard({ post, onTip, onLocked }) {
  const nav = useNavigate();
  const me = useMe();
  const toast = useToast();
  const s = useStore();
  const c = s.profiles[post.creator_id];
  const following = isFollowing(s, me, post.creator_id);
  const visible = canSee(s, me, post);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!c) return null;
  const isMine = me === post.creator_id;

  const unlock = async () => {
    if (post.access === 'subscribers' || post.access === 'fans') { nav(`/c/${c.handle}`); return; }
    setBusy(true);
    try { await actions.unlock(me, post.id); toast(`Unlocked for ${fmt(post.price)} J`); }
    catch (e) { if (/INSUFFICIENT/.test(e.message)) onLocked?.(post); else toast('Something went wrong, try again'); }
    setBusy(false);
  };
  const lockLabel = post.access === 'paid' ? `Unlock for ${jToUsd(post.price).replace('.00', '')}` : post.access === 'subscribers' ? 'Subscribers only' : 'Follow to see';

  return (
    <article className={'post' + (post.promoted ? ' promoted' : '')}>
      <div className="row" style={{ gap: 10 }}>
        <button onClick={() => nav(`/c/${c.handle}`)}><Avatar p={c} size={44} /></button>
        <button className="col grow" style={{ gap: 2, textAlign: 'left' }} onClick={() => nav(`/c/${c.handle}`)}>
          <span className="l-lg-b" style={{ letterSpacing: 1 }}>@{c.handle}</span>
          <span className="row b-xs t2" style={{ gap: 6 }}><i className="catdot" style={{ background: CAT_DOT[c.category] }} />{c.category}<span>· {post.promoted ? 'Promoted' : ago(post.created_at)}</span></span>
        </button>
        {!isMine && !following && <button className="btn secondary xs" onClick={() => actions.follow(me, c.id)}>FOLLOW</button>}
      </div>
      <p className="b-md" style={{ margin: 0 }}>{post.caption}</p>
      {(post.boosted || post.promoted) && <span className="tag brand" style={{ alignSelf: 'flex-start' }}><Icon name="bolt" size={11} />{post.promoted ? 'PROMOTED' : 'BOOSTED'}</span>}
      {post.media && (
        <div className="media">
          <Img src={post.media} seed={'p' + post.id} />
          {!visible && <div className="lock"><button className="pill" onClick={unlock} disabled={busy}><Icon name="lock" size={14} />{busy ? 'UNLOCKING…' : lockLabel}</button></div>}
        </div>
      )}
      <div className="acts">
        <span className={liked ? 'liked' : ''}><button onClick={() => setLiked(!liked)} aria-label="Like"><Icon name="favorite" size={20} /></button>{fmt(post.likes + (liked ? 1 : 0))}</span>
        <span><Icon name="chat_bubble" size={20} />{fmt(post.comments)}</span>
        <button onClick={() => { navigator.clipboard?.writeText(location.href); toast('Link copied'); }} aria-label="Share"><Icon name="share" size={20} /></button>
        <button onClick={() => setSaved(!saved)} aria-label="Save"><Icon name="bookmark" size={20} style={saved ? { color: 'var(--yellow-600)' } : undefined} /></button>
        <span className="spacer" />
        {!isMine && <button className="btn primary xs" onClick={() => onTip?.(c)}>TIP</button>}
      </div>
      {post.promoted && (
        <div className="why">
          <span className="b-xs t2">You browse {c.category}, and you don't follow this creator yet.</span>
          <span className="l-xs">WHY THIS?</span>
        </div>
      )}
    </article>
  );
}

export function PostTile({ post, large, onClick }) {
  return (
    <button className={'ptile' + (large ? ' lg' : '')} onClick={onClick}>
      <Img src={post.media} seed={'p' + post.id} />
      <span className="menu"><Icon name="more_horiz" size={14} /></span>
      {post.access !== 'everyone' && <span className="lockbadge tag dark"><Icon name="lock" size={11} />{post.access === 'paid' ? fmt(post.price) + ' J' : post.access === 'fans' ? 'FANS' : 'SUBS'}</span>}
      <span className="info">
        <span className="l-md">{post.title}</span>
        <span className="statchip"><Icon name="visibility" size={12} />{post.views >= 1000 ? (post.views / 1000).toFixed(1) + 'K' : post.views}</span>
      </span>
    </button>
  );
}
