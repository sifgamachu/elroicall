export const CONTENT_TYPES = [
  { id: 'bible_study', name: 'Bible study', description: 'Explore a passage, its context, and questions for reflection.' },
  { id: 'sermon', name: 'Sermon', description: 'A focused message connecting Scripture with everyday life.' },
  { id: 'lecture', name: 'Bible lecture', description: 'Learn about biblical history, themes, and background.' },
  { id: 'story', name: 'Biblical story', description: 'Hear a story from Scripture, with room to reflect.' },
  { id: 'bible_facts', name: 'Bible facts', description: 'Discover facts with references you can look up.' },
] as const;
export const VOICES = [
  { id: 'marin', name: 'Marin' }, { id: 'cedar', name: 'Cedar' },
  { id: 'coral', name: 'Coral' }, { id: 'onyx', name: 'Onyx' },
] as const;
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export type ContentType = typeof CONTENT_TYPES[number]['id'];
export type Voice = typeof VOICES[number]['id'];
export type CallPlanInput = {
  content_type: ContentType; topic: string; voice: Voice; local_time: string;
  timezone: string; recurrence: 'once' | 'weekly'; weekdays: number[];
  start_date: string; duration_minutes: number; consent: boolean; request_id: string;
};
export type CallPlan = CallPlanInput & {
  id: string; active: boolean; next_run_at: string | null; phone_last4: string;
  created_at: string; last_status?: string; last_called_at?: string; references?: string[];
};
export function validTimezone(value: string): boolean {
  try { new Intl.DateTimeFormat('en-US', { timeZone: value }).format(); return value.length <= 100; }
  catch { return false; }
}
export function localDate(date = new Date(), timezone = 'UTC'): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export function validatePlan(value: unknown, now = new Date()): string | null {
  if (!value || typeof value !== 'object') return 'Choose your call preferences.';
  const p = value as CallPlanInput;
  if (!CONTENT_TYPES.some(type => type.id === p.content_type)) return 'Choose what your call is for.';
  if (!VOICES.some(voice => voice.id === p.voice)) return 'Choose a voice.';
  if (typeof p.topic !== 'string' || !p.topic.trim() || p.topic.length > 160) return 'Enter a topic or Bible passage, up to 160 characters.';
  if (typeof p.local_time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(p.local_time)) return 'Choose a valid call time.';
  if (typeof p.timezone !== 'string' || !validTimezone(p.timezone)) return 'Choose a valid time zone.';
  if (!['once', 'weekly'].includes(p.recurrence)) return 'Choose whether this call repeats.';
  if (!Array.isArray(p.weekdays) || p.weekdays.some(day => !Number.isInteger(day) || day < 0 || day > 6) || new Set(p.weekdays).size !== p.weekdays.length) return 'Choose valid days of the week.';
  if (p.recurrence === 'weekly' && !p.weekdays.length) return 'Choose at least one day.';
  if (typeof p.start_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(p.start_date)) return 'Choose a start date.';
  const date = new Date(`${p.start_date}T12:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== p.start_date) return 'Choose a real calendar date.';
  if (p.start_date < localDate(now, p.timezone)) return 'Choose today or a future date.';
  if (date.getTime() > now.getTime() + 366 * 86400000) return 'Choose a date within the next year.';
  if (![5, 10, 15].includes(p.duration_minutes)) return 'Choose a 5, 10, or 15 minute call.';
  if (p.consent !== true) return 'Confirm that you want these automated calls.';
  if (typeof p.request_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(p.request_id)) return 'Refresh and try saving again.';
  return null;
}
export function planLabel(plan: Pick<CallPlanInput, 'recurrence' | 'weekdays' | 'start_date'>): string {
  if (plan.recurrence === 'once') return `Once on ${plan.start_date}`;
  if (plan.weekdays.length === 7) return 'Every day';
  return plan.weekdays.map(day => WEEKDAYS[day]?.slice(0,3)).join(', ');
}
export function splitSpeech(text: string, limit = 2800): string[] {
  if (limit < 100) throw new Error('Speech chunk limit is too small');
  const chunks: string[] = []; let chunk = '';
  for (const word of text.trim().split(/\s+/)) {
    if (word.length > limit) throw new Error('Speech contains an overlong word');
    if (`${chunk} ${word}`.trim().length > limit) { chunks.push(chunk); chunk = ''; }
    chunk = `${chunk} ${word}`.trim();
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}
export function escapeXml(text: string): string {
  return text.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);
}
