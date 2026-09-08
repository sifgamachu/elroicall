import { Navigate, Route, Routes } from "react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { DraftContext } from "@/lib/draft";
import RouteMeta from "@/components/RouteMeta";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { PHONE_TEL } from "@/lib/phone";

const Schedule = lazy(() => import("./pages/Schedule"));
const About = lazy(() => import("./pages/About"));
const BeginWell = lazy(() => import("./pages/BeginWell"));
const Gift = lazy(() => import("./pages/Gift"));
const GiftRedeem = lazy(() => import("./pages/GiftRedeem"));
const MemberRoom = lazy(() => import("./pages/MemberRoom"));
const AuthConfirm = lazy(() => import("./pages/AuthConfirm"));

export default function App() {
  const [draft, setDraft] = useState("");
  const [draftOwner,setDraftOwner]=useState<string|null>(null);
  useEffect(()=>{
    if(!draftOwner)return;
    let active=true;let changed=false;let unsubscribe:(()=>void)|undefined;
    // Keep the public landing page light; the Auth SDK is needed only for a private continuation.
    void import('@/lib/supabase').then(({supabase})=>{
      if(!active)return;
      const check=(id:string|undefined)=>{if(active&&id!==draftOwner){setDraft('');setDraftOwner(null);}};
      const {data}=supabase.auth.onAuthStateChange((_event,session)=>{changed=true;check(session?.user.id);});
      unsubscribe=()=>data.subscription.unsubscribe();
      void supabase.auth.getSession().then(({data})=>{if(!changed)check(data.session?.user.id);}).catch(()=>check(undefined));
    }).catch(()=>{if(active){setDraft('');setDraftOwner(null);}});
    return()=>{active=false;unsubscribe?.();};
  },[draftOwner]);
  return (
    <DraftContext.Provider value={{ draft, setDraft,setPrivateDraft:(text,owner)=>{setDraftOwner(owner);setDraft(text);} }}>
      <RouteMeta />
      <Suspense fallback={<main className="grid min-h-screen place-content-center gap-5 bg-[#f8f9fc] px-6 text-center text-parchment"><p role="status" className="text-lg">Opening your conversation…</p><a href={PHONE_TEL} className="min-h-11 text-gold-bright underline">Prefer voice? Call El Roi</a></main>}>
      <Routes>
        <Route path="/auth/confirm" element={<AuthConfirm />} />
        <Route path="/auth/confirm/" element={<AuthConfirm />} />
        <Route path="/" element={<Home />} />
        <Route path="/begin" element={<BeginWell />} />
        <Route path="/begin/" element={<BeginWell />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/schedule/" element={<Schedule />} />
        <Route path="/gift" element={<Gift />} />
        <Route path="/gift/" element={<Gift />} />
        <Route path="/g" element={<GiftRedeem />} />
        <Route path="/g/" element={<GiftRedeem />} />
        <Route path="/g/:code" element={<GiftRedeem />} />
        <Route path="/about" element={<About />} />
        <Route path="/about/" element={<About />} />
        <Route path="/account" element={<MemberRoom />} />
        <Route path="/account/" element={<MemberRoom />} />
        <Route path="/dashboard" element={<MemberRoom />} />
        <Route path="/dashboard/" element={<MemberRoom />} />
        <Route path="/login" element={<Navigate to="/account" replace />} />
        <Route path="/portal" element={<Navigate to="/account" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </DraftContext.Provider>
  );
}
