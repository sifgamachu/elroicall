// A dated presentation campaign. Core routes, calling and reading progress do not depend on it.
export const SEASONAL_CAMPAIGN = {
  id: 'autumn-2026',
  enabled: true,
  previewStartsOn: '2026-09-22',
  startsOn: '2026-10-01',
  endsBefore: '2027-01-01',
  timeZone: 'America/New_York',
  label: 'October–December 2026',
} as const;

export function activeSeason(now = new Date(), campaign = SEASONAL_CAMPAIGN) {
  if (!campaign.enabled || !Number.isFinite(now.getTime())) return null;
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: campaign.timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
  return date >= campaign.previewStartsOn && date < campaign.endsBefore ? campaign : null;
}

export type ActiveSeason = ReturnType<typeof activeSeason>;
