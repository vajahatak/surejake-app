// Demo content. The same data seeds the in-browser store and the Supabase database
// (scripts/gen-seed-sql.mjs turns this file into SQL).

const U = (id, w = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const IMG = {
  fitness: [U('photo-1517836357463-d25dfeac3438'), U('photo-1571019613454-1cb2f99b2d8b'), U('photo-1534438327276-14e5300c3a48'), U('photo-1518611012118-696072aa579a'), U('photo-1544367567-0f2fcb009e0b'), U('photo-1541534741688-6078c6bfb5c5'), U('photo-1599901860904-17e6ed7083a0'), U('photo-1540497077202-7c8a3999166f')],
  beauty: [U('photo-1487412947147-5cebf100ffc2'), U('photo-1522335789203-aabd1fc54bc9'), U('photo-1512496015851-a90fb38ba796'), U('photo-1596462502278-27bfdc403348')],
  food: [U('photo-1504674900247-0877df9cc836'), U('photo-1565299624946-b28f40a0ae38'), U('photo-1540189549336-e6e99c3679fe')],
  music: U('photo-1511379938547-c1f69419868d'), dance: U('photo-1508700929628-666bc8bd84ea'), wildlife: U('photo-1474511320723-9a56873867b5'),
  sports: U('photo-1461896836934-ffe607ba8211'), dating: U('photo-1516589178581-6cd7833ae3b2'),
};

export const CATEGORY_IMG = {
  Music: IMG.music, Dance: IMG.dance, Wildlife: IMG.wildlife, Beauty: IMG.beauty[0], Sports: IMG.sports,
  Dating: IMG.dating, Food: IMG.food[0], Fitness: IMG.fitness[0],
};

const P = (id) => U(id, 300);

export const PROFILES = [
  { id: 'sam', kind: 'creator', handle: 'sam.delgado', name: 'Sam Delgado', category: 'Fitness', tier: 'Platinum', bio: 'Coach and mobility specialist. Training breakdowns, recovery routines and the occasional 6am session.', avatar: P('photo-1500648767791-00dcc994a43e'), cover: U('photo-1517836357463-d25dfeac3438', 1000), fans: 750, posts_count: 1204, balance: 0, sort: 1 },
  { id: 'rae', kind: 'creator', handle: 'rae.k', name: 'Rae Kensington', category: 'Beauty', tier: 'Diamond', bio: 'Editorial makeup and backstage stories. Subscribers see the full looks.', avatar: P('photo-1494790108377-be9c29b29330'), cover: U('photo-1487412947147-5cebf100ffc2', 1000), fans: 12400, posts_count: 860, balance: 0, sort: 2 },
  { id: 'stephanie', kind: 'creator', handle: 'stephanie.d', name: 'Stephanie Diaz', category: 'Beauty', tier: 'Gold', bio: 'Full glam, no filter. Tutorials every Tuesday.', avatar: P('photo-1438761681033-6461ffad8d80'), cover: U('photo-1522335789203-aabd1fc54bc9', 1000), fans: 3100, posts_count: 412, balance: 0, sort: 3 },
  { id: 'junia', kind: 'creator', handle: 'junia.blake', name: 'Junia Blake', category: 'Beauty', tier: 'Gold', bio: 'Makeup, unfiltered. Real skin, real light.', avatar: P('photo-1534528741775-53994a69daeb'), cover: U('photo-1512496015851-a90fb38ba796', 1000), fans: 2200, posts_count: 300, balance: 0, sort: 4 },
  { id: 'mia', kind: 'creator', handle: 'mia.o', name: 'Mia Okonjo', category: 'Fitness', tier: 'Diamond', bio: 'Strength coach. Programs, form checks and long runs.', avatar: P('photo-1544005313-94ddf0286df2'), cover: U('photo-1571019613454-1cb2f99b2d8b', 1000), fans: 88100, posts_count: 2100, balance: 0, sort: 5 },
  { id: 'priya', kind: 'creator', handle: 'priya.a', name: 'Priya Anand', category: 'Fitness', tier: 'Diamond', bio: 'Yoga and breath. Slow flows for busy people.', avatar: P('photo-1531123897727-8f129e1688ce'), cover: U('photo-1544367567-0f2fcb009e0b', 1000), fans: 64700, posts_count: 1500, balance: 0, sort: 6 },
  { id: 'elin', kind: 'creator', handle: 'elin.k', name: 'Elin Kroft', category: 'Fitness', tier: 'Platinum', bio: 'Home workouts, no props needed.', avatar: P('photo-1517841905240-472988babdf9'), cover: U('photo-1518611012118-696072aa579a', 1000), fans: 31400, posts_count: 900, balance: 0, sort: 7 },
  { id: 'kit', kind: 'creator', handle: 'kit.a', name: 'Kit Alvarez', category: 'Fitness', tier: 'Platinum', bio: 'Calisthenics and park sessions.', avatar: P('photo-1507003211169-0a1dd7228f2d'), cover: U('photo-1541534741688-6078c6bfb5c5', 1000), fans: 27800, posts_count: 640, balance: 0, sort: 8 },
  { id: 'michelle', kind: 'creator', handle: 'michelle.c', name: 'Michelle Cho', category: 'Fitness', tier: 'Platinum', bio: 'Pilates, posture and recovery days.', avatar: P('photo-1529626455594-4ff0802cfb7e'), cover: U('photo-1534438327276-14e5300c3a48', 1000), fans: 22900, posts_count: 510, balance: 0, sort: 9 },
  { id: 'maya', kind: 'creator', handle: 'maya.chen', name: 'Maya Chen', category: 'Beauty', tier: 'Gold', bio: 'Skincare first, makeup second.', avatar: P('photo-1524504388940-b1c1722653e1'), cover: U('photo-1596462502278-27bfdc403348', 1000), fans: 5400, posts_count: 220, balance: 0, sort: 10 },
  { id: 'nico', kind: 'creator', handle: 'nico.eats', name: 'Nico Ferreira', category: 'Food', tier: 'Gold', bio: 'Weeknight cooking in twenty minutes.', avatar: P('photo-1506794778202-cad84cf45f1d'), cover: U('photo-1504674900247-0877df9cc836', 1000), fans: 9100, posts_count: 380, balance: 0, sort: 11 },
  { id: 'jill', kind: 'fan', handle: 'jill.park', name: 'Jill Park', category: null, tier: 'Gold', bio: null, avatar: P('photo-1488426862026-3ee34a7d66df'), cover: U('photo-1506126613408-eca07ce68773', 1000), fans: 0, posts_count: 0, balance: 1820, sort: 50 },
  { id: 'aybl', kind: 'brand', handle: 'aybl', name: 'AYBL', category: 'Fitness', tier: 'Brand', bio: 'Designed with your comfort in mind, our unique selection of gymwear seamlessly combines fit with function for a confident workout.', avatar: null, cover: U('photo-1571019614242-c5c5dee9f50b', 1000), fans: 96400, posts_count: 41, balance: 0, sort: 60 },
  { id: 'nike', kind: 'brand', handle: 'nike', name: 'Nike', category: 'Fitness', tier: 'Brand', bio: 'Just Do It.', avatar: null, cover: U('photo-1552674605-db6ffd4facb5', 1000), fans: 1200000, posts_count: 68, balance: 0, sort: 61 },
];

const H = 3600 * 1000;
// hoursAgo: how old the post is when the demo is (re)seeded.
export const POSTS = [
  { creator_id: 'sam', kind: 'photo', title: 'Morning Flow', caption: 'Morning flow. Twenty minutes to wake the hips and spine.', media: IMG.fitness[3], access: 'everyone', price: 0, views: 4700, likes: 391, comments: 48, hoursAgo: 72 },
  { creator_id: 'sam', kind: 'photo', title: 'Mobility Reset', caption: 'Mobility and breathwork, twice a week. New series starts today.', media: IMG.fitness[6], access: 'everyone', price: 0, views: 5200, likes: 1214, comments: 86, hoursAgo: 5 },
  { creator_id: 'sam', kind: 'photo', title: 'Core Series', caption: 'Core series, week two. Slower than you think.', media: IMG.fitness[1], access: 'everyone', price: 0, views: 3100, likes: 260, comments: 22, hoursAgo: 144 },
  { creator_id: 'sam', kind: 'photo', title: 'Breathwork', caption: 'Box breathing before every session.', media: IMG.fitness[4], access: 'fans', price: 0, views: 2200, likes: 180, comments: 14, hoursAgo: 192 },
  { creator_id: 'sam', kind: 'photo', title: 'Recovery Day', caption: 'Recovery day is training day.', media: IMG.fitness[7], access: 'paid', price: 600, views: 1800, likes: 140, comments: 9, hoursAgo: 240 },
  { creator_id: 'stephanie', kind: 'photo', title: 'Full glam', caption: 'Full glam, start to finish. No filter.', media: IMG.beauty[1], access: 'everyone', price: 0, views: 6400, likes: 1214, comments: 86, hoursAgo: 2 },
  { creator_id: 'rae', kind: 'photo', title: 'Backstage', caption: 'Backstage from last night. Subscribers only.', media: IMG.beauty[0], access: 'paid', price: 600, views: 9800, likes: 1214, comments: 86, hoursAgo: 5 },
  { creator_id: 'junia', kind: 'photo', title: 'Unfiltered', caption: 'Makeup, unfiltered. No ring light, no filter.', media: IMG.beauty[2], access: 'everyone', price: 0, views: 3300, likes: 1214, comments: 86, hoursAgo: 5.5 },
  { creator_id: 'mia', kind: 'photo', title: 'Long run', caption: 'Sunday long run, 18k easy. Fuel early, finish strong.', media: IMG.fitness[0], access: 'everyone', price: 0, views: 22000, likes: 3100, comments: 210, hoursAgo: 9 },
  { creator_id: 'elin', kind: 'photo', title: 'Home workout', caption: 'Home workout, no props. Save this one.', media: IMG.fitness[2], access: 'everyone', price: 0, views: 8100, likes: 940, comments: 61, hoursAgo: 12 },
  { creator_id: 'nico', kind: 'photo', title: 'Weeknight pasta', caption: 'Weeknight pasta, fifteen minutes, one pan.', media: IMG.food[1], access: 'everyone', price: 0, views: 4100, likes: 520, comments: 40, hoursAgo: 7 },
  { creator_id: 'priya', kind: 'photo', title: 'Slow flow', caption: 'Slow flow for a heavy week.', media: IMG.fitness[4], access: 'subscribers', price: 0, views: 12000, likes: 1800, comments: 120, hoursAgo: 20 },
  { creator_id: 'maya', kind: 'photo', title: 'Skin prep', caption: 'Skin prep is ninety percent of the look.', media: IMG.beauty[3], access: 'everyone', price: 0, views: 2600, likes: 300, comments: 19, hoursAgo: 24 },
];

export const FOLLOWS = [
  ['jill', 'rae', 90], ['jill', 'stephanie', 40], ['jill', 'michelle', 60], ['jill', 'elin', 30], ['jill', 'mia', 200],
  ['jill', 'priya', 120], ['jill', 'kit', 20], ['jill', 'junia', 10], ['jill', 'nico', 5],
];

export const TRANSACTIONS = [
  ['jill', 'Tip to @rae.k', 'Beauty editorial', -500, 5, 96],
  ['jill', 'Unlocked a post', '@mia.o · 1 video', -800, 8, 95],
  ['jill', 'Topped up', '2,500 + 500 free', 3000, 25, 94],
  ['jill', 'Tip to @elin.k', 'Home workout, no props', -500, 5, 25],
  ['jill', 'Gift to @michelle.c', 'Wishlist · Resistance bands', -1000, 10, 24],
];

export function buildSeed(now = Date.now()) {
  let pid = 1, tid = 1;
  return {
    profiles: Object.fromEntries(PROFILES.map((p) => [p.id, { ...p }])),
    posts: POSTS.map(({ hoursAgo, ...p }) => ({ id: pid++, boosted: false, promoted: false, ...p, created_at: new Date(now - hoursAgo * H).toISOString() })),
    follows: FOLLOWS.map(([fan_id, creator_id, days]) => ({ fan_id, creator_id, created_at: new Date(now - days * 24 * H).toISOString() })),
    subscriptions: [],
    unlocks: [],
    tips: [],
    transactions: TRANSACTIONS.map(([user_id, title, subtitle, amount, usd, hoursAgo]) => ({ id: tid++, user_id, title, subtitle, amount, usd, created_at: new Date(now - hoursAgo * H).toISOString() })),
    tool_runs: [],
  };
}
