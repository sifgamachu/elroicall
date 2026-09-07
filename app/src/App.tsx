import { Navigate, Route, Routes } from "react-router";
import RouteMeta from "@/components/RouteMeta";
import About from "./pages/About";
import Begin from "./pages/Begin";
import Gift from "./pages/Gift";
import GiftRedeem from "./pages/GiftRedeem";
import Home from "./pages/Home";
import Member from "./pages/Member";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <RouteMeta />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/begin" element={<Begin />} />
        <Route path="/begin/" element={<Begin />} />
        <Route path="/gift" element={<Gift />} />
        <Route path="/gift/" element={<Gift />} />
        <Route path="/g" element={<GiftRedeem />} />
        <Route path="/g/" element={<GiftRedeem />} />
        <Route path="/g/:code" element={<GiftRedeem />} />
        <Route path="/about" element={<About />} />
        <Route path="/about/" element={<About />} />
        <Route path="/account" element={<Member />} />
        <Route path="/account/" element={<Member />} />
        <Route path="/login" element={<Navigate to="/account" replace />} />
        <Route path="/portal" element={<Navigate to="/account" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
