import { Navigate, Route, Routes } from "react-router";
import RouteMeta from "@/components/RouteMeta";
import About from "./pages/About";
import BeginWell from "./pages/BeginWell";
import Gift from "./pages/Gift";
import GiftRedeem from "./pages/GiftRedeem";
import Home from "./pages/Home";
import MemberRoom from "./pages/MemberRoom";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <RouteMeta />
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
    </>
  );
}
