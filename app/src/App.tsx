import { Navigate, Route, Routes } from "react-router";
import { lazy, Suspense, useState } from "react";
import { DraftContext } from "@/lib/draft";
import RouteMeta from "@/components/RouteMeta";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { PHONE_TEL } from "@/lib/phone";

const About = lazy(() => import("./pages/About"));
const BeginWell = lazy(() => import("./pages/BeginWell"));
const Gift = lazy(() => import("./pages/Gift"));
const GiftRedeem = lazy(() => import("./pages/GiftRedeem"));
const MemberRoom = lazy(() => import("./pages/MemberRoom"));

export default function App() {
  const [draft, setDraft] = useState("");
  return (
    <DraftContext.Provider value={{ draft, setDraft }}>
      <RouteMeta />
      <Suspense fallback={<main className="grid min-h-screen place-content-center gap-5 bg-[#0b0a08] px-6 text-center text-parchment"><p role="status" className="text-lg">Opening your conversation…</p><a href={PHONE_TEL} className="min-h-11 text-gold-bright underline">Prefer voice? Call El Roi</a></main>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/begin" element={<BeginWell />} />
        <Route path="/begin/" element={<BeginWell />} />
        <Route path="/gift" element={<Gift />} />
        <Route path="/gift/" element={<Gift />} />
        <Route path="/g" element={<GiftRedeem />} />
        <Route path="/g/" element={<GiftRedeem />} />
        <Route path="/g/:code" element={<GiftRedeem />} />
        <Route path="/about" element={<About />} />
        <Route path="/about/" element={<About />} />
        <Route path="/account" element={<MemberRoom />} />
        <Route path="/account/" element={<MemberRoom />} />
        <Route path="/login" element={<Navigate to="/account" replace />} />
        <Route path="/portal" element={<Navigate to="/account" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </DraftContext.Provider>
  );
}
