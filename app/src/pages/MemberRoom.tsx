import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import type { Session } from '@supabase/supabase-js';
import { ArrowLeft, ArrowUpRight, BookOpen, CalendarClock, Check, Gift, Headphones, History, LayoutDashboard, LoaderCircle, LogOut, Mail, NotebookPen, Pause, Phone, Plus, RefreshCw, Settings2, ShieldCheck } from 'lucide-react';
import Brand from '@/components/Brand';
import MemberControls from '@/components/MemberControls';
import AccountSignIn from '@/components/AccountSignIn';
import AccountPasswordSettings from '@/components/AccountPasswordSettings';
import PhoneSignInSettings from '@/components/PhoneSignInSettings';
import DashboardPreferences from '@/components/DashboardPreferences';
import SavedNotes from '@/components/SavedNotes';
import CallingIdentity from '@/components/CallingIdentity';
import { useDraft } from '@/lib/draft';
import { continuationDraft } from '@/lib/continuity';
import { supabase } from '@/lib/supabase';
import { authLinkError } from '@/lib/account-auth';
import { watchAccountSession } from '@/lib/account-session';
import { getPortalMember, portalRequest, type PortalMember } from '@/lib/portal';
import { CONTENT_TYPES, journeyName, planLabel, schedulingRequest, VOICES, type CallPlan } from '@/lib/scheduled-calls';
import { deliveryLabels, formatMoment, nextPlan, planState, type Capabilities, type DashboardData } from '@/lib/dashboard';
import { clearScheduleDraft } from '@/lib/schedule-draft';
import { PHONE_DISPLAY, PHONE_TEL } from '@/lib/phone';
import '@/dashboard.css';
import '@/account-flow.css';

const tabs = [{id:'overview',name:'Overview',icon:LayoutDashboard},{id:'schedules',name:'Scheduled calls',icon:CalendarClock},{id:'notes',name:'Saved notes',icon:NotebookPen},{id:'history',name:'Call history',icon:History},{id:'settings',name:'Preferences',icon:Settings2}];
const modeNames:Record<string,string>={journey:'The Journey',sermon:'The Pulpit Walk',inspiration:'Daily Check-In',random:'Surprise Me'};
const contentName=(id:string)=>CONTENT_TYPES.find(type=>type.id===id)?.name||'Scripture call';
const voiceName=(id:string)=>VOICES.find(voice=>voice.id===id)?.name||id;
type HistoryEntry={id:string;planId:string|null;date:string;title:string;summary:string;status:string;references:string[];kind:'conversation'|'scheduled';journey:string|null;session:number|null;takeaway:{truth:string;action:string;prayer:string}|null};
const descriptions:Record<string,string>={overview:'Your next call, recent activity, and the next useful step.',schedules:'Manage future calls here. Past call outcomes belong in Call history.',notes:'Keep and revisit the reflections you choose to save.',history:'See what happened on past calls, including missed or unconfirmed deliveries.',settings:'Manage website access, your calling number and PIN, and defaults for new schedules.'};

