import type { CallPlan, CallPlanInput } from './scheduled-calls';
export { DEFAULT_PREFERENCES, validatePreferences } from '../../../supabase/functions/_shared/member';
export type { MemberPreferences } from '../../../supabase/functions/_shared/member';
import type { MemberPreferences } from '../../../supabase/functions/_shared/member';
export type ScheduledHistory = { id:string;plan_id:string;topic:string;content_type:CallPlanInput['content_type'];voice:string;due_at:string;title:string|null;status:string;references:string[] };
export type DashboardData = { plans:CallPlan[];history:ScheduledHistory[];preferences:MemberPreferences;stats:{lessons_finished:number;calls_answered:number;last_activity_at:string|null} };
export type Capabilities = {ready:boolean;voice_ready:boolean;phone_ready:boolean};
export const deliveryLabels:Record<string,string>={lesson_finished:'Lesson finished',call_ended:'Call ended early',not_started:'Lesson not started',uncertain:'Delivery unconfirmed',busy:'Line was busy','no-answer':'Not answered',failed:'Could not deliver',missed:'Call missed',canceled:'Canceled',cancelled:'Canceled',completed:'Call completed'};
export function formatMoment(value:string,timezone?:string|null):string {
 const date=new Date(value);if(!Number.isFinite(date.getTime()))return 'Time unavailable';
 return new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short',...(timezone?{timeZone:timezone}:{})}).format(date);
}
export function nextPlan(plans:CallPlan[]):CallPlan|null {
 return plans.filter(plan=>plan.active&&plan.next_run_at).sort((a,b)=>Date.parse(a.next_run_at!)-Date.parse(b.next_run_at!))[0]||null;
}
export function planState(plan:CallPlan):'Scheduled'|'Paused'|'Delivery unconfirmed'|'Finished' {
 if(!plan.active)return 'Paused';
 if(plan.next_run_at)return 'Scheduled';
 if(plan.last_status==='uncertain')return 'Delivery unconfirmed';
 return 'Finished';
}
