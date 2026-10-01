import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import type { Session } from "@supabase/supabase-js";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clapperboard,
  Clock3,
  Crown,
  Home,
  Library,
  MessageCircle,
  Phone,
  Play,
  Search,
  Sparkles,
  Waves,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { watchAccountSession } from "@/lib/account-session";
import {
  CHANNEL_MEDIA,
  GENESIS_MEDIA,
  getMediaLibrary,
  getMediaPlayback,
} from "@/lib/media-library";
import {
  canPlayMedia,
  mediaArtwork,
  mediaDuration,
  mediaScheduleUrl,
  type MediaItem,
} from "@/lib/media-model";
import { AUTUMN_READINGS } from "@/lib/autumn-readings";
import { useStudyProgress } from "@/lib/use-study-progress";
import { PHONE_TEL } from "@/lib/phone";
import { isAppShell } from "@/lib/native";
import { registerAppShell } from "@/lib/app-install";
import { useDraft } from "@/lib/draft";
import AppDock from "@/components/AppDock";
import AppMembership from "@/components/AppMembership";
import MediaStudio from "@/components/MediaStudio";
import "@/elroi-app.css";

const navigation = [
  { path: "/app/", label: "Home", icon: Home },
  { path: "/app/watch/", label: "Watch", icon: Play },
  { path: "/app/cinema/", label: "Bible Cinema", icon: Clapperboard },
  { path: "/app/study/", label: "Bible study", icon: BookOpen },
  { path: "/app/calls/", label: "Elroi Calls", icon: Phone },
  { path: "/app/you/", label: "Your space", icon: CircleUserRound },
];
export default function ElroiApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    registerAppShell();
  }, []);
  useEffect(
    () =>
      watchAccountSession(
        supabase.auth,
        next => {
          setSession(next);
          setAuthReady(true);
        },
        () => setAuthReady(true)
      ),
    []
  );
  return (
    <AppWorkspace
      key={session?.user.id || "guest"}
      session={session}
      authReady={authReady}
    />
  );
}

