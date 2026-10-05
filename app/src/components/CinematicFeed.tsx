import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  BookOpen,
  ChevronDown,
  Clapperboard,
  MessageCircle,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useDraft } from "@/lib/draft";
import { getMediaPlayback } from "@/lib/media-library";
import { selectCinematicFeedItems } from "@/lib/cinematic-feed";
import {
  canPlayMedia,
  mediaArtwork,
  type MediaItem,
} from "@/lib/media-model";
import "@/cinematic-feed.css";

type Props = {
  items: MediaItem[];
  userId?: string;
  nextDay: number;
  completedCount: number;
};

export default function CinematicFeed({
  items,
  userId,
  nextDay,
  completedCount,
}: Props) {
  const feedRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState("");
  const [sound, setSound] = useState(false);

  const feedItems = useMemo(
    () => selectCinematicFeedItems(items),
    [items]
  );
  const effectiveActiveId =
    activeId && feedItems.some(item => item.id === activeId)
      ? activeId
      : feedItems[0]?.id || "";

  useEffect(() => {
    const root = feedRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target instanceof HTMLElement) {
          setActiveId(visible.target.dataset.mediaId || "");
        }
      },
      { root, threshold: [0.55, 0.7, 0.85] }
    );
    root
      .querySelectorAll<HTMLElement>("[data-media-id]")
      .forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [feedItems]);

  if (!feedItems.length) {
    return (
      <section className="erc-feed-empty">
        <Clapperboard size={34} />
        <h1>The first story is being prepared.</h1>
        <p>Published Bible films and messages will appear here.</p>
        <Link className="erc-button erc-button-gold" to="/app/study/">
          <BookOpen size={17} /> Read today’s Scripture
        </Link>
      </section>
    );
  }

  return (
    <section className="erc-feed-shell" aria-label="Cinematic Scripture stories">
      <div className="erc-feed-intro">
        <div>
          <p className="erc-eyebrow">SCRIPTURE IN MOTION</p>
          <h1>Scroll through the story.</h1>
        </div>
        <Link to={`/app/study/?day=${nextDay}`}>
          Day {nextDay} · {completedCount}/84 read
        </Link>
      </div>
      <div className="erc-cinematic-feed" ref={feedRef}>
        {feedItems.map((item, index) => (
          <CinematicSlide
            key={item.id}
            item={item}
            active={item.id === effectiveActiveId}
            sound={sound}
            setSound={setSound}
            index={index}
            total={feedItems.length}
            userId={userId}
          />
        ))}
      </div>
      <div className="erc-feed-hint" aria-hidden="true">
        <ChevronDown size={17} /> Scroll for the next story
      </div>
    </section>
  );
}

function CinematicSlide({
  item,
  active,
  sound,
  setSound,
  index,
  total,
  userId,
}: {
  item: MediaItem;
  active: boolean;
  sound: boolean;
  setSound: (next: boolean) => void;
  index: number;
  total: number;
  userId?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState("");
  const [handoffError, setHandoffError] = useState("");
  const navigate = useNavigate();
  const { draft, setDraft, setPrivateDraft } = useDraft();
  const playableStorage =
    item.provider === "storage" && item.status === "published" && canPlayMedia(item);
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!active || !playableStorage || videoUrl || videoError) return;
    let alive = true;
    void getMediaPlayback(item.id)
      .then(url => {
        if (alive) setVideoUrl(url);
      })
      .catch(() => {
        if (alive)
          setVideoError("This film could not preview here. Open the full story to try again.");
      });
    return () => {
      alive = false;
    };
  }, [active, item.id, playableStorage, videoError, videoUrl]);

  useEffect(() => {
    const player = videoRef.current;
    if (!player) return;
    if (!active || reduceMotion) {
      player.pause();
      return;
    }
    void player.play().catch(() => {});
  }, [active, reduceMotion, videoUrl]);

  function askElRoi() {
    const reflection = `I’m watching “${item.title}” (${item.passage}). Help me understand this story and what it means in its biblical context.`;
    const next = [draft.trim(), reflection].filter(Boolean).join("\n\n");
    if (next.length > 2000) {
      setHandoffError(
        "Your existing conversation draft is full. Open it first so none of your words are lost."
      );
      return;
    }
    setHandoffError("");
    if (userId) setPrivateDraft(next, userId);
    else setDraft(next);
    navigate("/begin/");
  }

  return (
    <article
      className="erc-cinematic-slide"
      data-media-id={item.id}
      aria-label={`${item.title}, ${item.passage}`}
    >
      <img
        className="erc-feed-poster"
        src={mediaArtwork(item)}
        alt=""
        loading={index < 2 ? "eager" : "lazy"}
      />

      {playableStorage && videoUrl && (
        <video
          ref={videoRef}
          className="erc-feed-video"
          src={videoUrl}
          poster={mediaArtwork(item)}
          muted={!sound}
          loop
          playsInline
          preload={active ? "auto" : "metadata"}
          aria-label={`Preview of ${item.title}`}
        />
      )}

      <div className="erc-feed-shade" />

      <div className="erc-feed-topline">
        <span>
          {item.section === "cinema" ? "BIBLE CINEMA" : "ELROI CALLS"} ·{" "}
          {item.passage}
        </span>
        <span>{index + 1} / {total}</span>
      </div>

      {playableStorage && (
        <button
          type="button"
          className="erc-feed-sound"
          onClick={() => setSound(!sound)}
          aria-label={sound ? "Mute story" : "Turn story sound on"}
        >
          {sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
          <span>{sound ? "Sound on" : "Enter with sound"}</span>
        </button>
      )}

      <div className="erc-feed-copy">
        <p className="erc-feed-state">
          {item.status === "coming_soon"
            ? "FILM COMING SOON"
            : playableStorage
              ? active && videoUrl
                ? "PLAYING IN THE FEED"
                : "CINEMATIC STORY"
              : "WATCH & REFLECT"}
        </p>
        <h2>{item.title}</h2>
        <p>{item.synopsis}</p>
        {videoError && <small role="status">{videoError}</small>}
        {handoffError && <small role="alert">{handoffError}</small>}

        <div className="erc-feed-actions">
          <a
            className="erc-feed-primary"
            href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(item.passage)}&version=KJV`}
            target="_blank"
            rel="noreferrer"
          >
            <BookOpen size={18} /> Read Scripture
          </a>
          <button type="button" onClick={askElRoi}>
            <MessageCircle size={18} /> Ask El Roi
          </button>
          {item.status === "published" && (
            <Link to={`/app/video/${item.slug}/`}>
              <Play size={18} /> Full story
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
