import { useEffect } from "react";
import { useLocation } from "react-router";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { getMoment } from "@/lib/scripture-library";
import { useSeason } from "@/lib/seasonal-context";
import { readingForDay } from "@/lib/autumn-readings";
import { channelMessage, messagePath } from "@/lib/youtube-channel";

const FOUNDATION = {
  title: "El Roi Call — Bible encouragement at your time",
  description: "Choose a personalized Bible call or a seven-day Call Journey for peace, grief, rest, purpose, courage, or Bible foundations.",
  canonical: "https://elroicall.com/",
};

export default function RouteMeta() {
  const { pathname, hash, key } = useLocation();
  const season = useSeason();
  const home = FOUNDATION;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (hash) {
        document.getElementById(hash.slice(1))?.scrollIntoView();
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, key]);

  const moment = pathname.startsWith("/explore/") ? getMoment(pathname.split("/")[2]) : undefined;
  const autumnReading = pathname.startsWith('/journey/') ? readingForDay(pathname.split('/')[2]) : undefined;
  const videoMessage = pathname.startsWith('/watch/') ? channelMessage(pathname.split('/')[2]) : undefined;
  const meta = pathname === '/watch' || pathname.startsWith('/watch/')
    ? { title: videoMessage ? `${videoMessage.title} Watch & reflect — El Roi Call` : 'Watch, reflect & talk — El Roi Call', description: videoMessage ? `${videoMessage.summary} Reflect on ${videoMessage.passage} and bring your questions to El Roi.` : 'Watch selected messages from El Roi Calls on YouTube, reflect with Scripture, and bring what stays with you into a conversation.', canonical: `https://elroicall.com${videoMessage ? messagePath(videoMessage) : '/watch/'}`, ...(pathname.split('/')[2] && !videoMessage ? { robots: 'noindex,follow' } : {}) }
    : pathname.startsWith('/bible-challenge') ? { ...FOUNDATION, title: season ? 'The 84-day Bible challenge — El Roi Call' : 'Your Bible reading journey — El Roi Call', canonical: 'https://elroicall.com/bible-challenge/' } : pathname.startsWith('/journey')
    ? { title: autumnReading ? `Day ${autumnReading.day}: ${autumnReading.passage} — El Roi Call` : 'Your 84-day Bible journey — El Roi Call', description: 'Follow the full 84-day Bible reading plan, with daily passages, reflection questions and progress saved on your device.', canonical: `https://elroicall.com/journey/${autumnReading ? autumnReading.day + '/' : ''}` }
    : pathname.startsWith("/explore")
    ? { title: moment ? `${moment.title} — El Roi Call` : "Free Bible reflections & stories — El Roi Call", description: moment ? `${moment.description} A short reflection on ${moment.passage}, with a prayer and a practical next step.` : "Explore ten free Bible reflections, Scripture facts, study questions, and a seven-day reading path. No account needed.", canonical: `https://elroicall.com/explore/${moment ? moment.id + "/" : ""}` }
    : pathname.startsWith("/schedule")
    ? { title: "Choose a Bible Call Journey — El Roi Call", description: "Choose a seven-day Scripture journey or schedule a Bible study, sermon, lecture, story, or Bible facts call at your time.", canonical: "https://elroicall.com/schedule/", robots: "noindex,nofollow" }
    : pathname.startsWith("/begin")
    ? {
        title: "What’s on your heart? — El Roi Call",
        description: "Your words first. El Roi reflects what it heard before opening a relevant biblical story and preparing your free first conversation.",
        canonical: "https://elroicall.com/begin/",
      }
    : pathname.startsWith("/gift")
      ? {
          title: "Give someone a place to start — El Roi Call",
          description: "Give someone you care about one free El Roi conversation. They choose whether to open it, what to discuss, and when to call.",
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
              description: "El Roi Call begins with Hagar in Genesis 16 and one principle: listen first, then help people enter Scripture without impersonating biblical people.",
              canonical: "https://elroicall.com/about/",
            }
          : pathname.startsWith("/signup") || pathname.startsWith("/auth/") || pathname.startsWith("/account") || pathname.startsWith("/dashboard") || pathname.startsWith("/login") || pathname.startsWith("/portal")
            ? {
                title: "My Dashboard — El Roi Call",
                description: "Your scheduled calls, conversations, voice preferences, and verified calling number, together in one private space.",
                canonical: "https://elroicall.com/account/",
                robots: "noindex,nofollow",
              }
            : home;

  useDocumentMeta(meta);
  return null;
}
