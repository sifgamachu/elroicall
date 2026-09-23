import { useEffect, useId, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { PhoneCall } from 'lucide-react';
import { portalRequest, type PortalMember } from '@/lib/portal';

export default function CallConnectionTest({session,member}:{session:Session;member:PortalMember}) {
  const id=useId();const [consent,setConsent]=useState(false);const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');const [error,setError]=useState('');const [cooldown,setCooldown]=useState(0);
  const pending=useRef(false);const mounted=useRef(true);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  useEffect(()=>{if(!cooldown)return;const timer=setTimeout(()=>setCooldown(value=>Math.max(0,value-1)),1000);return()=>clearTimeout(timer);},[cooldown]);
  async function testCall(){
    if(pending.current||cooldown||!consent||!member.phone_verified||!member.test_call_ready)return;
    pending.current=true;setBusy(true);setError('');setNotice('');setConsent(false);setCooldown(60);
    try{
      // No receiving number, voice, topic, or owner is supplied. The server uses the verified account.
      const {status,data}=await portalRequest<{test?:string;error?:string}>('/test-call',session,{consent:true,request_id:crypto.randomUUID()});
      if(!mounted.current)return;
      if(status===200&&data.test==='requested')setNotice('The phone provider accepted your test request. Your phone should ring shortly. This is not confirmation that you answered. No lesson was booked or schedule changed.');
      else if(status===202)setNotice('The provider response is uncertain. Your phone may still ring. We will not automatically send another call. No lesson was booked.');
      else if(status===429){setCooldown(3600);setError('The test-call limit has been reached. Please wait an hour before requesting another test.');}
      else if(status===409&&data.error==='test_already_requested')setNotice('This test was already requested. Check your phone; we have not placed a duplicate call.');
      else if(data.error==='calling_number_changed'||data.error==='phone_not_verified')setError('Your calling number changed or needs verification. Refresh calling access before testing.');
      else if(data.error==='test_call_unavailable')setError('Test calls are unavailable because the calling service is not configured. Your number is not the cause.');
      else setError('The test call was not confirmed. Check your phone and refresh calling access before trying again.');
    }catch{if(mounted.current)setNotice('The request could not be confirmed. Your phone may still ring. No automatic retry will be made.');}
    finally{pending.current=false;if(mounted.current)setBusy(false);}
  }
  return <details className="flow-details"><summary>Optional: test this verified number</summary>
    <form className="dash-form-stack" onSubmit={event=>{event.preventDefault();void testCall();}}>
      <p className="dash-help">Send one short connection test to your verified number ending in {member.phone?.slice(-4)}. It uses a system voice, not your selected Bible-study voice. It does not book, pause, or change a schedule.</p>
      {!member.test_call_ready&&<p className="dash-banner" role="status">Connection tests are unavailable until the calling service is connected. Your verified number stays saved.</p>}
      <label className="dash-consent" htmlFor={`${id}-consent`}><input id={`${id}-consent`} type="checkbox" checked={consent} disabled={busy||!member.test_call_ready||cooldown>0} onChange={event=>setConsent(event.target.checked)}/><span>Call my verified number once now with a short connection test. Carrier charges may apply.</span></label>
      <button type="submit" className="elroi-button elroi-button-secondary" disabled={busy||cooldown>0||!consent||!member.test_call_ready}><PhoneCall size={17}/>{busy?'Requesting test…':cooldown?`Another test available in ${cooldown}s`:'Test this number now'}</button>
      {notice&&<p role="status" className="dash-help">{notice}</p>}{error&&<p role="alert" className="dash-error">{error}</p>}
    </form>
  </details>;
}
