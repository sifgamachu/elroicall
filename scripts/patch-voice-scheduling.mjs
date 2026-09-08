// Pure in-memory patch: the legacy deployed source contains secrets and must never be committed.
// Deployment retrieves the current native Edge source and applies this reviewed adapter.
export function patchVoiceScheduling(source){
 if(source.includes('PHONE_SCHEDULING_INSTRUCTIONS'))throw Error('Voice scheduling adapter is already installed');
 const replace=(before,after)=>{
  if(source.split(before).length!==2)throw Error('Voice source changed; review the patch anchor before deployment');
  source=source.replace(before,after);
 };
 // A safe redeployment requires these values in Functions Secrets first.
 // Never persist the legacy embedded credentials again, even in a native deployment.
 const token=source.match(/^const TOKEN = "[^"\n]+";$/m)?.[0];
 const anthropic=source.match(/^const ANTHROPIC_KEY = Deno\.env\.get\("ANTHROPIC_API_KEY"\) \?\? "[^"\n]+";$/m)?.[0];
 if(!token||!anthropic)throw Error('Credential configuration changed; review before deployment');
 replace(token,'const TOKEN = Deno.env.get("VOICE_ROUTE_TOKEN") ?? "";');
 replace(anthropic,'const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";');
 replace('if (url.searchParams.get("token") !== TOKEN) {','if (!TOKEN || url.searchParams.get("token") !== TOKEN) {');
 source='import { PHONE_SCHEDULING_INSTRUCTIONS, PHONE_SCHEDULING_TOOLS, phoneSchedulingTurn } from "./phone-scheduling.ts";\n'+source;
 replace('    handoffSent: boolean;','    handoffSent: boolean;\n    phoneDraft?: string;');
 replace('          ? [TRANSFER_TOOL, PRAYER_TOOL, SCHEDULE_TOOL, CHURCH_TOOL, END_TOOL]\n          : st.phase === "daily"\n            ? [SCHEDULE_TOOL, END_TOOL]\n            : [TRANSFER_TOOL, END_TOOL];',
 '          ? [TRANSFER_TOOL, PRAYER_TOOL, ...PHONE_SCHEDULING_TOOLS, CHURCH_TOOL, END_TOOL]\n          : st.phase === "daily"\n            ? [...PHONE_SCHEDULING_TOOLS, END_TOOL]\n            : [TRANSFER_TOOL, ...PHONE_SCHEDULING_TOOLS, END_TOOL];');
 replace('await chat(st.system, st.messages, tools, (t) => send(t, false))','await chat(st.system + PHONE_SCHEDULING_INSTRUCTIONS + "\\nCurrent UTC date and time: " + new Date().toISOString(), st.messages, tools, (t) => send(t, false))');
 const start=source.indexOf('        if (toolUse?.name === "schedule_calls" && st.from) {');
 const end=source.indexOf('        if (toolUse?.name === "church_code" && st.from)',start);
 if(start<0||end<0)throw Error('Legacy scheduling handler anchor missing');
 source=source.slice(0,start)+`        if (toolUse && PHONE_SCHEDULING_TOOLS.some(tool => tool.name === toolUse.name)) {
          const speech = await phoneSchedulingTurn(SB_URL, SB_KEY, st.callSid, st, toolUse.name, toolUse.input);
          send(speech, true);
          st.messages.push({ role: "assistant", content: speech });
        }

`+source.slice(end);
 return source;
}
