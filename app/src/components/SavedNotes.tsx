import { useCallback,useEffect,useRef,useState } from 'react';
import { Link,useNavigate } from 'react-router';
import type { Session } from '@supabase/supabase-js';
import { ArrowRight,BookOpen,Check,LockKeyhole,MessageCircle,NotebookPen,Pause,Phone,Plus,RefreshCw,Save,Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction } from '@/components/ui/alert-dialog';
import { NOTE_KINDS,continuationDraft,continuityRequest,validateMemoryNote,type MemoryNote,type MemorySnapshot } from '@/lib/continuity';
import { useDraft } from '@/lib/draft';
import { PHONE_DISPLAY,PHONE_TEL } from '@/lib/phone';
import '@/continuity.css';

type Editor={id:string;kind:MemoryNote['kind'];title:string;body:string;revision:number};
const blank=(revision:number):Editor=>({id:crypto.randomUUID(),kind:'reflection',title:'',body:'',revision});
type Props={session:Session;compact?:boolean};
export default function SavedNotes({session,compact=false}:Props){
 const navigate=useNavigate();const {setPrivateDraft,setDraft}=useDraft();
 const [data,setData]=useState<MemorySnapshot|null>(null);const [error,setError]=useState('');const [notice,setNotice]=useState('');const [busy,setBusy]=useState('');
 const [editor,setEditor]=useState<Editor|null>(null);const [consent,setConsent]=useState(false);const [change,setChange]=useState('');
 const [nextEditor,setNextEditor]=useState<Editor|null>(null);
 const [remove,setRemove]=useState<'all'|MemoryNote|null>(null);const [share,setShare]=useState<MemoryNote|null>(null);
 const [handoff,setHandoff]=useState<{code:string;expires_at:string;phone_last4:string}|null>(null);const [seconds,setSeconds]=useState(0);
 const active=useRef(true);const pending=useRef(false);const form=useRef<HTMLTextAreaElement>(null);
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 const refresh=useCallback(()=>continuityRequest<MemorySnapshot>('/notes',session).then(result=>{if(active.current){setData(result);setError('');}}).catch(issue=>{if(active.current)setError(issue instanceof Error?issue.message:'Could not load notes.');}),[session]);
 useEffect(()=>{void refresh();},[refresh]);
 useEffect(()=>{
  if(!handoff)return;
  const tick=()=>{const remaining=Math.max(0,Math.ceil((Date.parse(handoff.expires_at)-Date.now())/1000));setSeconds(remaining);if(!remaining)setHandoff(null);};
  const timer=setInterval(tick,1000);return()=>clearInterval(timer);
 },[handoff]);
 async function perform(label:string,fn:()=>Promise<void>){
  if(pending.current)return;pending.current=true;setBusy(label);setError('');setNotice('');
  try{await fn();}catch(issue){if(active.current){setError(issue instanceof Error?issue.message:'The request could not be confirmed. Refresh before trying again.');setHandoff(null);}}
  finally{pending.current=false;if(active.current)setBusy('');}
 }
 async function toggle(){if(!data)return;await perform('settings',async()=>{
  const result=await continuityRequest<MemorySnapshot>('/settings',session,{revision:data.revision,enabled:!data.enabled,consent:!data.enabled});
  if(!active.current)return;setData(result);setEditor(null);setHandoff(null);setConsent(false);
  setNotice(result.enabled?'Saved notes are on. You choose every note that is kept.':'Saved notes are paused. They stay in your account, and active phone sharing is revoked.');
 });}
 function openEditor(next:Editor){setEditor(next);setNextEditor(null);setConsent(false);setChange('');setNotice('');setError('');setHandoff(null);setTimeout(()=>form.current?.focus(),0);}
 function edit(note?:MemoryNote){if(!data||pending.current)return;const next=note?{id:note.id,title:note.title,body:note.body,kind:note.kind,revision:data.revision}:blank(data.revision);const saved=data.notes.find(n=>n.id===editor?.id);if(editor&&(editor.title.trim()||editor.body.trim())&&(!saved||saved.title!==editor.title||saved.body!==editor.body||saved.kind!==editor.kind)){setNextEditor(next);return;}openEditor(next);}
 async function save(){if(!editor)return;const validation=validateMemoryNote({...editor,consent});if(validation){setError(validation);return;}
  await perform('save',async()=>{
   const result=await continuityRequest<MemorySnapshot>('/notes',session,{revision:editor.revision,note:{...editor,consent}});
   if(!active.current)return;setData(result);setEditor({...editor,revision:result.revision});setConsent(false);setHandoff(null);setNotice('Saved to your account. Use it only when you choose to continue from this note.');
  });
 }
 async function continueFrom(note:MemoryNote){await perform('continue',async()=>{
  const result=await continuityRequest<{note:MemoryNote}>(`/notes/${note.id}/continue`,session,{});
  if(!active.current)return;setPrivateDraft(continuationDraft(result.note,change),session.user.id);navigate('/begin/');
 });}
 async function removeNotes(){if(!data||!remove)return;const target=remove;setRemove(null);await perform('delete',async()=>{
  const result=await continuityRequest<MemorySnapshot>(target==='all'?'/clear':'/delete',session,{revision:data.revision,confirm:true,note:target==='all'?undefined:{id:target.id}});
  if(!active.current)return;setData(result);setEditor(null);setHandoff(null);setDraft('');setNotice(target==='all'?'All saved notes were removed and saved notes are now off.':'Note removed. It can no longer be shared with the guide.');
 });}
 async function createHandoff(){if(!data||!share)return;const note=share;setShare(null);await perform('handoff',async()=>{
  const result=await continuityRequest<{code:string;expires_at:string;phone_last4:string}>('/handoff',session,{revision:data.revision,note_id:note.id,consent:true});
  if(active.current){setSeconds(Math.max(0,Math.ceil((Date.parse(result.expires_at)-Date.now())/1000)));setHandoff(result);}
 });}
 if(compact){const latest=data?.enabled?data.notes[0]:null;
  return <section className="memory-return"><span className="memory-return-icon"><NotebookPen size={26}/></span><div><p className="elroi-kicker">CONTINUE WHERE YOU LEFT OFF</p><h2>{latest?latest.title:'Keep what matters. Bring what’s new.'}</h2><p>{latest?'Choose this saved note as a starting point, then add what has changed today.':'Your own reflections, Scripture notes, and prayers. Save only what you want to return to.'}</p>{error&&<p className="memory-error" role="alert">{error}</p>}</div><div className="memory-return-actions">{latest&&<button className="elroi-button elroi-button-primary" disabled={Boolean(busy)} onClick={()=>void continueFrom(latest)}>Continue in writing <ArrowRight size={17}/></button>}<Link to="/account/?view=notes" className="elroi-text-link">{data?.enabled?'Open saved notes':'Choose what to remember'} <ArrowRight size={16}/></Link></div></section>;
 }
 const selected=data?.notes.find(n=>n.id===editor?.id);const dirty=!!editor&&(!selected||editor.title!==selected.title||editor.body!==selected.body||editor.kind!==selected.kind);
 return <div className="memory-space">
  <section className="memory-contract"><span className="memory-return-icon"><LockKeyhole size={24}/></span><div><h2>You decide what stays.</h2><p>These are notes you write and save yourself. Nothing is automatically copied from your calls. Choose a note when you want to bring it into a new reflection.</p><span className="memory-state">{data?(data.enabled?'Saved notes on':'Saved notes paused'):'Opening your notes…'}</span></div>{data&&<button className="elroi-button elroi-button-secondary" disabled={Boolean(busy)} onClick={()=>void toggle()}>{data.enabled?<><Pause size={17}/>Pause saved notes</>:<>Turn on saved notes <Check size={17}/></>}</button>}</section>
  {error&&<div className="memory-error" role="alert"><p>{error}</p><button className="elroi-text-link" disabled={Boolean(busy)} onClick={()=>void refresh()}>Refresh notes <RefreshCw size={15}/></button></div>}
  {notice&&<p className="memory-notice" role="status"><Check size={18}/>{notice}</p>}
  {data&&<div className="memory-columns"><section className="memory-library" aria-label="Saved notes"><header><div><h2>Your notes</h2><p>{data.notes.length} of 40 spaces</p></div><button aria-label="Write a new note" className="memory-new" disabled={!data.enabled||Boolean(busy)} onClick={()=>edit()}><Plus size={22}/></button></header>
   {!data.notes.length?<div className="memory-empty"><BookOpen size={30}/><h3>A verse. A question. A moment.</h3><p>{data.enabled?'Write your first note and give yourself a place to return.':'Turn on saved notes when you are ready to keep something.'}</p></div>:<div className="memory-note-list">{data.notes.map(note=><button key={note.id} type="button" className="memory-note-choice" aria-pressed={editor?.id===note.id} onClick={()=>edit(note)}><span>{NOTE_KINDS.find(k=>k.id===note.kind)?.label}</span><strong>{note.title}</strong><p>{note.body}</p><small>Updated {new Intl.DateTimeFormat(undefined,{dateStyle:'medium'}).format(new Date(note.updated_at))}</small></button>)}</div>}
   {data.notes.length>0&&<button className="memory-remove-all" disabled={Boolean(busy)} onClick={()=>setRemove('all')}><Trash2 size={16}/>Remove all saved notes</button>}
  </section><section className="memory-editor" aria-label="Note editor">
   {editor?<><form onSubmit={event=>{event.preventDefault();void save();}}><div className="memory-editor-top"><p className="elroi-kicker">{selected?'YOUR SAVED NOTE':'MAKE A LITTLE ROOM'}</p>{selected&&<button type="button" aria-label="Remove this note" className="memory-icon-button" disabled={Boolean(busy)} onClick={()=>setRemove(selected)}><Trash2 size={18}/></button>}</div><fieldset disabled={!data.enabled||Boolean(busy)}><legend className="sr-only">Note details</legend><label>Note type<select value={editor.kind} onChange={event=>{setEditor({...editor,kind:event.target.value as MemoryNote['kind']});setConsent(false);}}>{NOTE_KINDS.map(kind=><option key={kind.id} value={kind.id}>{kind.label}</option>)}</select></label><label>Title<input value={editor.title} maxLength={80} placeholder="What would you like to return to?" onChange={event=>{setEditor({...editor,title:event.target.value});setConsent(false);}} required/></label><label>Your words<textarea ref={form} value={editor.body} maxLength={1200} rows={8} placeholder="A thought you want to keep, a verse to explore, or a prayer in your own words…" onChange={event=>{setEditor({...editor,body:event.target.value});setConsent(false);}} required/></label><span className="memory-count">{editor.body.length} / 1,200</span><label className="memory-consent"><Checkbox checked={consent} onCheckedChange={checked=>setConsent(checked===true)}/><span>I want to keep these words in my account until I remove them.</span></label><button type="submit" className="elroi-button elroi-button-primary" disabled={!consent}><Save size={17}/>{busy==='save'?'Saving…':'Save this note'}</button></fieldset></form>
    {selected&&<div className="memory-continue"><h3>Where would you like to go from here?</h3><label>What’s different today? <span>(optional)</span><textarea rows={2} maxLength={400} value={change} onChange={event=>setChange(event.target.value)} placeholder="Add what has changed, or leave this blank to pick up the thread." disabled={!data.enabled||Boolean(busy)}/></label><div><button className="elroi-button elroi-button-primary" disabled={!data.enabled||dirty||Boolean(busy)} onClick={()=>void continueFrom(selected)}><MessageCircle size={17}/>Continue in writing</button><button className="elroi-button elroi-button-secondary" disabled={!data.enabled||!data.phone_ready||dirty||Boolean(busy)} onClick={()=>setShare(selected)}><Phone size={17}/>Continue by phone</button></div><p>{dirty?'Save your changes before continuing.':!data.enabled?'Turn saved notes back on to continue from a note.':'You can review and change the words before sending them for a reflection.'}</p>{!data.phone_ready&&<p>Sharing a saved note with the phone guide is being connected. You can continue in writing now.</p>}</div>}
   </>:<div className="memory-editor-empty"><NotebookPen size={38}/><h2>{data.notes.length?'Choose a note to begin.':'This space is yours.'}</h2><p>Save a thought in your own words. When you return, choose what to carry into the next conversation.</p><button className="elroi-button elroi-button-primary" disabled={!data.enabled} onClick={()=>edit()}><Plus size={17}/>Write a note</button></div>}
   {handoff&&<div className="memory-handoff" role="status"><h3>Your phone handoff</h3><p>Call from your verified number ending in {handoff.phone_last4}. Tell the guide “Use my saved note,” then give this code.</p><strong aria-label={`Code ${handoff.code.split('').join(' ')}`}>{handoff.code}</strong><p>Expires in {Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}. A new code replaces the old one.</p><a className="elroi-button elroi-button-primary" href={PHONE_TEL}>Call {PHONE_DISPLAY}</a></div>}
  </section></div>}
  <p className="memory-footnote">Removing saved notes stops future sharing of those notes. It does not erase earlier call recordings or conversation history. <Link to="/privacy/">Read the privacy policy</Link>.</p>
  <AlertDialog open={Boolean(remove)} onOpenChange={open=>{if(!open)setRemove(null);}}><AlertDialogContent className="memory-dialog"><AlertDialogTitle>{remove==='all'?'Remove every saved note?':'Remove this note?'}</AlertDialogTitle><AlertDialogDescription>This removes the saved words and revokes their phone handoff. Earlier conversations are separate. This cannot be undone.</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Keep notes</AlertDialogCancel><AlertDialogAction onClick={()=>void removeNotes()}>Remove {remove==='all'?'all notes':'note'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  <AlertDialog open={Boolean(share)} onOpenChange={open=>{if(!open)setShare(null);}}><AlertDialogContent className="memory-dialog"><AlertDialogTitle>Share this note with the phone guide?</AlertDialogTitle><AlertDialogDescription>Only “{share?.title}” will be shared for this call, after you provide the one-time code from your verified number. The current phone service records conversations.</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Keep it here</AlertDialogCancel><AlertDialogAction onClick={()=>void createHandoff()}>Create my code</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  <AlertDialog open={Boolean(nextEditor)} onOpenChange={open=>{if(!open)setNextEditor(null);}}><AlertDialogContent className="memory-dialog"><AlertDialogTitle>Leave your unsaved changes?</AlertDialogTitle><AlertDialogDescription>The words currently in the editor have not been saved. Keep editing to save them before opening another note.</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Keep editing</AlertDialogCancel><AlertDialogAction onClick={()=>{if(nextEditor)openEditor(nextEditor);}}>Leave changes</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
 </div>;
}
