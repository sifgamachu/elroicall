import { useEffect, useMemo, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Check, Headphones, LoaderCircle, Pause, Play, Save } from 'lucide-react';
import { CONTENT_TYPES, schedulingRequest, VOICES } from '@/lib/scheduled-calls';
import { validatePreferences, type MemberPreferences } from '@/lib/dashboard';

export default function DashboardPreferences({session,initial,voiceReady,onSaved}:{session:Session;initial:MemberPreferences;voiceReady:boolean;onSaved:()=>Promise<void>}){
 const [values,setValues]=useState({...initial,timezone:initial.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone});
 const [busy,setBusy]=useState(false);const [notice,setNotice]=useState('');const [error,setError]=useState('');
 const [playing,setPlaying]=useState('');const [loading,setLoading]=useState(false);
 const audio=useRef<HTMLAudioElement|null>(null);const sequence=useRef(0);
 const zones=useMemo(()=>Array.from(new Set(['UTC',Intl.DateTimeFormat().resolvedOptions().timeZone,...Intl.supportedValuesOf('timeZone')])).sort(),[]);
 useEffect(()=>{const sound=audio;const seq=sequence;return()=>{seq.current++;sound.current?.pause();};},[]);
 async function preview(voice:string){
  const current=++sequence.current;audio.current?.pause();setError('');
  if(playing===voice){setPlaying('');setLoading(false);return;}
  setPlaying(voice);setLoading(true);
  try{const result=await schedulingRequest<{url:string}>(`/voice-preview/${voice}`,session);if(current!==sequence.current)return;const sound=new Audio(result.url);audio.current=sound;sound.onended=()=>{if(current===sequence.current)setPlaying('');};sound.onerror=()=>{if(current===sequence.current){setPlaying('');setError('This sample could not play. Try again.');}};await sound.play();if(current===sequence.current)setLoading(false);}
  catch{if(current===sequence.current){setPlaying('');setLoading(false);setError('The voice sample is unavailable. Please try again later.');}}
 }
 async function save(){
  if(busy)return;const issue=validatePreferences(values);if(issue){setError(issue);return;}
  setBusy(true);setError('');setNotice('');
  try{await schedulingRequest('/preferences',session,values);setNotice('Preferences saved. Your next new schedule will start with these choices.');await onSaved();}
  catch{setError('We could not confirm the save. Refresh your dashboard to check before trying again.');}finally{setBusy(false);}
 }
 return <section className="dash-card dash-preferences"><div className="dash-card-heading"><span className="elroi-icon-tile"><Headphones size={23}/></span><div><h2>Your preferred experience</h2><p>A familiar starting point for each new schedule.</p></div></div><form onSubmit={event=>{event.preventDefault();void save();}} className="dash-form-stack">
  <label className="dash-field" htmlFor="display-name">What should we call you?<input id="display-name" value={values.display_name} onChange={event=>setValues({...values,display_name:event.target.value})} maxLength={60} autoComplete="given-name" placeholder="Your first name" disabled={busy}/></label>
  <label className="dash-field" htmlFor="preference-zone">Your time zone<select id="preference-zone" value={values.timezone||'UTC'} onChange={event=>setValues({...values,timezone:event.target.value})} disabled={busy}>{zones.map(zone=><option value={zone} key={zone}>{zone.replaceAll('_',' ')}</option>)}</select></label>
  <fieldset className="dash-voice-field" disabled={busy}><legend>Preferred voice</legend><p>One El Roi Guide, with a voice you choose. All voices are AI generated.</p><div className="dash-voice-grid">{VOICES.map((voice,index)=><div className="dash-voice" key={voice.id} data-selected={values.default_voice===voice.id}><label><input type="radio" name="preferred-voice" value={voice.id} checked={values.default_voice===voice.id} onChange={()=>setValues({...values,default_voice:voice.id})}/><span className={`dash-voice-mark dash-voice-${index}`} aria-hidden="true"><i/><i/><i/><i/><i/></span><strong>{voice.name}</strong>{values.default_voice===voice.id&&<Check size={15}/>}</label><button type="button" disabled={!voiceReady||busy} onClick={()=>void preview(voice.id)} aria-label={`${playing===voice.id?'Stop':'Preview'} ${voice.name}`} aria-pressed={playing===voice.id}>{playing===voice.id?loading?<LoaderCircle size={15} className="animate-spin"/>:<Pause size={15}/>:<Play size={15}/>}<span>{playing===voice.id?loading?'Loading…':'Stop':'Listen'}</span></button></div>)}</div><p className="dash-help">{voiceReady?'Listen before choosing. You can pick a different voice for any call.':'Voice samples will be available when the voice service is connected.'}</p></fieldset>
  <div className="dash-preference-row"><label className="dash-field" htmlFor="preferred-format">Usual call format<select id="preferred-format" value={values.default_content_type||''} onChange={event=>setValues({...values,default_content_type:(event.target.value||null) as MemberPreferences['default_content_type']})} disabled={busy}><option value="">Choose each time</option>{CONTENT_TYPES.map(type=><option key={type.id} value={type.id}>{type.name}</option>)}</select></label><label className="dash-field" htmlFor="preferred-length">Usual length<select id="preferred-length" value={values.duration_minutes} onChange={event=>setValues({...values,duration_minutes:Number(event.target.value)})} disabled={busy}>{[5,10,15].map(length=><option key={length} value={length}>About {length} minutes</option>)}</select></label></div>
  <p className="dash-help">Saving preferences does not book a call or change existing schedules. You review the time and give consent in the planner.</p>
  <button className="elroi-button elroi-button-primary" type="submit" disabled={busy}><Save size={17}/>{busy?'Saving…':'Save my preferences'}</button>
  {notice&&<p className="dash-banner" role="status"><Check size={16}/>{notice}</p>}{error&&<p className="dash-error" role="alert">{error}</p>}
 </form></section>;
}
