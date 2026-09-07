import { useLocation } from "react-router";
import { useDocumentMeta } from "@/hooks/use-document-meta";

const HOME = {
  title: "El Roi Call — Start with what you are carrying",
  description: "One AI guide listens first, then can bring a relevant biblical story into the conversation. First guided call free.",
  canonical: "https://elroicall.com/",
};

export default function RouteMeta() {
  const { pathname } = useLocation();

  const meta = pathname.startsWith("/begin")
    ? {
        title: "Your Free First Conversation — El Roi Call",
        description: "Start with what is true. El Roi Guide listens first and may bring a relevant biblical story into your free first conversation.",
        canonical: "https://elroicall.com/begin/",
      }
    : pathname.startsWith("/gift")
      ? {
          title: "Gift a Conversation — El Roi Call",
          description: "Give someone you care about one free conversation with El Roi Guide. They choose whether to open it, what to discuss, and when to call.",
          canonical: "https://elroicall.com/gift/",
        }
      : pathname === "/g" || pathname.startsWith("/g/")
        ? {
            title: "Someone Thought of You — El Roi Call",
            description: "A private El Roi Call gift invitation.",
            canonical: "https://elroicall.com/g/",
            robots: "noindex,nofollow,noarchive",
          }
        : pathname.startsWith("/about")
          ? {
              title: "Why El Roi Call Exists — The God Who Sees",
              description: "El Roi Call begins with Hagar in Genesis 16 and one idea: listen first, then help people enter Scripture without impersonating biblical people.",
              canonical: "https://elroicall.com/about/",
            }
          : pathname.startsWith("/account") || pathname.startsWith("/login") || pathname.startsWith("/portal")
            ? {
                title: "Your Room — El Roi Call",
                description: "Your El Roi Call member space.",
                canonical: "https://elroicall.com/account/",
                robots: "noindex,nofollow",
              }
            : HOME;

  useDocumentMeta(meta);
  return null;
}
