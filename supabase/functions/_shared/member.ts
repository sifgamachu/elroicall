import { CONTENT_TYPES, VOICES, validTimezone, type ContentType, type Voice } from './scheduling.ts';
export type MemberPreferences = {
 display_name: string; timezone: string | null; default_voice: Voice | null;
 default_content_type: ContentType | null; duration_minutes: number;
};
export const DEFAULT_PREFERENCES: MemberPreferences = { display_name:'',timezone:null,default_voice:null,default_content_type:null,duration_minutes:10 };
export function validatePreferences(value: unknown): string | null {
 if(!value||typeof value!=='object') return 'Choose your preferences.';
 const p=value as MemberPreferences;
 if(typeof p.display_name!=='string'||p.display_name.trim().length>60) return 'Use a name of up to 60 characters.';
 if(p.timezone!==null&&(typeof p.timezone!=='string'||!validTimezone(p.timezone))) return 'Choose a valid time zone.';
 if(p.default_voice!==null&&!VOICES.some(v=>v.id===p.default_voice)) return 'Choose an available voice.';
 if(p.default_content_type!==null&&!CONTENT_TYPES.some(v=>v.id===p.default_content_type)) return 'Choose a call format.';
 if(![5,10,15].includes(p.duration_minutes)) return 'Choose a 5, 10 or 15 minute call.';
 return null;
}
export function publicPreferences(value: MemberPreferences): MemberPreferences {
 return {display_name:value.display_name.trim(),timezone:value.timezone,default_voice:value.default_voice,default_content_type:value.default_content_type,duration_minutes:value.duration_minutes};
}
export async function sha256(value:string):Promise<string> {
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
 return Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');
}
