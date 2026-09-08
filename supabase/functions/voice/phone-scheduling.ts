// Additive adapter for the existing ConversationRelay service. No provider keys live here.
export const PHONE_SCHEDULING_INSTRUCTIONS = `
PHONE SCHEDULING: These instructions replace all older Daily Well scheduling instructions.
When someone wants a future call, first use check_bible_call_scheduling to check availability before collecting details. When available, help them choose: Bible study, sermon, Bible lecture, biblical story, or Bible facts; their own topic or passage; Marin, Cedar, Coral, or Onyx AI voice; a 5, 10, or 15 minute length; exact local time including AM/PM; their city/time zone; first calendar date; and once or selected weekly days. Daily means all seven days. Ask short questions for missing choices; do not silently choose a topic, voice, date, or time zone. Voice choices are narrator names, not biblical figures or imitations. Use the current date below to resolve relative dates, and confirm the exact date aloud. Phone bookings require at least forty minutes of notice.
Use prepare_bible_call to review the plan. You must read its returned speech verbatim, then wait for the caller to agree to the details AND one automated confirmation callback. Only then use confirm_bible_call with consent true. Never say a lesson is booked, saved, or will arrive based on these tools: the recipient must hang up, answer the verification callback, hear the plan, and press 1 to save it. The server response is authoritative. If unavailable, say so clearly and continue the present conversation.
Use stop_scheduled_calls only when asked to stop ALL future calls; ask if an ambiguous request means all. This prepares the same readback and callback confirmation. For one specific schedule, direct the caller to their dashboard or press 9 during that lesson. Never claim a cancellation succeeded before the callback confirmation. No legacy schedule_calls creation or cancellation is available.
Scheduling adds to the current conversation service. Do not force people to schedule when they want to talk now.
`;
const planProperties={
  content_type:{type:'string',enum:['bible_study','sermon','lecture','story','bible_facts']},
  topic:{type:'string',description:'The caller’s chosen Bible topic or passage, 1 to 160 characters.'},
  voice:{type:'string',enum:['marin','cedar','coral','onyx']},
  local_time:{type:'string',description:'Exact 24-hour HH:MM. Clarify AM or PM.'},
  timezone:{type:'string',description:'IANA time zone confirmed from the caller’s city, such as America/New_York. Never infer from a phone area code.'},
  start_date:{type:'string',description:'First date YYYY-MM-DD, confirmed with caller.'},
  recurrence:{type:'string',enum:['once','weekly']},
  weekdays:{type:'array',items:{type:'integer',minimum:0,maximum:6},description:'0 Sunday through 6 Saturday. Empty for once; all seven for daily.'},
  duration_minutes:{type:'integer',enum:[5,10,15]},
};
export const PHONE_SCHEDULING_TOOLS=[
  {name:'check_bible_call_scheduling',description:'Check whether phone scheduling is accepting bookings before asking for choices.',input_schema:{type:'object',additionalProperties:false,properties:{}}},
  {name:'prepare_bible_call',description:'Prepare and read back the caller’s chosen learning schedule. Does not save it. Collect every choice first. Do not announce a booking before or after this tool.',input_schema:{type:'object',additionalProperties:false,properties:planProperties,required:Object.keys(planProperties)}},
  {name:'confirm_bible_call',description:'Request one verification callback ONLY after reading the latest server readback and the caller explicitly agrees to the details and that callback. The schedule is not yet saved.',input_schema:{type:'object',additionalProperties:false,properties:{consent:{type:'boolean',const:true}},required:['consent']}},
  {name:'stop_scheduled_calls',description:'Prepare a request to stop ALL future scheduled calls to the caller’s number. Read back and obtain callback consent before confirm_bible_call. Does not stop calls immediately.',input_schema:{type:'object',additionalProperties:false,properties:{}}},
];
export type PhoneBookingState={phoneDraft?:string;phoneBookingBusy?:boolean};
export async function phoneSchedulingTurn(base:string,key:string,callSid:string,state:PhoneBookingState,name:string,input:unknown,client:typeof fetch=fetch):Promise<string>{
  if(state.phoneBookingBusy)return 'Please give me a moment to finish checking your last request.';
  state.phoneBookingBusy=true;
  const confirming=name==='confirm_bible_call';
  if(confirming&&!state.phoneDraft){state.phoneBookingBusy=false;return 'Let’s review your exact choices first. Nothing has been scheduled.';}
  const body=confirming?{call_sid:callSid,draft_id:state.phoneDraft,consent:(input as {consent?:unknown})?.consent===true}:{call_sid:callSid,action:name==='stop_scheduled_calls'?'pause_all':'book',plan:input};
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),25000);
  try{
    if(name==='check_bible_call_scheduling'){
      const r=await client(`${base}/functions/v1/phone-scheduling/capabilities`,{signal:controller.signal});
      const capabilities=await r.json();
      return r.ok&&capabilities.ready===true?'Phone scheduling is available. What would you like: a Bible study, sermon, lecture, biblical story, or Bible facts?':'Scheduled learning calls are not accepting bookings yet. You can still call El Roi anytime for a conversation.';
    }
    const r=await client(`${base}/functions/v1/phone-scheduling/${confirming?'confirm':'draft'}`,{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
    const result=await r.json();
    if(!r.ok)return typeof result.error==='string'?result.error:'Scheduling is temporarily unavailable. Nothing has been scheduled.';
    if(!confirming&&typeof result.draft_id==='string')state.phoneDraft=result.draft_id;
    return typeof result.speech==='string'?result.speech:'I could not confirm your request. Please try again.';
  }catch{return 'I could not confirm that the request went through. No lesson is confirmed unless you answer a verification call and press 1 after hearing the details.';}
  finally{clearTimeout(timeout);state.phoneBookingBusy=false;}
}
