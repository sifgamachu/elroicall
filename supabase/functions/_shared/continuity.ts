export const NOTE_KINDS=[{id:'reflection',label:'Reflection'},{id:'verse',label:'Scripture note'},{id:'prayer',label:'Prayer note'}] as const;
export type MemoryNote={id:string;kind:typeof NOTE_KINDS[number]['id'];title:string;body:string;version:number;updated_at:string};
export type MemorySnapshot={enabled:boolean;revision:number;notes:MemoryNote[];phone_ready?:boolean};
export const NOTE_UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function validateMemoryNote(value:unknown):string|null{
 if(!value||typeof value!=='object')return 'Write a note to save.';
 const p=value as MemoryNote&{consent?:boolean};
 if(typeof p.id!=='string'||!NOTE_UUID.test(p.id))return 'Refresh before saving.';
 if(!NOTE_KINDS.some(k=>k.id===p.kind))return 'Choose a note type.';
 if(typeof p.title!=='string'||!p.title.trim()||p.title.length>80)return 'Give your note a title of up to 80 characters.';
 if(typeof p.body!=='string'||!p.body.trim()||p.body.length>1200)return 'Write between 1 and 1,200 characters.';
 if(p.consent!==true)return 'Confirm that you want to save this note.';
 return null;
}
export function continuationDraft(note:Pick<MemoryNote,'title'|'body'>,change=''):string{
 return `I would like to return to this note I chose to save: ${note.title}\n\n${note.body}\n\n${change.trim()?`What is different today: ${change.trim()}`:'Help me reflect on this and explore a relevant passage of Scripture.'}`;
}
