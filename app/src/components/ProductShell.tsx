import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import Nav from "@/sections/Nav";
import Footer from "@/sections/Footer";

type ProductShellProps = {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  compact?: boolean;
};

export default function ProductShell({ children, backHref = "/", backLabel = "Home", eyebrow, title, description, compact = false }: ProductShellProps) {
  return <div className="elroi-site elroi-product"><Nav /><main id="main-content" className={`elroi-product-main ${compact ? "elroi-product-compact" : ""}`}><Link to={backHref} className="elroi-back"><ArrowLeft size={16} />{backLabel}</Link>{(eyebrow || title || description) && <div className="elroi-product-heading">{eyebrow && <p className="elroi-kicker">{eyebrow}</p>}{title && <h1>{title}</h1>}{description && <p>{description}</p>}</div>}<div className="elroi-product-content">{children}</div></main><Footer /></div>;
}
