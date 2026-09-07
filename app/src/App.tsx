import { useEffect } from "react";
import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

/** Members currently live at /account/ while the portal is being unified. */
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
      <Route path="/login" element={<ToAccount />} />
      <Route path="/portal" element={<ToAccount />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
