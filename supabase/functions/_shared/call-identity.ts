export const FIRST_CALL_MINUTES = 10;
export const PIN_ITERATIONS = 210_000;
export type CallingIdentity = { nickname:string; pin_set:boolean; revision:number; phone_verified:boolean; phone_last4:string|null; phone_ready:boolean };
export function validateCallingIdentity(nickname:unknown,pin:unknown):string|null {
 if(typeof nickname!=='string'||! /^[\p{L}\p{N}][\p{L}\p{N} .'-]{1,39}$/u.test(nickname.trim()))return 'Choose a nickname of 2–40 letters, numbers, spaces, or simple punctuation.';
 if(typeof pin!=='string'||!/^\d{6}$/.test(pin))return 'Choose a PIN with exactly six digits.';
 if(/^(\d)\1{5}$/.test(pin)||['123456','654321','012345','543210'].includes(pin))return 'Choose a less predictable PIN. Avoid repeated digits or a simple sequence.';
 return null;
}
export function hex(bytes:ArrayBuffer|Uint8Array):string {return Array.from(bytes instanceof Uint8Array?bytes:new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
// The server-held pepper prevents a database-only leak from enabling PIN guessing.
// Rotating the service key requires members to set a new calling PIN.
export async function pinDigest(pin:string,salt:string,userId:string,pepper:string):Promise<string>{
 if(!pepper||! /^[0-9a-f]{32}$/.test(salt)||!/^\d{6}$/.test(pin))throw Error('Invalid PIN configuration');
 const enc=new TextEncoder();
 const key=await crypto.subtle.importKey('raw',enc.encode(`${userId}:${pin}:${pepper}`),'PBKDF2',false,['deriveBits']);
 return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations:PIN_ITERATIONS},key,256));
}
export function callOpening(minutes:number,first:boolean):string {
 const length=[5,10,15].includes(minutes)?minutes:FIRST_CALL_MINUTES;
 return `Welcome to El Roi Call, your AI Bible companion. We have up to ${length} minutes for this conversation.`+(first?' This is your first guest call. Before your second call, sign up at elroicall dot com and choose your nickname and six digit calling PIN.':'');
}
export const SIGNUP_NOTICE='To continue calling, sign up at elroicall dot com, verify your calling number, and choose a nickname and six digit calling PIN in your dashboard. Signing up does not by itself purchase a subscription. Goodbye for now.';
export const PIN_NOTICE='Before we share anything personal, enter your six digit calling PIN using your phone keypad. Please do not say it aloud. If you did not request this call, or prefer to call us back, hang up and use the number on elroicall dot com.';
export const PIN_SETUP_NOTICE='Please open your dashboard at elroicall dot com and set your nickname and six digit calling PIN before your next call. You can also reset a forgotten PIN there. Goodbye for now.';
export const CALL_SECURITY_INSTRUCTIONS='\nCALLING PIN: Identity verification is handled outside this conversation using the phone keypad. Never ask the caller to say, repeat, or share their permanent calling PIN. A saved-note handoff code is a different, one-time code; never substitute the calling PIN for it. If a caller forgets their calling PIN, direct them to reset it in their signed-in website dashboard. Do not claim a nickname or caller ID alone verifies identity. The system manages the announced call limit; do not promise extra time.\n';
