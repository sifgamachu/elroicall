// Apply to a fresh native source AFTER the secure scheduling and continuity adapters.
// Fail on changed anchors; never silently omit a privacy gate.
export function patchVoiceCallingIdentity(source){
 if(!source.includes('CONTINUITY_INSTRUCTIONS')||!source.includes('Deno.env.get("VOICE_ROUTE_TOKEN")'))throw Error('Apply secure scheduling and continuity adapters first');
 if(source.includes('createCallGuard'))throw Error('Calling identity already installed');
 const replace=(before,after)=>{if(source.split(before).length!==2)throw Error('Calling identity anchor changed: '+before.slice(0,65));source=source.replace(before,after);};
 source='import {createCallGuard, remainingSeconds, type CallPermit} from "../_shared/call-guard.ts";\nimport {CALL_SECURITY_INSTRUCTIONS} from "../_shared/call-identity.ts";\n'+source;
 replace('const PRECURTAIN =',`const callGuard = createCallGuard({SUPABASE_URL:SB_URL,SUPABASE_SERVICE_ROLE_KEY:SB_KEY,TWILIO_ACCOUNT_SID:TW_SID,TWILIO_AUTH_TOKEN:TW_TOKEN,TWILIO_FROM_NUMBER:TW_FROM});
const PRECURTAIN =`);
 replace('  const closed = new Promise<void>((resolve) => {',`  let callAccess: CallPermit | null = null;
  let secureCall = false;
  let setupStarted = false;
  let deadlineTimer: ReturnType<typeof setTimeout> | undefined;
  let warningTimer: ReturnType<typeof setTimeout> | undefined;
  let accessTimer: ReturnType<typeof setInterval> | undefined;
  const clearAccessTimers = () => {clearTimeout(deadlineTimer);clearTimeout(warningTimer);clearInterval(accessTimer);};
  const stopAccess = () => {clearAccessTimers();try {socket.send(JSON.stringify({type:"end"}));socket.close();} catch { /* already closed */ }};
  const closed = new Promise<void>((resolve) => {`);
 replace('    socket.onclose = () => resolve();','    socket.onclose = () => {clearAccessTimers();resolve();};');
 replace('    socket.onerror = () => resolve();','    socket.onerror = () => {clearAccessTimers();resolve();};');
 replace('      const from = msg.from ?? p.from ?? "";',`      if(setupStarted){stopAccess();return;} setupStarted=true;
      try {
        secureCall=await callGuard.enabled();
        if(secureCall){
          callAccess=await callGuard.permit(callSid,String(p.callAccess||""));
          if(!callAccess){stopAccess();return;}
          const seconds=remainingSeconds(callAccess);
          deadlineTimer=setTimeout(stopAccess,seconds*1000);
          if(seconds>60)warningTimer=setTimeout(()=>{try {send("We have about one minute left. Let us bring this conversation to a gentle close.",true);}catch{/* closed */}},(seconds-60)*1000);
          accessTimer=setInterval(async()=>{try {if(!await callGuard.permit(callSid,callAccess!.relay_token))stopAccess();}catch{stopAccess();}},15000);
        }
      }catch{stopAccess();return;}
      const from = callAccess?.phone ?? msg.from ?? p.from ?? "";`);
 replace('            const caller = s.from_phone ? await getCaller(s.from_phone) : null;',`            const caller = s.from_phone && (!secureCall || callAccess?.status === "member") ? await getCaller(s.from_phone) : null;
            if(caller && callAccess?.nickname)caller.name=callAccess.nickname;`);
 // One WS operator lookup and one HTTP lookup have the same text; replace them separately.
 const lookup='const caller = from ? await getCaller(from) : null;';
 if(source.split(lookup).length!==3)throw Error('Caller lookup anchors changed');
 source=source.replace(lookup,`const caller = from && (!secureCall || callAccess?.status === "member") ? await getCaller(from) : null;
        if(caller && callAccess?.nickname)caller.name=callAccess.nickname;`);
 source=source.replace(lookup,`const caller = from && (!access || access.status === "member") ? await getCaller(from) : null;
    if(caller && access?.nickname)caller.name=access.nickname;`);
 replace('    if (!st) return;\n\n    if (msg.type === "prompt"',`    if (!st) return;
    if(secureCall){try {if(!callAccess || !await callGuard.permit(st.callSid,callAccess.relay_token)){stopAccess();return;}}catch{stopAccess();return;}}

    if (msg.type === "prompt"`);
 replace('  const get = (k: string) => String(form.get(k) ?? "");',`  const get = (k: string) => String(form.get(k) ?? "");
  let access: CallPermit | undefined;
  if(req.method === "POST" && ["","voice","outbound","transfer","calling-pin"].includes(seg)){
    try {
      if(await callGuard.enabled()){
        const existing = ["transfer","calling-pin"].includes(seg) ? await callGuard.get(get("CallSid")) : null;
        if(["transfer","calling-pin"].includes(seg) && !existing)return twimlRes(HANGUP);
        const kind=existing?.kind ?? (seg === "outbound" ? "outbound" : "inbound");
        if(kind === "lesson")return twimlRes(HANGUP);
        const context=existing?.context_id ?? (seg === "outbound" ? url.searchParams.get("sid") : null);
        const resume=kind === "outbound" ? BASE+"/outbound?token="+encodeURIComponent(TOKEN)+"&sid="+encodeURIComponent(context||"") : BASE+"/?token="+encodeURIComponent(TOKEN);
        const result=await callGuard.enter(req,new URLSearchParams(Array.from(form.entries(),([k,v])=>[k,String(v)])),{kind,context,callback:BASE+"/calling-pin?token="+encodeURIComponent(TOKEN),resume,answer:seg === "calling-pin"});
        if(result.response)return result.response;
        if(!result.access)return twimlRes(HANGUP);
        access=result.access;
      }
    }catch{return twimlRes(HANGUP);}
  }
  const secureRelay=(action:string,voice:string,greeting:string,params:Record<string,string>,preSay="")=>relayTwiml(action,voice,greeting,{...params,...(access?{callAccess:access.relay_token}:{})},preSay);`);
 // Only HTTP returns: leave the shared relay builder itself untouched.
 const count=source.split('return twimlRes(relayTwiml(').length-1;
 if(count!==4)throw Error('Relay return anchors changed');
 source=source.replaceAll('return twimlRes(relayTwiml(','return twimlRes(secureRelay(');
 replace('    if (from) {\n      const gift = await checkGift(from);','    if (from && (!access || access.status === "member")) {\n      const gift = await checkGift(from);');
 replace('    if (REQUIRE_SUBSCRIPTION && !admitted) {','    if (!access && REQUIRE_SUBSCRIPTION && !admitted) {');
 replace('    const preSay = isFirstCall ? PRECURTAIN : "";','    const preSay = access ? "" : (isFirstCall ? PRECURTAIN : "");');
 replace('    const first = caller?.name?.split(" ")[0];','    const first = access?.nickname || caller?.name?.split(" ")[0];');
 replace('    const firstName = (s.caller_name ?? "").split(" ")[0];','    const firstName = access?.nickname || (s.caller_name ?? "").split(" ")[0];');
 source=source.replaceAll('chat(st.system','chat(st.system + CALL_SECURITY_INSTRUCTIONS');
 if(/sk-ant-|const TOKEN = "(?!")/.test(source))throw Error('Embedded secret found in candidate');
 return source;
}
