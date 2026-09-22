import { useEffect, useState, type ReactNode } from 'react';
import { activeSeason } from '@/lib/seasonal-experience';
import { SeasonalContext } from '@/lib/seasonal-context';

export default function SeasonalExperienceProvider({ children }: { children: ReactNode }) {
  const [season, setSeason] = useState(activeSeason);
  useEffect(() => {
    const refresh = () => setSeason(activeSeason());
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  return <SeasonalContext.Provider value={season}>{children}</SeasonalContext.Provider>;
}
