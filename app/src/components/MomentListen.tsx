import { useEffect, useRef, useState } from 'react';
import { Headphones, Square } from 'lucide-react';
import { speechChunks, type ScriptureMoment } from '@/lib/scripture-library';

export default function MomentListen({ moment }: { moment: ScriptureMoment }) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const active = useRef<SpeechSynthesisUtterance | null>(null);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  useEffect(() => {
    const sequence = generation;
    const clock = timer;
    const utterance = active;
    return () => { sequence.current++; clearTimeout(clock.current); if (utterance.current && 'speechSynthesis' in window) window.speechSynthesis.cancel(); utterance.current = null; };
  }, []);
  function stop() { generation.current++; clearTimeout(timer.current); window.speechSynthesis.cancel(); active.current = null; setPlaying(false); }
  function listen() {
    if (!supported) return;
    if (playing) { stop(); return; }
    stop(); setError(''); setPlaying(true);
    const current = generation.current;
    const chunks = speechChunks(`${moment.title} Scripture excerpt: ${moment.verse}, King James Version. ${moment.quote} Story summary. ${moment.story} Reflection. ${moment.reflection} A question for you. ${moment.question} One small step. ${moment.action} A prayer you can make your own. ${moment.prayer}`);
    let index = 0;
    function fail() { if (current !== generation.current) return; stop(); setError('Audio could not play on this device. You can read the full reflection below.'); }
    function next() {
      if (current !== generation.current) return;
      if (index === chunks.length) { active.current = null; setPlaying(false); return; }
      const utterance = new SpeechSynthesisUtterance(chunks[index++]); active.current = utterance;
      utterance.lang = 'en-US'; utterance.rate = 0.93;
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(value => value.localService && value.lang.startsWith('en')) || voices.find(value => value.lang.startsWith('en'));
      if (voice) utterance.voice = voice;
      utterance.onstart = () => { if (current !== generation.current) return; clearTimeout(timer.current); timer.current = setTimeout(fail, 30000); };
      utterance.onend = () => { if (current !== generation.current) return; clearTimeout(timer.current); next(); };
      utterance.onerror = fail;
      timer.current = setTimeout(fail, 12000);
      try { window.speechSynthesis.speak(utterance); } catch { fail(); }
    }
    next();
  }
  return <div className="moment-listen"><button type="button" className="elroi-button elroi-button-secondary" disabled={!supported} onClick={listen}>{playing ? <Square size={16} /> : <Headphones size={18} />}{playing ? 'Stop listening' : 'Listen to this reflection'}</button><span>{supported ? 'Uses your device’s reading voice.' : 'Audio is unavailable in this browser. Reading is always available.'}</span>{error && <p role="status">{error}</p>}</div>;
}
