// Apply AFTER patchVoiceScheduling, which removes the legacy embedded credentials.
export function patchVoiceContinuity(source){
 if(!source.includes('PHONE_SCHEDULING_INSTRUCTIONS'))throw Error('Apply the secure scheduling adapter first');
 if(source.includes('CONTINUITY_INSTRUCTIONS'))throw Error('Continuity already installed');
 const replace=(before,after)=>{if(source.split(before).length!==2)throw Error('Voice source changed; review the continuation anchor');source=source.replace(before,after);};
 source='import { CONTINUITY_INSTRUCTIONS, CONTINUITY_TOOLS, useSavedNote, savedNoteContext } from "./continuity.ts";\n'+source;
 replace('    phoneDraft?: string;','    phoneDraft?: string;\n    continuityId?: string;');
 replace('        const tools = st.phase === "operator"','        const tools: unknown[] = st.phase === "operator"');
 replace('        const { text, toolUse } = await chat(st.system + PHONE_SCHEDULING_INSTRUCTIONS + "\\nCurrent UTC date and time: " + new Date().toISOString(), st.messages, tools, (t) => send(t, false));',
 '        tools.push(...CONTINUITY_TOOLS);\n        const memoryContext = await savedNoteContext(SB_URL, SB_KEY, st.callSid, st);\n        const { text, toolUse } = await chat(st.system + PHONE_SCHEDULING_INSTRUCTIONS + CONTINUITY_INSTRUCTIONS + memoryContext + "\\nCurrent UTC date and time: " + new Date().toISOString(), st.messages, tools, (t) => send(t, false));');
 replace('        if (toolUse?.name === "prayer_request") {',`        if (toolUse?.name === "use_saved_note") {
          // The spoken one-time code must not be copied into stored session messages.
          const lastUser = st.messages.findLast(item => item.role === "user");
          if (lastUser) lastUser.content = "[The caller provided a one-time saved-note code.]";
          const speech = await useSavedNote(SB_URL, SB_KEY, st.callSid, st, toolUse.input);
          send(speech, true);
          st.messages.push({ role: "assistant", content: speech });
        }

        if (toolUse?.name === "prayer_request") {`);
 return source;
}
