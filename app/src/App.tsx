import { useEffect } from "react";
import { Route, Routes } from "react-router";
import About from "./pages/About";
import Begin from "./pages/Begin";
import Gift from "./pages/Gift";
import GiftRedeem from "./pages/GiftRedeem";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

/**
 * The member portal is the last legacy standalone application while its
 * authentication/data contract is moved into the shared React app.
 */
function ToAccount() {
  useEffect(() => {
    window.location.replace("/account/");
  }, []);
  return null;
}

export default function App() {
  return (
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
      <Route path="/account" element={<ToAccount />} />
      <Route path="/login" element={<ToAccount />} />
      <Route path="/portal" element={<ToAccount />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
