import { Waves } from "lucide-react";
import { Link } from "react-router";

export default function Brand({ light = false }: { light?: boolean }) {
  return <Link to="/" className={`elroi-brand${light ? " elroi-brand-light" : ""}`} aria-label="El Roi Call home"><span className="elroi-brand-icon"><Waves size={21} strokeWidth={2.2} aria-hidden="true" /></span><span>elroi<span className="elroi-brand-call">call</span></span></Link>;
}