function AppWorkspace({
  session,
  authReady,
}: {
  session: Session | null;
  authReady: boolean;
}) {
  const location = useLocation();
  const [media, setMedia] = useState<MediaItem[]>([
    ...CHANNEL_MEDIA,
    ...GENESIS_MEDIA,
  ]);
  const [libraryError, setLibraryError] = useState("");
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [query, setQuery] = useState("");
  const progress = useStudyProgress(session?.user.id);
  const tab = location.pathname.split("/")[2] || "home";
  const slug = location.pathname.split("/")[3];
  const editor = session?.user.app_metadata.elroi_editor === true;
  const active = media.find(item => item.slug === slug);
  useEffect(() => {
    let alive = true;
    void getMediaLibrary()
      .then(items => {
        if (alive) {
          setMedia(items);
          setLibraryLoading(false);
        }
      })
      .catch(issue => {
        if (alive) {
          setLibraryError(issue.message);
          setLibraryLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, []);
  const nextDay =
    AUTUMN_READINGS.find(reading => !progress.completed.includes(reading.day))
      ?.day || 84;
  const selectedDay = Number(new URLSearchParams(location.search).get("day"));
  const day =
    Number.isInteger(selectedDay) && selectedDay >= 1 && selectedDay <= 84
      ? selectedDay
      : nextDay;
  const reading = AUTUMN_READINGS[day - 1];
  const sectionTitle =
    tab === "home"
      ? "Your daily journey"
      : tab === "cinema"
        ? "Bible Cinema"
        : tab === "study"
          ? "Bible study"
          : tab === "calls"
            ? "Elroi Calls"
            : tab === "you"
              ? "Your space"
              : tab === "membership"
                ? "Membership"
                : tab === "studio"
                  ? "Content studio"
                  : tab === "video"
                    ? "Watch & reflect"
                    : "Watch";
  const published = media.filter(item => item.status === "published");
  const matching = media.filter(
    item =>
      item.section === (tab === "cinema" ? "cinema" : "watch") &&
      `${item.title} ${item.book} ${item.passage}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );
  return (
    <div className="erc-app">
      <a className="erc-skip" href="#erc-main">
        Skip to content
      </a>
      <aside className="erc-sidebar">
        <Link to="/app/" className="erc-brand">
          <span>
            <Waves size={26} />
          </span>
          <div>
            elroi<span>CALLS</span>
          </div>
        </Link>
        <p className="erc-side-label">YOUR JOURNEY</p>
        <nav aria-label="Library navigation">
          {navigation.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              aria-current={
                location.pathname === path ||
                (path !== "/app/" && location.pathname.startsWith(path))
                  ? "page"
                  : undefined
              }
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="erc-side-bottom">
          <Link className="erc-side-plus" to="/app/membership/">
            <Crown size={21} />
            <span>
              Elroi Plus<small>Go deeper into Scripture</small>
            </span>
          </Link>
          {editor && (
            <Link to="/app/studio/" className="erc-side-studio">
              <Library size={17} /> Content studio
            </Link>
          )}
          <Link to="/" className="erc-side-site">
            Visit elroicall.com
          </Link>
        </div>
      </aside>
      <div className="erc-workspace">
        <header className="erc-topbar">
          <Link to="/app/" className="erc-mobile-brand">
            <Waves size={25} />
            <span>
              elroi<span>calls</span>
            </span>
          </Link>
          <p className="erc-breadcrumb">
            ELROI CALLS <span>/</span> {sectionTitle}
          </p>
          <div className="erc-top-actions">
            <Link className="erc-plus-pill" to="/app/membership/">
              <Crown size={16} /> Elroi Plus
            </Link>
            <Link
              to={session ? "/app/you/" : "/account/?mode=signin"}
              aria-label={session ? "Your account" : "Sign in"}
              className="erc-profile"
            >
              <CircleUserRound size={23} />
              <span>{session ? "Your space" : "Sign in"}</span>
            </Link>
          </div>
        </header>
        <main id="erc-main" className="erc-main">
          {libraryError && (
            <div className="erc-library-error" role="status">
              {libraryError}
            </div>
          )}
          {tab === "home" && (
            <>
              <div className="erc-welcome">
                <p className="erc-eyebrow">WATCH. STUDY. TALK.</p>
                <h1>Make room for wonder.</h1>
                <p>Enter the story. Let it speak into your day.</p>
              </div>
              <div className="erc-home-grid">
                <section
                  className="erc-feature"
                  aria-labelledby="genesis-title"
                >
                  <img
                    src="/images/readings/creation.webp"
                    alt="Sunlight opens over a river valley in an illustration of creation"
                    fetchPriority="high"
                  />
                  <div className="erc-feature-shade" />
                  <div className="erc-feature-copy">
                    <p className="erc-eyebrow">
                      <Clapperboard size={15} /> BIBLE CINEMA · GENESIS
                    </p>
                    <h2 id="genesis-title">
                      In the
                      <br />
                      <em>beginning.</em>
                    </h2>
                    <p>
                      The first story. A world of wonder.
                      <br />A journey back to where it all began.
                    </p>
                    <Link
                      className="erc-button erc-button-light"
                      to="/app/cinema/"
                    >
                      <Clapperboard size={18} /> Explore Genesis
                    </Link>
                    <span className="erc-feature-caption">
                      Cinematic chapters · films coming soon
                    </span>
                  </div>
                </section>
                <section className="erc-today">
                  <div className="erc-today-top">
                    <span className="erc-icon-box">
                      <BookOpen size={21} />
                    </span>
                    <p className="erc-eyebrow">YOUR DAILY READING</p>
                    <span>DAY {nextDay}</span>
                  </div>
                  <h2>
                    A little time.
                    <br />A lasting truth.
                  </h2>
                  <p className="erc-today-passage">
                    {AUTUMN_READINGS[nextDay - 1].passage}
                  </p>
                  <p>{AUTUMN_READINGS[nextDay - 1].notice}</p>
                  <div className="erc-progress">
                    <div>
                      <span>84-day Bible journey</span>
                      <strong>{progress.completed.length}/84</strong>
                    </div>
                    <progress value={progress.completed.length} max={84} />
                  </div>
                  <Link
                    className="erc-button erc-button-gold"
                    to={`/app/study/?day=${nextDay}`}
                  >
                    <BookOpen size={18} />{" "}
                    {progress.completed.length
                      ? "Continue reading"
                      : "Begin day 1"}
                  </Link>
                  <small>
                    {session
                      ? "Progress saved to your account"
                      : "Progress saved on this device"}
                  </small>
                </section>
              </div>
              <SectionHeading
                title="A message for your moment"
                subtitle="Watch, reflect, and bring what stays with you into a conversation."
                href="/app/watch/"
              />
              <div className="erc-media-grid erc-message-row">
                {published
                  .filter(item => item.section === "watch")
                  .slice(0, 4)
                  .map(item => (
                    <MediaCard key={item.id} item={item} />
                  ))}
              </div>
              <div className="erc-talk-banner">
                <span className="erc-icon-box">
                  <Phone size={23} />
                </span>
                <div>
                  <h2>Some things are better spoken.</h2>
                  <p>Continue your reflection with El Roi.</p>
                </div>
                <Link className="erc-button erc-button-quiet" to="/app/calls/">
                  Open Elroi Calls <ChevronRight size={17} />
                </Link>
              </div>
            </>
          )}
          {(tab === "watch" || tab === "cinema") && (
            <>
              <div className="erc-page-heading">
                <p className="erc-eyebrow">
                  {tab === "cinema"
                    ? "THE BIBLE. ON SCREEN."
                    : "MESSAGES THAT MEET YOU HERE"}
                </p>
                <h1>
                  {tab === "cinema"
                    ? "Scripture, brought to life."
                    : "Watch. Then reflect."}
                </h1>
                <p>
                  {tab === "cinema"
                    ? "A cinematic library beginning with Genesis. Each chapter stays connected to its Scripture passage."
                    : "Prayer, encouragement, and Bible reflections from El Roi Calls."}
                </p>
              </div>
              <div className="erc-library-toolbar">
                <div className="erc-segment">
                  <Link
                    to="/app/watch/"
                    aria-current={tab === "watch" ? "page" : undefined}
                  >
                    <Play size={16} /> Messages
                  </Link>
                  <Link
                    to="/app/cinema/"
                    aria-current={tab === "cinema" ? "page" : undefined}
                  >
                    <Clapperboard size={17} /> Bible Cinema
                  </Link>
                </div>
                <label className="erc-search">
                  <Search size={17} />
                  <input
                    aria-label="Search videos"
                    placeholder="Search a title or Scripture"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                  />
                </label>
              </div>
              {tab === "cinema" && (
                <div className="erc-cinema-intro">
                  <p className="erc-eyebrow">THE FIRST COLLECTION</p>
                  <h2>Genesis</h2>
                  <p>Creation. Covenant. The God who sees.</p>
                  <span>
                    {
                      matching.filter(item => item.status === "published")
                        .length
                    }{" "}
                    released ·{" "}
                    {
                      matching.filter(item => item.status === "coming_soon")
                        .length
                    }{" "}
                    coming soon
                  </span>
                </div>
              )}
              {libraryLoading && (
                <p className="erc-muted" role="status">
                  Refreshing the library…
                </p>
              )}
              <div className="erc-media-grid">
                {matching.map(item => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
              {matching.length === 0 && (
                <div className="erc-empty">
                  <Library size={32} />
                  <h2>
                    {query
                      ? "No matching videos"
                      : "The next story is on its way."}
                  </h2>
                  <p>
                    {query
                      ? "Try a Bible book, passage, or another title."
                      : "Published films will appear here as the library grows."}
                  </p>
                </div>
              )}
            </>
          )}
          {tab === "video" &&
            (active ? (
              <MediaDetail key={active.id} item={active} session={session} />
            ) : (
              <div className="erc-empty">
                <h1>
                  {libraryLoading
                    ? "Opening the story…"
                    : "This story is not available."}
                </h1>
                <Link className="erc-button erc-button-gold" to="/app/watch/">
                  Back to library
                </Link>
              </div>
            ))}
          {tab === "study" && (
            <>
              <div className="erc-page-heading">
                <p className="erc-eyebrow">FROM GENESIS TO REVELATION</p>
                <h1>Read with purpose.</h1>
                <p>
                  Your complete 84-day Bible reading plan, with a question to
                  carry into each day.
                </p>
              </div>
              <div className="erc-study-layout">
                <section className="erc-reading-panel">
                  <p className="erc-eyebrow">
                    DAY {day} · WEEK {Math.ceil(day / 7)}
                  </p>
                  <h2>{reading.passage}</h2>
                  <p className="erc-reading-concept">{reading.concept}</p>
                  <a
                    className="erc-button erc-button-gold"
                    href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(reading.passage)}&version=KJV`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <BookOpen size={18} /> Read the passage
                  </a>
                  <div className="erc-reading-prompt">
                    <span>AS YOU READ</span>
                    <p>{reading.notice}</p>
                  </div>
                  <div className="erc-reading-prompt">
                    <span>THINK ABOUT THIS</span>
                    <p>{reading.question}</p>
                  </div>
                  <button
                    className={`erc-button ${progress.completed.includes(day) ? "erc-button-completed" : "erc-button-quiet"}`}
                    disabled={progress.saving || progress.loading || !authReady}
                    onClick={() => void progress.toggle(day)}
                  >
                    <CheckCircle2 size={18} />
                    {progress.saving
                      ? "Saving…"
                      : progress.completed.includes(day)
                        ? "Reading completed"
                        : "Mark reading complete"}
                  </button>
                  {progress.error && (
                    <p role="alert" className="erc-error">
                      {progress.error}
                    </p>
                  )}
                  <StudyNote key={day} day={day} userId={session?.user.id} />
                  <Link
                    to={`/schedule/?${new URLSearchParams({ content: "bible_study", topic: reading.passage })}`}
                    className="erc-link"
                  >
                    <Phone size={17} /> Talk through this reading with El Roi
                  </Link>
                </section>
                <aside className="erc-reading-plan">
                  <div className="erc-progress">
                    <div>
                      <h2>Your reading journey</h2>
                      <strong>{progress.completed.length}/84</strong>
                    </div>
                    <progress value={progress.completed.length} max={84} />
                  </div>
                  <p className="erc-muted">
                    {session
                      ? "Synced with your account."
                      : "Saved on this device. Sign in for account progress."}
                  </p>
                  <div className="erc-days">
                    {AUTUMN_READINGS.map(item => (
                      <Link
                        to={`/app/study/?day=${item.day}`}
                        key={item.day}
                        aria-current={item.day === day ? "page" : undefined}
                        aria-label={`Day ${item.day}: ${item.passage}${progress.completed.includes(item.day) ? ", completed" : ""}`}
                        className={
                          progress.completed.includes(item.day)
                            ? "is-complete"
                            : ""
                        }
                      >
                        {progress.completed.includes(item.day) ? (
                          <Check size={16} />
                        ) : (
                          item.day
                        )}
                      </Link>
                    ))}
                  </div>
                  <Link className="erc-link" to="/explore/">
                    Explore Scripture reflections <ChevronRight size={16} />
                  </Link>
                </aside>
              </div>
            </>
          )}
          {tab === "calls" && (
            <>
              <div className="erc-page-heading">
                <p className="erc-eyebrow">THE GOD WHO SEES YOU</p>
                <h1>
                  A voice. A little space.
                  <br />A place to begin.
                </h1>
                <p>
                  Your familiar Elroi Calls experience, connected to what you
                  watch and study.
                </p>
              </div>
              <section className="erc-call-feature">
                <img
                  src="/images/autumn-valley-1280.webp"
                  alt="An autumn valley with a waterfall and mountains"
                />
                <div>
                  <p className="erc-eyebrow">EL ROI GUIDE</p>
                  <h2>
                    What is on
                    <br />
                    your heart?
                  </h2>
                  <p>
                    Start an AI-guided Bible reflection in writing or over the
                    phone.
                  </p>
                  <div className="erc-button-row">
                    <a className="erc-button erc-button-gold" href={PHONE_TEL}>
                      <Phone size={18} /> Call El Roi now
                    </a>
                    <Link className="erc-button erc-button-light" to="/begin/">
                      <MessageCircle size={18} /> Start in writing
                    </Link>
                  </div>
                </div>
              </section>
              <div className="erc-action-grid">
                <ActionCard
                  icon={CalendarDays}
                  title="At your time"
                  text="Choose your topic, voice, and time for a scheduled Bible call."
                  href="/schedule/"
                  label="Schedule a call"
                />
                <ActionCard
                  icon={BookOpen}
                  title="A guided journey"
                  text="Peace, purpose, courage, rest, and Bible foundations over seven calls."
                  href="/schedule/?journey=foundations"
                  label="Choose a journey"
                />
                <ActionCard
                  icon={Clock3}
                  title="Pick up the thread"
                  text="Return to your existing schedules, saved notes, and call history."
                  href="/account/"
                  label="Open your dashboard"
                />
              </div>
            </>
          )}
          {tab === "you" && (
            <>
              <div className="erc-page-heading">
                <p className="erc-eyebrow">YOUR SPACE</p>
                <h1>Your journey belongs here.</h1>
                <p>
                  {session
                    ? `Signed in as ${session.user.email || "an Elroi Calls member"}.`
                    : "Use your existing Elroi Calls account across the website and app."}
                </p>
              </div>
              <div className="erc-you-summary">
                <BookOpen size={29} />
                <div>
                  <strong>{progress.completed.length} of 84 readings</strong>
                  <span>
                    {session ? "Saved to your account" : "Saved on this device"}
                  </span>
                </div>
                <Link to={`/app/study/?day=${nextDay}`}>
                  Continue <ChevronRight size={18} />
                </Link>
              </div>
              <div className="erc-account-list">
                {[
                  {
                    icon: CircleUserRound,
                    title: session
                      ? "Account overview"
                      : "Sign in or create an account",
                    text: "Your existing Elroi Calls account",
                    href: session ? "/account/" : "/account/?mode=signin",
                  },
                  {
                    icon: CalendarDays,
                    title: "Scheduled calls",
                    text: "Review, manage, and pause your schedules",
                    href: "/account/?view=schedules",
                  },
                  {
                    icon: BookOpen,
                    title: "Saved notes",
                    text: "The thoughts you chose to keep from your calls",
                    href: "/account/?view=notes",
                  },
                  {
                    icon: Clock3,
                    title: "Call history",
                    text: "Return to earlier conversations",
                    href: "/account/?view=history",
                  },
                  {
                    icon: Sparkles,
                    title: "Preferences",
                    text: "Your calling number, PIN, voice, and account settings",
                    href: "/account/?view=settings",
                  },
                  {
                    icon: Crown,
                    title: "Elroi Plus",
                    text: "Membership and store purchase restoration",
                    href: "/app/membership/",
                  },
                ].map(({ icon: Icon, title, text, href }) => (
                  <Link key={title} to={href}>
                    <span className="erc-icon-box">
                      <Icon size={21} />
                    </span>
                    <div>
                      <strong>{title}</strong>
                      <span>{text}</span>
                    </div>
                    <ChevronRight size={20} />
                  </Link>
                ))}
                {editor && (
                  <Link to="/app/studio/">
                    <span className="erc-icon-box">
                      <Library size={21} />
                    </span>
                    <div>
                      <strong>Content studio</strong>
                      <span>Upload and publish Bible videos and films</span>
                    </div>
                    <ChevronRight size={20} />
                  </Link>
                )}
              </div>
            </>
          )}
          {tab === "membership" && <AppMembership userId={session?.user.id} />}
          {tab === "studio" && (
            <MediaStudio session={session} authReady={authReady} />
          )}
          {![
            "home",
            "watch",
            "cinema",
            "video",
            "study",
            "calls",
            "you",
            "membership",
            "studio",
          ].includes(tab) && (
            <div className="erc-empty">
              <h1>This page is not available.</h1>
              <Link to="/app/" className="erc-button erc-button-gold">
                Return home
              </Link>
            </div>
          )}
        </main>
        <footer className="erc-footer">
          <span>Elroi Calls · The God who sees.</span>
          <div>
            <a
              href="https://elroicall.com/privacy/"
              target="_blank"
              rel="noreferrer"
            >
              Privacy
            </a>
            <a
              href="https://elroicall.com/terms/"
              target="_blank"
              rel="noreferrer"
            >
              Terms
            </a>
          </div>
        </footer>
      </div>
      {!isAppShell() && <AppDock />}
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <div className="erc-section-heading">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <Link to={href}>
        See all <ChevronRight size={16} />
      </Link>
    </div>
  );
}
function MediaCard({ item }: { item: MediaItem }) {
  return (
    <Link className="erc-media-card" to={`/app/video/${item.slug}/`}>
      <div className="erc-media-art">
        <img src={mediaArtwork(item)} loading="lazy" alt="" />
        <span className="erc-media-category">
          {item.section === "cinema" ? "GENESIS" : item.book.toUpperCase()}
        </span>
        {item.status === "coming_soon" ? (
          <span className="erc-media-status">Coming soon</span>
        ) : (
          <>
            <span className="erc-media-play">
              <Play size={20} fill="currentColor" />
            </span>
            {item.duration_seconds > 0 && (
              <span className="erc-media-length">
                {mediaDuration(item.duration_seconds)}
              </span>
            )}
          </>
        )}
        {item.access === "member" && (
          <span className="erc-media-member">
            <Crown size={13} /> PLUS
          </span>
        )}
      </div>
      <div className="erc-media-info">
        <p>{item.passage}</p>
        <h3>{item.title}</h3>
        <span>
          {item.section === "cinema"
            ? "Cinematic Bible story"
            : "El Roi Calls · Watch & reflect"}
        </span>
      </div>
    </Link>
  );
}
function MediaDetail({
  item,
  session,
}: {
  item: MediaItem;
  session: Session | null;
}) {
  const [url, setUrl] = useState("");
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { draft, setDraft, setPrivateDraft } = useDraft();
  async function play() {
    if (opening) return;
    setOpening(true);
    setError("");
    try {
      if (item.provider === "youtube")
        setUrl(
          `https://www.youtube-nocookie.com/embed/${item.youtube_id}?playsinline=1&rel=0`
        );
      else setUrl(await getMediaPlayback(item.id));
    } catch (issue) {
      setError(
        issue instanceof Error
          ? issue.message
          : "Video playback could not start."
      );
    } finally {
      setOpening(false);
    }
  }
  function reflect() {
    const text = `I would like to reflect on ${item.passage} after exploring “${item.title}”. ${item.reflection_question}`;
    const next = [draft.trim(), text].filter(Boolean).join("\n\n");
    if (next.length > 2000) {
      setError(
        "Your existing conversation draft is full. Open it first to keep your words."
      );
      return;
    }
    if (session) setPrivateDraft(next, session.user.id);
    else setDraft(next);
    navigate("/begin/");
  }
  return (
    <>
      <Link
        className="erc-back"
        to={item.section === "cinema" ? "/app/cinema/" : "/app/watch/"}
      >
        <ArrowLeft size={17} /> Back to{" "}
        {item.section === "cinema" ? "Bible Cinema" : "Watch"}
      </Link>
      <div className="erc-detail-layout">
        <div>
          <div className="erc-player">
            {url ? (
              item.provider === "youtube" ? (
                <iframe
                  title={item.title}
                  src={url}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <video
                  controls
                  playsInline
                  autoPlay
                  src={url}
                  poster={mediaArtwork(item)}
                  onError={() =>
                    setError(
                      "Playback was interrupted. Reload the player to get a new video link."
                    )
                  }
                >
                  <track kind="captions" />
                </video>
              )
            ) : (
              <>
                <img src={mediaArtwork(item)} alt="" />
                {canPlayMedia(item) ? (
                  <button
                    disabled={opening}
                    onClick={() => void play()}
                    aria-label={`Play ${item.title}`}
                  >
                    <Play size={32} fill="currentColor" />
                    <span>
                      {opening
                        ? "Opening…"
                        : item.access === "member"
                          ? "Play member film"
                          : "Play video"}
                    </span>
                  </button>
                ) : (
                  <div className="erc-coming-soon">
                    <Clapperboard size={32} />
                    <strong>Film coming soon</strong>
                    <span>Read the passage and begin the study today.</span>
                  </div>
                )}
              </>
            )}
          </div>
          {url && item.provider === "storage" && (
            <button
              className="erc-link"
              onClick={() => {
                setUrl("");
                void play();
              }}
            >
              Reload player
            </button>
          )}
          {error && (
            <p role="alert" className="erc-error">
              {error}
            </p>
          )}
          <p className="erc-eyebrow erc-detail-kicker">
            {item.section === "cinema" ? "BIBLE CINEMA" : "EL ROI CALLS"} ·{" "}
            {item.passage}
          </p>
          <h1 className="erc-detail-title">{item.title}</h1>
          <p className="erc-detail-synopsis">{item.synopsis}</p>
          {item.section === "cinema" && (
            <p className="erc-muted">
              A cinematic interpretation connected to the passage. Read
              Scripture alongside the film.
            </p>
          )}
        </div>
        <aside className="erc-reflect-panel">
          <p className="erc-eyebrow">LET THE STORY STAY WITH YOU</p>
          <h2>
            Watch. Study.
            <br />
            Talk.
          </h2>
          <p>{item.reflection_question}</p>
          <a
            className="erc-button erc-button-gold"
            href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(item.passage)}&version=KJV`}
            target="_blank"
            rel="noreferrer"
          >
            <BookOpen size={18} /> Read the Scripture
          </a>
          {item.study_day && (
            <Link
              className="erc-button erc-button-quiet"
              to={`/app/study/?day=${item.study_day}`}
            >
              Open companion study
            </Link>
          )}
          <button className="erc-button erc-button-quiet" onClick={reflect}>
            <MessageCircle size={18} /> Reflect with El Roi
          </button>
          <Link className="erc-link" to={mediaScheduleUrl(item)}>
            <CalendarDays size={17} /> Schedule a Bible study call
          </Link>
          {item.access === "member" && (
            <Link className="erc-link" to="/app/membership/">
              <Crown size={17} /> Membership & restore purchases
            </Link>
          )}
        </aside>
      </div>
    </>
  );
}
function StudyNote({ day, userId }: { day: number; userId?: string }) {
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(userId));
  const edited = useRef(false);
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    void supabase
      .from("elroi_study_progress")
      .select("reflection")
      .eq("user_id", userId)
      .eq("day", day)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive) return;
        if (!edited.current && !error) setNote(data?.reflection || "");
        if (error)
          setMessage(
            "Your reflection could not load. Try returning to this day."
          );
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [day, userId]);
  async function save() {
    if (!userId || busy || loading) return;
    setBusy(true);
    setMessage("");
    const { error } = await supabase.rpc("save_elroi_study_progress", {
      p_day: day,
      p_reflection: note.trim(),
    });
    setMessage(
      error
        ? "Your reflection could not be saved. Try again."
        : "Reflection saved to your account."
    );
    setBusy(false);
  }
  return (
    <div className="erc-study-note">
      <label htmlFor="study-reflection">Your reflection</label>
      <textarea
        id="study-reflection"
        rows={4}
        maxLength={4000}
        placeholder="What stood out to you?"
        value={note}
        disabled={loading}
        onChange={event => {
          edited.current = true;
          setNote(event.target.value);
        }}
      />
      {userId ? (
        <button
          className="erc-button erc-button-quiet"
          disabled={busy || loading}
          onClick={() => void save()}
        >
          {busy ? "Saving…" : "Save reflection"}
        </button>
      ) : (
        <p className="erc-muted">
          <Link to="/account/?mode=signin">Sign in</Link> to save reflections to
          your account.
        </p>
      )}
      <p role="status">{message}</p>
    </div>
  );
}
function ActionCard({
  icon: Icon,
  title,
  text,
  href,
  label,
}: {
  icon: typeof Phone;
  title: string;
  text: string;
  href: string;
  label: string;
}) {
  return (
    <section className="erc-action-card">
      <span className="erc-icon-box">
        <Icon size={23} />
      </span>
      <h2>{title}</h2>
      <p>{text}</p>
      <Link to={href}>
        {label} <ChevronRight size={16} />
      </Link>
    </section>
  );
}
