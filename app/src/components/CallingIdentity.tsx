import {useCallback,useEffect,useRef,useState} from 'react';
import type {Session} from '@supabase/supabase-js';
import {Check,KeyRound,RefreshCw,ShieldCheck} from 'lucide-react';
import {Link} from 'react-router';
import {Checkbox} from '@/components/ui/checkbox';
import {fetchJson,SUPABASE_URL} from '@/lib/api';
import {SUPABASE_ANON_KEY} from '@/lib/supabase';
import {validateCallingIdentity,type CallingIdentity as Identity} from '../../../supabase/functions/_shared/call-identity';

async function request(session:Session,body?:unknown):Promise<Identity>{
 const {status,data}=await fetchJson<Identity&{error?:string}>(`${SUPABASE_URL}/functions/v1/call-access/profile`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${session.access_token}`,apikey:SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined},20000);
 if(status!==200)throw Error(data.error||'Your calling identity is unavailable. Please try again.');return data;
}
export default function CallingIdentity({session,compact=false}:{session:Session;compact?:boolean}){
 const [data,setData]=useState<Identity|null>(null);const [nickname,setNickname]=useState('');const [revision,setRevision]=useState(0);
 const [pin,setPin]=useState('');const [confirmation,setConfirmation]=useState('');const [consent,setConsent]=useState(false);
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');
 const active=useRef(true);const pending=useRef(false);const generation=useRef(0);
 useEffect(()=>{active.current=true;const seq=generation;return()=>{active.current=false;seq.current++;};},[]);
 const refresh=useCallback(()=>{const current=++generation.current;return request(session).then(result=>{if(active.current&&current===generation.current){setData(result);setNickname(result.nickname);setRevision(result.revision);setPin('');setConfirmation('');setConsent(false);setError('');}}).catch(issue=>{if(active.current&&current===generation.current)setError(issue instanceof Error?issue.message:'Could not load your calling identity.');});},[session]);
 useEffect(()=>{void refresh();},[refresh]);
 async function save(){
  if(pending.current)return;
  const issue=validateCallingIdentity(nickname,pin);if(issue){setError(issue);return;}
  if(pin!==confirmation){setError('The two PIN entries must match.');return;}
  if(!consent){setError('Confirm your nickname and calling PIN before saving.');return;}
  pending.current=true;generation.current++;setBusy(true);setError('');setNotice('');
  const payload={nickname,pin,confirm_pin:confirmation,revision,consent};
  setPin('');setConfirmation('');setConsent(false);
  try{const result=await request(session,payload);if(active.current){setData(result);setNickname(result.nickname);setRevision(result.revision);setNotice(result.phone_ready?'Your nickname and PIN are saved. Use your keypad to verify when you call.':'Your nickname and PIN are saved. Phone verification with your PIN is being connected.');}}
  catch(issue){if(active.current)setError(issue instanceof Error?issue.message:'The save could not be confirmed. Refresh before trying again.');}
  finally{pending.current=false;if(active.current)setBusy(false);}
 }
 if(compact)return <section className="dash-setup"><span className="elroi-icon-tile"><KeyRound size={24}/></span><div><h2>{data?.pin_set?`Your calling name: ${data.nickname}`:'Make every conversation feel familiar.'}</h2><p>{data?.pin_set?(data.phone_ready?'Your six-digit calling PIN protects access to your personal conversations.':'Your calling PIN is saved. Verification on the phone is being connected.'):'Choose a nickname and a private six-digit calling PIN in Preferences.'}</p></div><Link to="/account/?view=settings#calling-identity" className="elroi-button elroi-button-dark">{data?.pin_set?'Manage my calling PIN':'Set my nickname & PIN'}</Link></section>;
 return <section id="calling-identity" className="dash-card dash-preferences"><div className="dash-card-heading"><span className="elroi-icon-tile"><ShieldCheck size={23}/></span><div><h2>Your nickname & calling PIN</h2><p>A familiar name. A private way to verify it’s you.</p></div></div>
  <p className="dash-help">Choose the name you would like to hear on calls. Your calling PIN is separate from website sign-in. Enter it on your phone keypad when prompted; please do not say it aloud or share it with anyone.</p>
  {data?<form className="dash-form-stack" onSubmit={e=>{e.preventDefault();void save();}}>
   <label className="dash-field" htmlFor="calling-nickname">Your nickname<input id="calling-nickname" value={nickname} onChange={e=>{setNickname(e.target.value);setConsent(false);}} minLength={2} maxLength={40} autoComplete="nickname" placeholder="A name that feels like you" disabled={busy} required/></label>
   <div className="dash-preference-row"><label className="dash-field" htmlFor="calling-pin">{data.pin_set?'New six-digit PIN':'Choose a six-digit PIN'}<input id="calling-pin" type="password" inputMode="numeric" autoComplete="new-password" value={pin} onChange={e=>{setPin(e.target.value.replace(/\D/g,''));setConsent(false);}} minLength={6} maxLength={6} pattern="[0-9]{6}" placeholder="Six digits" disabled={busy} required/></label><label className="dash-field" htmlFor="confirm-calling-pin">Confirm your PIN<input id="confirm-calling-pin" type="password" inputMode="numeric" autoComplete="new-password" value={confirmation} onChange={e=>{setConfirmation(e.target.value.replace(/\D/g,''));setConsent(false);}} minLength={6} maxLength={6} pattern="[0-9]{6}" placeholder="Enter it again" disabled={busy} required/></label></div>
   <label className="memory-consent"><Checkbox checked={consent} disabled={busy} onCheckedChange={v=>setConsent(v===true)}/><span>Use this nickname and PIN to protect my calls.</span></label>
   <p className="dash-help">{data.phone_verified?`Your verified calling number ends in ${data.phone_last4}.`:'Verify your calling number below before using your PIN on a call.'} {data.pin_set?'Forgot your calling PIN? Set a new one here while signed in. Your current PIN is never shown.':''}</p>
   {!data.phone_ready&&<p className="dash-service-note">You can save your nickname and PIN now. PIN verification and the first-call signup rule are being connected to the phone service.</p>}
   <button type="submit" className="elroi-button elroi-button-primary" disabled={busy||!consent}><KeyRound size={17}/>{busy?'Saving…':data.pin_set?'Update my nickname & PIN':'Save my nickname & PIN'}</button>
  </form>:!error&&<p role="status">Opening your calling identity…</p>}
  {notice&&<p className="dash-banner" role="status"><Check size={17}/>{notice}</p>}{error&&<div className="dash-error-box" role="alert"><p>{error}</p><button type="button" className="elroi-text-link" disabled={busy} onClick={()=>void refresh()}>Refresh <RefreshCw size={16}/></button></div>}
 </section>;
}
