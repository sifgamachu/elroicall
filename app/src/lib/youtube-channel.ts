export const YOUTUBE_CHANNEL_ID = 'UC7WApBz8RPb6H9aERdsOBMQ';
export const YOUTUBE_CHANNEL_URL = `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}`;

export type ChannelMessage = {
  id: string;
  slug: string;
  title: string;
  youtubeTitle: string;
  category: string;
  duration: string;
  passage: string;
  verse: string;
  summary: string;
  reflection: string;
  question: string;
  readingDays: number[];
};

// Curated from this channel's video descriptions and English captions on
// 2026-09-22. These are selected messages, not an automatically updated feed.
export const CHANNEL_MESSAGES: ChannelMessage[] = [
  {
    id: '7bT1Tzisz-A', slug: 'rooted-in-god', title: 'Rooted in God.',
    youtubeTitle: 'Rooted in God | Never Wither" - "Planted by the Water 💧 Psalm 1:3',
    category: 'Spiritual growth', duration: '14:22', passage: 'Psalm 1:3',
    verse: 'And he shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season; his leaf also shall not wither; and whatsoever he doeth shall prosper.',
    summary: 'A devotion on staying nourished by Scripture, trusting God’s timing, and growing through dry seasons.',
    reflection: 'A tree grows before its fruit is visible. Consider one small practice that helps you return to God: a passage, a prayer, or a quiet moment. Fruitfulness can mean patience, kindness, and faithfulness in the life you already have.',
    question: 'What would help you stay rooted in God in the season you are in?',
    readingDays: [34],
  },
  {
    id: 'UPNGrIWqtSE', slug: 'morning-prayer', title: 'Begin the day with God.',
    youtubeTitle: 'A Powerful Prayer to Strengthen Your Faith Today | Morning Prayer',
    category: 'Morning prayer', duration: '3:21', passage: 'Psalm 5:12',
    verse: 'For thou, LORD, wilt bless the righteous; with favour wilt thou compass him as with a shield.',
    summary: 'Pause before the day begins with a prayer for guidance, grace, and confidence in God’s presence.',
    reflection: 'Before the responsibilities of the day gather, make room for one honest prayer. Name what is ahead of you and ask for wisdom to meet it. Consider how you might extend the grace you seek to someone else today.',
    question: 'What part of today would you like to bring to God before you begin?',
    readingDays: [34],
  },
  {
    id: 'y_mAxFernTY', slug: 'night-prayer', title: 'Rest in being known.',
    youtubeTitle: 'A Powerful Night Prayer for Peace, Healing, and Rest | Night Prayer',
    category: 'Night prayer', duration: '2:45', passage: 'Psalm 8:5',
    verse: 'For thou hast made him a little lower than the angels, and hast crowned him with glory and honour.',
    summary: 'An evening prayer about dignity, releasing comparison, and remembering the worth God gives His creation.',
    reflection: 'The end of a difficult day can make its hardest moments feel like the whole story. Read Psalm 8 slowly and consider the dignity of being part of God’s creation. What pressure could you set down for tonight?',
    question: 'What would you like to release before you rest tonight?',
    readingDays: [34],
  },
  {
    id: 'ZG983G9I0FY', slug: 'walk-by-faith', title: 'One faithful step.',
    youtubeTitle: 'Walk by Faith, Not by Sight | Christian Devotion for Trust, Perseverance & God’s Faithfulness',
    category: 'Trust & perseverance', duration: '8:12', passage: '2 Corinthians 5:7',
    verse: '(For we walk by faith, not by sight:)',
    summary: 'A reflection on trust in ordinary decisions, perseverance in waiting, and bringing honest doubts to God.',
    reflection: 'You may not be able to see the whole path. Begin with the next wise, faithful step: asking for help, keeping a promise, or making time to pray. Trust can grow alongside questions.',
    question: 'Where are you being invited to take one small, faithful step?',
    readingDays: [77],
  },
];

export function channelMessage(slug: string | undefined) {
  return CHANNEL_MESSAGES.find(message => message.slug === slug);
}
export function messagePath(message: ChannelMessage) { return `/watch/${message.slug}/`; }
export function youtubeVideoUrl(message: ChannelMessage) { return `https://www.youtube.com/watch?v=${message.id}`; }
export function messageThumbnail(message: ChannelMessage) { return `https://i.ytimg.com/vi/${message.id}/hqdefault.jpg`; }
export function messageScheduleUrl(message: ChannelMessage) {
  return '/schedule/?' + new URLSearchParams({ source: 'youtube', content: 'bible_study', topic: `Help me reflect on ${message.passage} after watching “${message.title}” on El Roi Calls.` });
}
export function messageConversationDraft(message: ChannelMessage, reflection: string, existing: string) {
  const context = `I would like to discuss “${message.title}” from El Roi Calls and ${message.passage}.`;
  const parts = [existing.trim()];
  if (!existing.includes(context)) parts.push(context);
  if (reflection.trim()) parts.push(`My reflection: ${reflection.trim()}`);
  const result = parts.filter(Boolean).join('\n\n');
  // Never silently truncate a person's words or overwrite an earlier draft.
  return result.length <= 2000 ? result : null;
}
