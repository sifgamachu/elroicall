export type ScheduleChoices = {
  content_type: string; topic: string; voice: string; local_time: string; timezone: string;
  recurrence: 'once' | 'weekly'; weekdays: number[]; start_date: string;
  duration_minutes: number; journey_slug: string | null;
};
export type SavedScheduleDraft = { owner: string | null; savedAt: number; choices: ScheduleChoices; requestId: string; step: number };
type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export const SCHEDULE_DRAFT_KEY = 'elroi:schedule-draft:v1';
export const DRAFT_LIFETIME = 30 * 60 * 1000;
function cleanChoices(raw: unknown): ScheduleChoices | null {
  if (!raw || typeof raw !== 'object') return null;
  const c = raw as Record<string, unknown>;
  const fields = ['content_type', 'topic', 'voice', 'local_time', 'timezone', 'start_date'] as const;
  if (fields.some(key => typeof c[key] !== 'string' || (c[key] as string).length > 160)) return null;
  if (!['once', 'weekly'].includes(String(c.recurrence)) || !Array.isArray(c.weekdays) || ![5,10,15].includes(Number(c.duration_minutes))) return null;
  try { new Intl.DateTimeFormat('en-US', { timeZone: String(c.timezone) }).format(); } catch { return null; }
  return {
    content_type: String(c.content_type), topic: String(c.topic), voice: String(c.voice),
    local_time: String(c.local_time), timezone: String(c.timezone), recurrence: c.recurrence as 'once' | 'weekly',
    weekdays: [...new Set(c.weekdays.filter((day): day is number => typeof day === 'number' && Number.isInteger(day) && day >= 0 && day <= 6))].sort(),
    start_date: String(c.start_date), duration_minutes: Number(c.duration_minutes),
    journey_slug: typeof c.journey_slug === 'string' && c.journey_slug.length <= 80 ? c.journey_slug : null,
  };
}
export function clearScheduleDraft(storage: StorageLike): void { try { storage.removeItem(SCHEDULE_DRAFT_KEY); } catch { /* Private mode must not break booking. */ } }
export function readScheduleDraft(storage: StorageLike, owner: string | null, now = Date.now()): SavedScheduleDraft | null {
  try {
    const raw = storage.getItem(SCHEDULE_DRAFT_KEY);
    if (!raw) return null;
    if (raw.length > 6000) { clearScheduleDraft(storage); return null; }
    const d = JSON.parse(raw) as SavedScheduleDraft;
    const choices = cleanChoices(d?.choices);
    if (!choices || !Number.isFinite(d.savedAt) || d.savedAt > now || now - d.savedAt > DRAFT_LIFETIME || (d.owner !== null && d.owner !== owner) || typeof d.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(d.requestId)) {
      clearScheduleDraft(storage); return null;
    }
    return { owner, savedAt: d.savedAt, choices, requestId: d.requestId, step: Number.isInteger(d.step) ? Math.min(3, Math.max(0, d.step)) : 0 };
  } catch { clearScheduleDraft(storage); return null; }
}
export function writeScheduleDraft(storage: StorageLike, draft: SavedScheduleDraft): boolean {
  const choices = cleanChoices(draft.choices);
  if (!choices) return false;
  try {
    // Explicit allowlist: never store credentials, phone numbers, or calling consent.
    storage.setItem(SCHEDULE_DRAFT_KEY, JSON.stringify({ owner: draft.owner, savedAt: draft.savedAt, choices, requestId: draft.requestId, step: draft.step }));
    return true;
  } catch { return false; }
}