export default function MemberRoom(){
  const navigate=useNavigate();const location=useLocation();const {setPrivateDraft}=useDraft();
  const query=new URLSearchParams(location.search);const requested=query.get('view');
  const view=['#calling-preferences','#calling-identity','#website-password'].includes(location.hash)?'settings':tabs.some(tab=>tab.id===requested)?requested!:'overview';
  const historyPlan=query.get('plan');
  const [session,setSession]=useState<Session|null>(null);const [authLoading,setAuthLoading]=useState(true);
  const [member,setMember]=useState<PortalMember|null>(null);const [data,setData]=useState<DashboardData|null>(null);const [caps,setCaps]=useState<Capabilities|null>(null);
  const [loading,setLoading]=useState(true);const [memberError,setMemberError]=useState('');const [dataError,setDataError]=useState('');
  const [notice,setNotice]=useState('');const [actionError,setActionError]=useState(()=>authLinkError(window.location.href));
  const [busy,setBusy]=useState('');const [pendingPause,setPendingPause]=useState('');
  const sequence=useRef(0);const accountId=useRef<string|null>(null);const acting=useRef(false);
  useEffect(()=>{
    const generation=sequence;
    const stop=watchAccountSession(supabase.auth,(next,accountChanged)=>{
      const owner=next?.user.id||null;
      if(accountChanged){
        if(accountId.current && accountId.current!==owner){try{clearScheduleDraft(window.localStorage);}catch{/* Storage may be blocked. */}}
        sequence.current++;setMember(null);setData(null);setCaps(null);setMemberError('');setDataError('');setNotice('');setBusy('');setPendingPause('');setLoading(Boolean(next));
      }
      accountId.current=owner;setSession(next);setAuthLoading(false);if(next)setActionError('');
    },()=>{setAuthLoading(false);setActionError('We could not restore your session. Sign in again to continue.');});
    return()=>{generation.current++;stop();};
  },[]);
  const refresh=useCallback(async()=>{
    if(!session || accountId.current!==session.user.id)return;
    const current=++sequence.current;const owner=session.user.id;
    const results=await Promise.allSettled([getPortalMember(session),schedulingRequest<DashboardData>('/dashboard',session),schedulingRequest<Capabilities>('/capabilities')]);
    if(current!==sequence.current || accountId.current!==owner)return;
    const [account,dashboard,capabilities]=results;
    if(account.status==='fulfilled'){setMember(account.value);setMemberError('');}else setMemberError('Calling details and on-demand history could not be refreshed.');
    if(dashboard.status==='fulfilled'){setData(dashboard.value);setDataError('');}else setDataError('Schedules, call outcomes, and preferences could not be refreshed.');
    setCaps(capabilities.status==='fulfilled'?capabilities.value:null);setLoading(false);
  },[session]);
  useEffect(()=>{const generation=sequence;let active=true;queueMicrotask(()=>{if(active)void refresh();});return()=>{active=false;generation.current++;};},[refresh]);
  useEffect(()=>{if(view==='settings' && location.hash)document.getElementById(location.hash.slice(1))?.scrollIntoView({block:'start'});},[view,location.hash,member,data]);
  async function signOut(){
    if(acting.current)return;acting.current=true;setBusy('signout');setActionError('');
    try{const result=await supabase.auth.signOut({scope:'local'});if(result.error)throw result.error;try{clearScheduleDraft(window.localStorage);}catch{/* Optional browser storage. */}}
    catch{setActionError('Sign out did not complete. Please try again.');}
    finally{acting.current=false;setBusy('');}
  }
  async function pausePlan(plan:CallPlan){
    if(!session || acting.current)return;const owner=session.user.id;acting.current=true;setBusy(plan.id);setActionError('');setNotice('');
    try{await schedulingRequest(`/plans/${plan.id}/pause`,session,{});if(accountId.current!==owner)return;setPendingPause('');setNotice('Future calls for this plan are paused. A call already ringing may still arrive.');await refresh();}
    catch{if(accountId.current===owner)setActionError('We could not confirm the pause. Refresh and check the plan before trying again.');}
    finally{acting.current=false;if(accountId.current===owner)setBusy('');}
  }
  async function pauseLegacy(mode:string){
    if(!session || acting.current)return;const owner=session.user.id;acting.current=true;setBusy(mode);setActionError('');
    try{const result=await portalRequest('/cancel',session,{mode});if(result.status!==200)throw Error('Pause unconfirmed');if(accountId.current!==owner)return;setPendingPause('');setNotice(`${modeNames[mode]||'Your earlier schedule'} is paused.`);await refresh();}
    catch{if(accountId.current===owner)setActionError('The pause was not confirmed. Refresh your schedules before trying again.');}
    finally{acting.current=false;if(accountId.current===owner)setBusy('');}
  }
  function continueHistory(entry:HistoryEntry){
    if(!session)return;
    const body=entry.takeaway?`Truth: ${entry.takeaway.truth}\nNext step: ${entry.takeaway.action}\nPrayer: ${entry.takeaway.prayer}`:entry.summary;
    setPrivateDraft(continuationDraft({title:entry.title.slice(0,80),body:body.slice(0,1200)}),session.user.id);navigate('/begin/');
  }
  if(authLoading)return <div className="elroi-site dash-auth-loading" role="status"><LoaderCircle className="animate-spin" size={26}/><p>Opening your dashboard…</p></div>;
  if(!session)return <DashboardSignIn initialError={actionError}/>;
  const plans=data?.plans||[];const upcoming=plans.filter(plan=>planState(plan)==='Scheduled');const next=nextPlan(plans);
  const legacy=(member?.schedules||[]).filter(track=>track.active);
  const name=data?.preferences.display_name||member?.caller_name||'';const firstName=name.trim().split(/\s+/)[0];const zone=data?.preferences.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone;
  const history:HistoryEntry[]=[...(member?.history||[]).map((item,index)=>({id:`call-${item.id||index}`,planId:null,date:item.created_at||'',title:item.figure_name?`A conversation through ${item.figure_name}`:'Your conversation with El Roi',summary:item.summary||'',status:'On demand',references:[] as string[],kind:'conversation' as const,journey:null,session:null,takeaway:null})),...(data?.history||[]).map(item=>({id:item.id,planId:item.plan_id,date:item.due_at,title:item.title||item.topic,summary:`${journeyName(item.journey_slug)||contentName(item.content_type)} · ${voiceName(item.voice)}`,status:deliveryLabels[item.status]||item.status,references:item.references,kind:'scheduled' as const,journey:journeyName(item.journey_slug),session:item.session_number,takeaway:item.takeaway}))].sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
  const shownHistory=historyPlan?history.filter(item=>item.planId===historyPlan):history;
  const groups=[{title:'Upcoming calls',items:upcoming,open:true},{title:'Paused plans',items:plans.filter(plan=>planState(plan)==='Paused'),open:false},{title:'Finished or needing review',items:plans.filter(plan=>!['Scheduled','Paused'].includes(planState(plan))),open:false}];
  function planCard(plan:CallPlan){return <article key={plan.id} className="dash-plan"><div className="dash-plan-top"><span className="elroi-icon-tile"><BookOpen size={22}/></span><span className="dash-tag" data-active={planState(plan)==='Scheduled'}>{planState(plan)}</span></div><h3>{journeyName(plan.journey_slug)||contentName(plan.content_type)}</h3><p className="dash-plan-topic">{plan.topic}</p><dl><div><dt>When</dt><dd>{plan.local_time.slice(0,5)} · {plan.journey_slug?'Daily, seven calls':planLabel(plan)}</dd></div><div><dt>Time zone</dt><dd>{plan.timezone.replaceAll('_',' ')}</dd></div><div><dt>Voice & length</dt><dd>{voiceName(plan.voice)} · about {plan.duration_minutes} min</dd></div><div><dt>Calling</dt><dd>Number ending in {plan.phone_last4}</dd></div></dl>{plan.journey_slug&&<p className="dash-help">{plan.journey_completed||0} of {plan.journey_total||7} lessons finished.</p>}{plan.next_run_at&&<p className="dash-plan-next"><CalendarClock size={15}/>Next: {formatMoment(plan.next_run_at,plan.timezone)}</p>}{plan.last_status&&<p className="dash-help">Last call: {deliveryLabels[plan.last_status]||plan.last_status}</p>}<div className="dash-plan-actions">{plan.active&&plan.next_run_at?<button type="button" className="elroi-text-link" disabled={Boolean(busy)} onClick={()=>setPendingPause(plan.id)}><Pause size={16}/>Pause future calls</button>:<Link className="elroi-text-link" to={`/schedule/?from=${encodeURIComponent(plan.id)}`}>Use these choices for a new schedule <ArrowUpRight size={16}/></Link>}<Link className="elroi-text-link" to={`/account/?view=history&plan=${encodeURIComponent(plan.id)}`}>This plan’s call history</Link></div>{pendingPause===plan.id&&<div className="flow-pause-confirm"><p>Pause future calls for this plan? This does not recall a call already ringing.</p><button type="button" className="elroi-button elroi-button-secondary" disabled={Boolean(busy)} onClick={()=>void pausePlan(plan)}>{busy===plan.id?'Pausing…':'Confirm pause'}</button><button type="button" className="elroi-text-link" disabled={Boolean(busy)} onClick={()=>setPendingPause('')}>Keep scheduled</button></div>}</article>;}
  return <div className="elroi-site dash-layout">
    <a className="elroi-skip" href="#main-content">Skip to dashboard</a>
    <aside className="dash-sidebar"><Brand/><p className="dash-sidebar-label">YOUR SPACE</p><nav aria-label="Dashboard navigation">{tabs.map(tab=><Link key={tab.id} to={`/account/?view=${tab.id}`} aria-current={view===tab.id?'page':undefined}><tab.icon size={19}/>{tab.name}{tab.id==='schedules'&&upcoming.length>0&&<span>{upcoming.length}</span>}</Link>)}</nav><div className="dash-sidebar-bottom"><div className="dash-sidebar-note"><Headphones size={24}/><strong>A little space for you.</strong><p>You can call whenever something is on your heart.</p><a href={PHONE_TEL}>Call El Roi <ArrowUpRight size={15}/></a></div><Link to="/explore/"><BookOpen size={16}/>Explore Scripture</Link><Link to="/watch/">Watch El Roi Calls <ArrowUpRight size={16}/></Link><Link to="/"><ArrowLeft size={16}/>Back to website</Link><button type="button" disabled={Boolean(busy)} onClick={()=>void signOut()}><LogOut size={16}/>{busy==='signout'?'Signing out…':'Sign out'}</button></div></aside>
    <div className="dash-workspace"><header className="dash-topbar"><div><span>My dashboard</span><span className="dash-topbar-divider">/</span><strong>{tabs.find(tab=>tab.id===view)?.name}</strong></div><div className="dash-topbar-actions"><button type="button" className="dash-refresh" disabled={loading||Boolean(busy)} onClick={()=>void refresh()} aria-label="Refresh dashboard"><RefreshCw size={18} className={loading?'animate-spin':''}/></button><Link to="/schedule/" className="elroi-button elroi-button-primary"><Plus size={17}/><span>Schedule a call</span></Link><Link to="/account/?view=settings" className="dash-avatar" aria-label="Account preferences">{(firstName||session.user.email||'E').slice(0,1).toUpperCase()}</Link></div></header>
    <main id="main-content" className="dash-main"><div className="dash-page-heading"><div><p className="elroi-kicker">YOUR EL ROI SPACE</p><h1>{view==='overview'?(firstName?`Welcome back, ${firstName}.`:'Make yourself at home.'):tabs.find(tab=>tab.id===view)?.name}</h1><p>{descriptions[view]}</p></div></div>
      {(memberError||dataError)&&<div className="dash-error-box" role="alert"><p>{memberError} {dataError} {member||data?'Previously loaded details may be out of date.':''}</p><button type="button" className="elroi-text-link" disabled={loading} onClick={()=>void refresh()}>Try again <RefreshCw size={15}/></button></div>}
      {notice&&<p className="dash-banner" role="status"><Check size={18}/>{notice}</p>}{actionError&&<p className="dash-error-box" role="alert">{actionError}</p>}
      {loading&&!member&&!data&&<div className="dash-loading" role="status"><LoaderCircle size={22} className="animate-spin"/>Loading your private space…</div>}
      {caps&&!caps.ready&&<p className="dash-service-note">Scheduled calling is unavailable right now. Existing records remain visible; the planner will not confirm a new call while the service is unavailable.</p>}
      {view==='overview'&&<>
        <section className="dash-welcome-grid"><article className="dash-moment"><div className="dash-moment-orbit" aria-hidden="true"><span/><span/><Headphones/></div><p className="dash-light-kicker">{next?'YOUR NEXT SCHEDULED CALL':'CALL WHEN YOU NEED TO'}</p><h2>{next?(journeyName(next.journey_slug)||contentName(next.content_type)):'Come as you are.'}</h2><p>{next?next.topic:'Start a conversation now, or choose a time for a Scripture call.'}</p>{next&&<div className="dash-next-time"><CalendarClock size={18}/><span>{formatMoment(next.next_run_at!,next.timezone)}<small>{next.timezone.replaceAll('_',' ')} · {voiceName(next.voice)} · about {next.duration_minutes} min</small></span></div>}<div className="dash-moment-actions"><a href={PHONE_TEL} className="elroi-button elroi-button-white"><Phone size={17}/>Call now</a><Link to={next?'/account/?view=schedules':'/schedule/'}>{next?'Manage my calls':'Schedule a call'}<ArrowUpRight size={17}/></Link></div><span className="dash-moment-number">{PHONE_DISPLAY} · Your on-demand line</span></article><article className="dash-scripture"><span className="elroi-icon-tile"><BookOpen size={23}/></span><p className="elroi-kicker">A MOMENT IN SCRIPTURE</p><blockquote>“Be still, and know that I am God.”</blockquote><p>Psalm 46:10 · King James Version</p><Link to="/explore/">Read a free reflection <ArrowUpRight size={16}/></Link></article></section>
        {member&&!member.phone_verified&&<div className="dash-setup"><span className="elroi-icon-tile"><ShieldCheck size={23}/></span><div><h2>Connect your calling number.</h2><p>Verify it once to receive scheduled calls. You can do this inside the planner or in Preferences.</p></div><Link className="elroi-button elroi-button-dark" to="/account/?view=settings#calling-preferences">Verify my number</Link></div>}
        <section className="dash-metrics" aria-label="Your activity"><Metric icon={Phone} value={member?String(member.total_calls||0):'—'} label="On-demand conversations"/><Metric icon={CalendarClock} value={data?String(upcoming.length):'—'} label="Upcoming call plans"/><Metric icon={BookOpen} value={data?String(data.stats.lessons_finished):'—'} label="Lessons finished"/></section>
        <section className="dash-card"><SectionHeading title="Recent calls" action={<Link to="/account/?view=history" className="elroi-text-link">View all history <ArrowUpRight size={16}/></Link>}/>{history.length?<HistoryList entries={history.slice(0,3)} zone={zone} onContinue={continueHistory}/>:<p className="dash-help">{loading?'Loading call history…':memberError||dataError?'Some call history is unavailable. Use Try again above.':'Your completed, missed, and other call outcomes will appear here after a call.'}</p>}</section>
        <div className="flow-overview-links"><Link to="/account/?view=notes" className="dash-card"><NotebookPen size={23}/><h2>Saved notes</h2><p>Return to reflections you chose to keep.</p></Link><Link to="/account/?view=settings#website-password" className="dash-card"><Settings2 size={23}/><h2>Account & preferences</h2><p>Manage website sign-in, your calling number, and call defaults.</p></Link></div>
      </>}
      {view==='schedules'&&<>
        <section className="dash-card"><SectionHeading title="Your call plans" action={<Link to="/schedule/" className="elroi-button elroi-button-primary"><Plus size={17}/>New schedule</Link>}/><p className="dash-help">Pausing stops future calls for that plan. “Use these choices” creates a new plan; it does not silently resume or edit the old one.</p>{!data?<p role="status">{dataError?'Schedules are unavailable. Try refreshing.':'Loading schedules…'}</p>:<>{!upcoming.length&&<p className="dash-help">No upcoming call plans. Create one above or reuse a paused plan below.</p>}{groups.filter(group=>group.items.length).map(group=><details className="flow-plan-group" open={group.open} key={group.title}><summary>{group.title} <span>{group.items.length}</span></summary><div className="dash-plan-grid">{group.items.map(planCard)}</div></details>)}</>}</section>
        {legacy.length>0&&<section className="dash-card"><SectionHeading title="Earlier recurring calls"/><p className="dash-help">These earlier schedules are still active and run separately from your newer call plans.</p><div className="dash-legacy-list">{legacy.map(track=><div key={track.mode}><div><h3>{modeNames[track.mode]||track.mode}</h3><p>{String(track.hour_local||0).padStart(2,'0')}:{String(track.minute_local||0).padStart(2,'0')} · {track.days} · {track.tz?.replaceAll('_',' ')}</p>{track.progress?.next&&<p>Next passage: {track.progress.next}</p>}</div>{pendingPause===`earlier:${track.mode}`?<div><button type="button" className="elroi-text-link" disabled={Boolean(busy)} onClick={()=>void pauseLegacy(track.mode)}>Confirm pause</button><button type="button" className="elroi-text-link" disabled={Boolean(busy)} onClick={()=>setPendingPause('')}>Keep scheduled</button></div>:<button type="button" className="elroi-text-link" disabled={Boolean(busy)} onClick={()=>setPendingPause(`earlier:${track.mode}`)}><Pause size={15}/>Pause</button>}</div>)}</div></section>}
      </>}
      {view==='notes'&&<SavedNotes key={session.user.id} session={session}/>}
      {view==='history'&&<section className="dash-card"><SectionHeading title={historyPlan?'History for this call plan':'Your call history'} action={historyPlan?<Link to="/account/?view=history" className="elroi-text-link">Show all calls</Link>:undefined}/><p className="dash-help">Shown in {zone.replaceAll('_',' ')}. A call ending does not prove the lesson was heard in full. “Delivery unconfirmed” is not counted as successful delivery.</p>{shownHistory.length?<HistoryList entries={shownHistory} zone={zone} onContinue={continueHistory}/>:<p className="dash-help">{loading?'Loading history…':memberError||dataError?'Some history is unavailable. Refresh before treating this as an empty history.':historyPlan?'No past calls are recorded for this plan yet.':'No past calls are recorded here yet.'}</p>}</section>}
      {view==='settings'&&<>
        <nav className="flow-settings-nav" aria-label="Preference sections"><a href="#website-password">Website access</a><a href="#calling-preferences">Calling number</a><a href="#calling-identity">Nickname & PIN</a><a href="#call-defaults">Call defaults</a></nav>
        <div className="dash-settings-grid"><div className="dash-form-stack"><AccountPasswordSettings key={session.user.id} session={session}/><CallingIdentity key={session.user.id} session={session}/></div><div className="dash-form-stack">{member?<MemberControls key={`${session.user.id}-${member.phone}-${member.phone_verified}`} session={session} member={member} onRefresh={refresh}/>:<section className="dash-card" id="calling-preferences"><h2>Calling number</h2><p>{memberError||'Loading your calling number…'}</p><button type="button" className="elroi-text-link" disabled={loading} onClick={()=>void refresh()}>Try again</button></section>}<section id="call-defaults"><p className="dash-help">Your dashboard display name is separate from the nickname you hear on phone calls. Defaults apply only to new schedules.</p>{data?<DashboardPreferences key={`${session.user.id}-${JSON.stringify(data.preferences)}`} session={session} initial={data.preferences} voiceReady={caps?.voice_ready===true} onSaved={async()=>{await refresh();setNotice('Call defaults saved. Existing schedules are unchanged.');}}/>:<p className="dash-help">{dataError||'Loading your call defaults…'}</p>}</section><details className="flow-details dash-card"><summary>Optional text-message sign-in</summary><p className="dash-help">This is an optional way to open your website account. It is separate from the verified number used to receive calls.</p><PhoneSignInSettings key={session.user.id} session={session}/></details><section className="dash-card"><SectionHeading title="Your account"/><p className="dash-account-email"><Mail size={17}/>{session.user.email||'Phone sign-in account'}</p><div className="dash-account-links"><Link to="/privacy/">Privacy policy</Link><Link to="/terms/">Terms</Link></div><button type="button" className="elroi-text-link" disabled={Boolean(busy)} onClick={()=>void signOut()}><LogOut size={16}/><span>Sign out of this device</span></button></section></div></div>
      </>}
      <footer className="dash-footer"><span><ShieldCheck size={15}/>Your private El Roi space.</span><Link to="/gift/"><Gift size={15}/>Gift a conversation</Link><a href={PHONE_TEL}>{PHONE_DISPLAY}</a></footer>
    </main></div>
  </div>;
}
function Metric({icon:Icon,value,label}:{icon:typeof Phone;value:string;label:string}){return <article className="dash-metric"><span className="elroi-icon-tile"><Icon size={21}/></span><div><strong>{value}</strong><p>{label}</p></div></article>;}
function SectionHeading({title,action}:{title:string;action?:React.ReactNode}){return <div className="dash-section-heading"><h2>{title}</h2>{action}</div>;}
function HistoryList({entries,zone,onContinue}:{entries:HistoryEntry[];zone:string;onContinue:(entry:HistoryEntry)=>void}){return <div className="dash-history-list">{entries.map(item=><details key={item.id}><summary><span className="elroi-icon-tile">{item.kind==='scheduled'?<BookOpen size={21}/>:<Phone size={21}/>}</span><span className="dash-history-title"><strong>{item.title}</strong><span>{item.journey&&item.session?`${item.journey} · Call ${item.session} · `:''}{formatMoment(item.date,zone)}</span></span><span className="dash-tag">{item.status}</span><Plus size={17} className="dash-details-plus"/></summary><div className="dash-history-body"><p>{item.summary||'No summary was saved for this conversation.'}</p>{item.takeaway&&<div className="dash-takeaway"><h3>Your call takeaway</h3><dl><div><dt>Truth</dt><dd>{item.takeaway.truth}</dd></div><div><dt>Next step</dt><dd>{item.takeaway.action}</dd></div><div><dt>Prayer</dt><dd>{item.takeaway.prayer}</dd></div></dl></div>}{(item.kind==='conversation'&&Boolean(item.summary)||Boolean(item.takeaway))&&<button type="button" className="elroi-text-link" onClick={()=>onContinue(item)}>Continue in writing <ArrowUpRight size={16}/></button>}{item.references.length>0&&<div><h3>Scripture references</h3><ul>{item.references.map(reference=><li key={reference}>{reference}</li>)}</ul></div>}</div></details>)}</div>;}
function DashboardSignIn({initialError}:{initialError:string}){
  const location=useLocation();const navigate=useNavigate();const mode=new URLSearchParams(location.search).get('mode')==='signup'?'signup':'signin';
  return <div className="elroi-site dash-login"><header><Brand/><Link to="/" className="elroi-text-link"><ArrowLeft size={16}/><span>Back to website</span></Link></header><main id="main-content" className="dash-login-grid"><section className="dash-login-story"><span className="dash-login-symbol"><Headphones size={31}/></span><p className="elroi-kicker">YOUR EL ROI SPACE</p><h1>Your Bible calls.<br/>All in one place.</h1><p>Schedule Scripture around your life, keep the voice you like, and return to what you learned.</p><div className="dash-login-features"><span><CalendarClock size={20}/>Schedule and manage your calls</span><span><NotebookPen size={20}/>Keep your notes and call history</span><span><ShieldCheck size={20}/>Website password, separate from your calling PIN</span></div></section><section className="dash-login-panel"><span className="elroi-icon-tile"><ShieldCheck size={24}/></span><AccountSignIn initialError={initialError} mode={mode} onModeChange={next=>{const search=new URLSearchParams(location.search);search.set('mode',next);navigate({pathname:location.pathname,search:`?${search.toString()}`},{replace:true});}}/><div className="dash-login-call"><Phone size={19}/><div><strong>Need a conversation now?</strong><a href={PHONE_TEL}>Call {PHONE_DISPLAY}</a></div></div></section></main></div>;
}
