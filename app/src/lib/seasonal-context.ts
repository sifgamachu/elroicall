import { createContext, useContext } from 'react';
import type { ActiveSeason } from './seasonal-experience';

export const SeasonalContext = createContext<ActiveSeason>(null);
export const useSeason = () => useContext(SeasonalContext);
