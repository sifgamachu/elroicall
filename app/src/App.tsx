import { useEffect } from "react"
import { Routes, Route } from "react-router"
import Home from "./pages/Home"

/** Members live at /account/ — a full page outside the React app. */
function ToAccount() {
  useEffect(() => { window.location.replace("/account/") }, [])
  return null
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<ToAccount />} />
      <Route path="/portal" element={<ToAccount />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
