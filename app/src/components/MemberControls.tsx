import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Check, PhoneCall, ShieldCheck } from 'lucide-react';
import { normalizePhone } from '@/lib/phone';
import { portalRequest, type PortalMember } from '@/lib/portal';

const errors:Record<string,string>={phone_unavailable:'That number is already connected to another account.',phone_taken:'That number is already connected to another account.',verification_unavailable:'Phone verification is being connected. Your account preferences can still be saved.',verification_call_failed:'The verification call could not be placed. Check the number and try again later.',too_many_requests:'Please wait an hour before requesting another code.',expired:'That code expired. Request a new verification call.',too_many_attempts:'Too many incorrect attempts. Request a new verification call.',no_pending:'There is no active code. Request a verification call first.',wrong_code:'That code did not match. Check the six digits and try again.'};
export default function MemberControls({session,member,onRefresh}:{session:Session;member:PortalMember;onRefresh:()=>Promise<void>}) {
 const [editing,setEditing]=useState(!member.phone_verified);
 const [pending,setPending]=useState(member.verification_pending===true);
 const [phone,setPhone]=useState(member.pending_phone||member.phone||'');
 const [code,setCode]=useState('');const [consent,setConsent]=useState(false);
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');
 async function requestCode(){
  const normalized=normalizePhone(phone);if(!normalized||!consent||busy)return;
  setBusy(true);setError('');setNotice('');
  try{
   const {status,data}=await portalRequest<{verify?:string;error?:string}>('/phone',session,{phone:normalized,consent:true});
   if(status===200&&data.verify==='calling'){setPending(true);setCode('');setNotice('Your verification call is on its way. Enter the six-digit code you hear.');}
   else if(status===202){setPending(true);setNotice('We could not confirm the call status. If it rings, enter the code. Please wait before requesting another call.');}
   else setError(errors[data.error||'']||'Your verification call could not be requested. Try again later.');
  }catch{setPending(true);setError('We could not confirm the call. If it rings, enter the code. Check your connection before requesting another.');}
  finally{setBusy(false);}
 }
 async function verify(){
  if(code.length!==6||busy)return;setBusy(true);setError('');setNotice('');
  try{
   const {status,data}=await portalRequest<{phone_verified?:boolean;error?:string}>('/verify',session,{code});
   if(status===200&&data.phone_verified){setEditing(false);setPending(false);setCode('');setNotice('Your phone is verified. You can use it for scheduled calls.');await onRefresh();}
   else setError(errors[data.error||'']||'We could not verify your number. Try again.');
  }catch{setError('We could not confirm verification. Refresh your dashboard before trying again.');}
  finally{setBusy(false);}
 }
 return <section className="dash-card dash-phone" id="calling-preferences" aria-labelledby="phone-heading">
  <div className="dash-card-heading"><span className="elroi-icon-tile"><ShieldCheck size={22}/></span><div><h2 id="phone-heading">Your calling number</h2><p>A private connection, verified by you.</p></div></div>
  {member.phone_verified&&<div className="dash-verified"><Check size={17}/><span>{member.phone}</span><strong>Verified</strong></div>}
  {!editing&&<button type="button" className="elroi-text-link" onClick={()=>setEditing(true)}>Change phone number</button>}
  {editing&&<div className="dash-form-stack">
   {member.phone_verified&&<p className="dash-help">Your current number stays connected until the new one is verified. Changing it pauses calls scheduled for the old number.</p>}
   {!member.verify_ready&&<p className="dash-banner" role="status">Verification calls are being connected. You can save your other preferences now.</p>}
   <form onSubmit={event=>{event.preventDefault();void requestCode();}} className="dash-form-stack">
    <label className="dash-field" htmlFor="member-phone">Phone number<input id="member-phone" type="tel" autoComplete="tel" value={phone} disabled={busy} onChange={event=>{setPhone(event.target.value);setPending(false);setCode('');setConsent(false);}} placeholder="+1 (202) 555-0123" required/></label>
    <label className="dash-consent"><input type="checkbox" checked={consent} disabled={busy} onChange={event=>setConsent(event.target.checked)}/><span>Call this number once with a verification code. I confirm this is my number.</span></label>
    <button type="submit" className="elroi-button elroi-button-primary" disabled={busy||!member.verify_ready||!normalizePhone(phone)||!consent}><PhoneCall size={17}/>{busy?'Please wait…':pending?'Request a new code':'Call me with a code'}</button>
   </form>
   {pending&&<form className="dash-code-form" onSubmit={event=>{event.preventDefault();void verify();}}><label className="dash-field" htmlFor="member-code">Six-digit verification code<input id="member-code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,'').slice(0,6))} disabled={busy} placeholder="000000" required/></label><button type="submit" className="elroi-button elroi-button-dark" disabled={busy||code.length!==6}>Verify number</button></form>}
   {member.phone_verified&&<button type="button" className="elroi-text-link" onClick={()=>setEditing(false)}>Keep current number</button>}
  </div>}
  {notice&&<p role="status" className="dash-help">{notice}</p>}{error&&<p role="alert" className="dash-error">{error}</p>}
 </section>;
}
