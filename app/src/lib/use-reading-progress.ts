import { useEffect, useRef, useState } from 'react';
import { LIBRARY_STORAGE_KEY, parseProgress, updateProgress, type ReadingProgress } from './scripture-library';

export function useReadingProgress() {
  const [progress, setProgress] = useState<ReadingProgress>(() => {
    try { return parseProgress(localStorage.getItem(LIBRARY_STORAGE_KEY)); } catch { return parseProgress(null); }
  });
  const [storageError, setStorageError] = useState('');
  const volatile = useRef(false);
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === LIBRARY_STORAGE_KEY || event.key === null) setProgress(parseProgress(event.newValue)); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  function toggle(kind: 'saved' | 'completed', id: string) {
    let current = progress;
    if (!volatile.current) { try { current = parseProgress(localStorage.getItem(LIBRARY_STORAGE_KEY)); } catch { /* Keep this visit usable without storage. */ } }
    const next = updateProgress(current, kind, id);
    setProgress(next);
    try { localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(next)); volatile.current = false; setStorageError(''); }
    catch { volatile.current = true; setStorageError('Your browser could not save this change. It is available for this visit only.'); }
  }
  function clear() {
    try { localStorage.removeItem(LIBRARY_STORAGE_KEY); volatile.current = false; setProgress(parseProgress(null)); setStorageError(''); return true; }
    catch { setStorageError('Your browser could not clear saved progress. Clear this site’s data in your browser settings.'); return false; }
  }
  return { progress, toggle, clear, storageError };
}
