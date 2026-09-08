import { createContext, useContext } from "react";

// Sensitive drafts live only in React memory, never URLs or browser history.
export const DraftContext = createContext<{ draft: string; setDraft: (draft: string) => void;setPrivateDraft:(draft:string,owner:string)=>void }>({
  draft: "",
  setDraft: () => {},
  setPrivateDraft:()=>{},
});

export function useDraft() {
  return useContext(DraftContext);
}
