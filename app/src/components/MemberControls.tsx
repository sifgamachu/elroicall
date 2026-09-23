import { useEffect, useId, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Check, PhoneCall, RefreshCw, ShieldCheck } from 'lucide-react';
import { normalizePhone, PHONE_DISPLAY, PHONE_TEL } from '@/lib/phone';
import { portalRequest, type PortalMember } from '@/lib/portal';
import CallConnectionTest from './CallConnectionTest';

const errors:Record<string,string>={phone_unavailable:'That number is already connected to another account.',phone_taken:'That number is already connected to another account.',verification_unavailable:'Verification calls are unavailable because the calling service is not configured. This is a setup issue on our side.',verification_call_failed:'The phone provider rejected the verification call. Check the receiving number and try again later.',too_many_requests:'Please wait an hour before requesting another code.',expired:'That code expired. Request a new verification call.',too_many_attempts:'Too many incorrect attempts. Request a new verification call.',no_pending:'There is no active code. Request a verification call first.',wrong_code:'That code did not match. Check the six digits and try again.',invalid_phone:'Enter the number that should ring, including its country code.',service_number_not_allowed:'Enter your own receiving number, not the El Roi service number.',consent_required:'Confirm that this is your number and that you want one verification call.',unauthorized:'Your sign-in expired. Sign in again before verifying your number.'};
export default function MemberControls({session,member,onRefresh}:{session:Session;member:PortalMember;onRefresh:()=>Promise<void>}) {
 const id=useId();const [editing,setEditing]=useState(!member.phone_verified);
 const [pending,setPending]=useState(member.verification_pending===true);
 const [phone,setPhone]=useState(member.pending_phone||member.phone||'');
 const [code,setCode]=useState('');const [consent,setConsent]=useState(false);
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');const [cooldown,setCooldown]=useState(0);
 const running=useRef(false);const mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 useEffect(()=>{if(!cooldown)return;const timer=setTimeout(()=>setCooldown(value=>Math.max(0,value-1)),1000);return()=>clearTimeout(timer);},[cooldown]);
 const normalized=normalizePhone(phone);const isService=normalized===PHONE_TEL.replace('tel:','');
 async function requestCode(){
  if(running.current||cooldown)return;
  if(!normalized||isService){setError(isService?errors.service_number_not_allowed:errors.invalid_phone);return;}
  if(!member.verify_ready){setError(errors.verification_unavailable);return;}
  if(!consent){setError(errors.consent_required);return;}
  running.current=true;setBusy(true);setError('');setNotice('');setCooldown(60);setConsent(false);
  try{
   const {status,data}=await portalRequest<{verify?:string;error?:string}>('/phone',session,{phone:normalized,consent:true});
   if(!mounted.current)return;
   if(status===200&&data.verify==='calling'){setPending(true);setCode('');setNotice('Verification test requested. Answer your phone and enter the six-digit code you hear below. Your Bible-study call is not booked yet.');}
   else if(status===202){setPending(true);setNotice('The call request is unconfirmed. Your phone may still ring; enter the code if it does. We will not automatically call again.');}
   else {if(status===429)setCooldown(3600);setError(errors[data.error||'']||'Your verification call could not be confirmed. Try again later.');}
  }catch{if(mounted.current){setPending(true);setError('The request could not be confirmed. Your phone may still ring. Enter the code if it does; do not immediately request another call.');}}
  finally{running.current=false;if(mounted.current)setBusy(false);}
 }
 async function verify(){
  if(code.length!==6||running.current)return;running.current=true;setBusy(true);setError('');setNotice('');
  try{
   const {status,data}=await portalRequest<{phone_verified?:boolean;error?:string}>('/verify',session,{code});
   if(!mounted.current)return;
   if(status===200&&data.phone_verified){setEditing(false);setPending(false);setCode('');setNotice('Your receiving number is verified. Finish your calling PIN setup if needed, then continue to review your Bible-study call.');await onRefresh();}
   else setError(errors[data.error||'']||'We could not verify your number. Try again.');
  }catch{if(mounted.current)setError('Verification could not be confirmed. Refresh calling access before trying again.');}
  finally{running.current=false;if(mounted.current){setBusy(false);setCode('');}}
 }
 async function refresh(){
  if(running.current)return;running.current=true;setBusy(true);setError('');
  try{await onRefresh();}catch{if(mounted.current)setError('Calling access could not be refreshed. Please try again.');}
  finally{running.current=false;if(mounted.current)setBusy(false);}
 }
 return <section className="dash-card dash-phone" id="calling-preferences" aria-labelledby={`${id}-heading`}>
  <div className="dash-card-heading"><span className="elroi-icon-tile"><ShieldCheck size={22}/></span><div><h2 id={`${id}-heading`}>Your receiving number & call test</h2><p>Enter the phone you want us to call—not the El Roi service number.</p></div></div>
  <p className="dash-help">A verification test is a short automated call with a code. It checks that you control this number. It does not start your Bible lesson or book your chosen time.</p>
  {member.phone_verified&&<div className="dash-verified"><Check size={17}/><span>{member.phone}</span><strong>Verified receiving number</strong></div>}
  {!editing&&<><button type="button" className="elroi-text-link" disabled={busy} onClick={()=>{setEditing(true);setNotice('');setError('');}}>Change receiving number</button><CallConnectionTest key={`${session.user.id}-${member.phone}`} session={session} member={member}/></>}
  {editing&&<div className="dash-form-stack">
   {member.phone_verified&&<p className="dash-help">Your current number stays connected until the new one is verified. Changing it pauses calls scheduled for the old number.</p>}
   {!member.verify_ready&&<div className="dash-error-box" role="status"><strong>Verification calls are unavailable.</strong><p>The website owner needs to connect the calling provider. You can enter your number here, but no verification call can be sent yet. Entering a number alone does not verify or book it.</p><button type="button" className="elroi-text-link" disabled={busy} onClick={()=>void refresh()}><RefreshCw size={16}/>Check calling connection</button></div>}
   <form onSubmit={event=>{event.preventDefault();void requestCode();}} className="dash-form-stack">
    <label className="dash-field" htmlFor={`${id}-phone`}>1. Number that should ring<input id={`${id}-phone`} name="receiving-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} disabled={busy} readOnly={pending} onChange={event=>{setPhone(event.target.value);setCode('');setConsent(false);setError('');}} placeholder="+1 (202) 555-0123" aria-describedby={`${id}-phone-help`} required/><span id={`${id}-phone-help`}>Include your country code. This is your receiving phone, not {PHONE_DISPLAY}.</span></label>
    {isService&&<p role="alert" className="dash-error">{errors.service_number_not_allowed}</p>}
    {pending&&<button type="button" className="elroi-text-link" disabled={busy} onClick={()=>{setPending(false);setCode('');setConsent(false);setNotice('');}}>Use a different receiving number</button>}
    <label className="dash-consent"><input type="checkbox" checked={consent} disabled={busy||!member.verify_ready||cooldown>0} onChange={event=>setConsent(event.target.checked)}/><span>I confirm this is my number. Call it once now with a verification code. Carrier charges may apply.</span></label>
    <button type="submit" className="elroi-button elroi-button-primary" disabled={busy||cooldown>0||!member.verify_ready||!normalized||isService||!consent}><PhoneCall size={17}/>{busy?'Please wait…':cooldown?`Request again in ${cooldown}s`:pending?'Send a new verification test':'Send verification test call'}</button>
   </form>
   {pending&&<form className="dash-code-form" onSubmit={event=>{event.preventDefault();void verify();}}><label className="dash-field" htmlFor={`${id}-code`}>2. Code you hear on the call<input id={`${id}-code`} type="text" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,'').slice(0,6))} disabled={busy} placeholder="Six-digit code" required/><span>This temporary code is not your permanent calling PIN.</span></label><button type="submit" className="elroi-button elroi-button-dark" disabled={busy||code.length!==6}>Verify my receiving number</button></form>}
   {member.phone_verified&&<button type="button" className="elroi-text-link" disabled={busy} onClick={()=>setEditing(false)}>Keep current number</button>}
  </div>}
  {notice&&<p role="status" className="dash-help">{notice}</p>}{error&&<p role="alert" className="dash-error">{error}</p>}
 </section>;
}
