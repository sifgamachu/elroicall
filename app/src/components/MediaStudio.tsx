import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Session } from "@supabase/supabase-js";
import { CheckCircle2, Clapperboard, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getMediaLibrary } from "@/lib/media-library";
import { MEDIA_ARTWORK, canPlayMedia, type MediaItem } from "@/lib/media-model";

function youtubeId(raw: string) {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    const id = ["youtube.com", "www.youtube.com"].includes(url.hostname)
      ? url.searchParams.get("v") || url.pathname.split("/")[2]
      : url.hostname === "youtu.be"
        ? url.pathname.slice(1)
        : null;
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return /^[a-zA-Z0-9_-]{11}$/.test(raw) ? raw : null;
  }
}
export default function MediaStudio({
  session,
  authReady,
}: {
  session: Session | null;
  authReady: boolean;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [source, setSource] = useState("youtube");
  const [access, setAccess] = useState("free");
  const [file, setFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const editor = session?.user.app_metadata.elroi_editor === true;
  useEffect(() => {
    if (!editor) return;
    let alive = true;
    void getMediaLibrary(true)
      .then(data => {
        if (alive) setItems(data);
      })
      .catch(() => {
        if (alive)
          setError(
            "The content list could not load. Reopen the studio to try again."
          );
      });
    return () => {
      alive = false;
    };
  }, [editor]);
  if (!authReady) return <p role="status">Opening the studio…</p>;
  if (!editor)
    return (
      <div className="erc-empty">
        <Clapperboard size={32} />
        <h1>Content studio</h1>
        <p>
          {session
            ? "Posting is available to the Elroi Calls publishing account."
            : "Sign in with the Elroi Calls publishing account to upload and release videos."}
        </p>
        <Link className="erc-button erc-button-gold" to="/account/?mode=signin">
          Sign in
        </Link>
      </div>
    );
  function choose(item: MediaItem | null) {
    setEditing(item);
    setSource(item?.provider || "youtube");
    setAccess(item?.access || "free");
    setFile(null);
    setError("");
    setNotice("");
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !session) return;
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const slug = String(form.get("slug") || "").trim();
    const status = String(form.get("status"));
    const video =
      source === "youtube"
        ? youtubeId(String(form.get("youtube") || ""))
        : null;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError(
        "Use lowercase words separated by hyphens for the video address."
      );
      return;
    }
    if (source === "youtube" && !video && status === "published") {
      setError("Add a valid YouTube video link before publishing.");
      return;
    }
    if (source === "youtube" && access === "member") {
      setError(
        "Public YouTube videos stay free. Upload a private MP4 for a member film."
      );
      return;
    }
    if (file && (file.size > 50 * 1024 * 1024 || file.type !== "video/mp4")) {
      setError(
        "Choose an MP4 up to 50 MB. Full length public films can use a YouTube link."
      );
      return;
    }
    let path = editing?.storage_path || null;
    if (source === "storage" && !file && !path && status === "published") {
      setError("Upload the film before publishing.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (file && source === "storage") {
        path = `videos/${crypto.randomUUID()}.mp4`;
        const upload = await supabase.storage
          .from("elroi-media")
          .upload(path, file, { contentType: "video/mp4", upsert: false });
        if (upload.error)
          throw new Error(
            "The video could not upload. Please check your connection and try again."
          );
      }
      const payload = {
        title,
        slug,
        synopsis: String(form.get("synopsis") || "").trim(),
        section: String(form.get("section")),
        book: String(form.get("book") || "").trim(),
        passage: String(form.get("passage") || "").trim(),
        artwork: String(form.get("artwork")),
        provider: source,
        youtube_id: source === "youtube" ? video : null,
        storage_path: source === "storage" ? path : null,
        duration_seconds: Number(form.get("duration")) || 0,
        status,
        access,
        reflection_question: String(form.get("question") || "").trim(),
        study_day: Number(form.get("study")) || null,
        position: Number(form.get("position")) || 0,
      };
      const result = editing
        ? await supabase
            .from("elroi_media")
            .update(payload)
            .eq("id", editing.id)
            .select()
            .single()
        : await supabase.from("elroi_media").insert(payload).select().single();
      if (result.error)
        throw new Error(
          "The catalog entry could not save. Check the required fields and use a unique video address. Uploaded files remain private."
        );
      setItems(await getMediaLibrary(true));
      setEditing(result.data as MediaItem);
      setNotice(
        status === "published"
          ? "Published. The video is now in the app library."
          : status === "coming_soon"
            ? "Saved. The library shows this story as coming soon."
            : "Draft saved. It is visible only in the studio."
      );
    } catch (issue) {
      setError(
        issue instanceof Error
          ? issue.message
          : "This change could not be saved."
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="erc-page-heading">
        <p className="erc-eyebrow">PUBLISHING ACCOUNT</p>
        <h1>Your stories. Your studio.</h1>
        <p>
          Post Bible messages and cinematic films, then connect each release to
          Scripture and a companion study.
        </p>
      </div>
      <div className="erc-studio-layout">
        <aside className="erc-studio-list">
          <button
            className="erc-button erc-button-gold"
            disabled={busy}
            onClick={() => choose(null)}
          >
            <Upload size={17} /> Add a video
          </button>
          {items.map(item => (
            <button
              key={item.id}
              disabled={busy}
              onClick={() => choose(item)}
              aria-pressed={editing?.id === item.id}
            >
              <strong>{item.title}</strong>
              <span>
                {item.section === "cinema" ? "Bible Cinema" : "Watch"} ·{" "}
                {item.status.replace("_", " ")}
                {canPlayMedia(item) ? " · ready" : ""}
              </span>
            </button>
          ))}
        </aside>
        <form
          ref={formRef}
          key={editing?.id || "new"}
          className="erc-studio-form"
          onSubmit={event => void save(event)}
        >
          <h2>{editing ? "Edit story" : "New video"}</h2>
          <label>
            Title
            <input
              name="title"
              required
              maxLength={140}
              defaultValue={editing?.title}
            />
          </label>
          <label>
            Video address
            <input
              name="slug"
              required
              maxLength={100}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="genesis-in-the-beginning"
              defaultValue={editing?.slug}
            />
          </label>
          <div className="erc-form-grid">
            <label>
              Section
              <select name="section" defaultValue={editing?.section || "watch"}>
                <option value="watch">Watch · messages</option>
                <option value="cinema">Bible Cinema · films</option>
              </select>
            </label>
            <label>
              Bible book
              <input
                name="book"
                required
                maxLength={60}
                defaultValue={editing?.book || "Genesis"}
              />
            </label>
          </div>
          <label>
            Scripture passage
            <input
              name="passage"
              required
              maxLength={160}
              placeholder="Genesis 1–2"
              defaultValue={editing?.passage}
            />
          </label>
          <label>
            Summary
            <textarea
              name="synopsis"
              required
              rows={3}
              maxLength={2000}
              defaultValue={editing?.synopsis}
            />
          </label>
          <label>
            Reflection question
            <textarea
              name="question"
              required
              rows={2}
              maxLength={500}
              defaultValue={editing?.reflection_question}
            />
          </label>
          <div className="erc-form-grid">
            <label>
              Cover artwork
              <select
                name="artwork"
                defaultValue={editing?.artwork || "creation"}
              >
                {MEDIA_ARTWORK.map(scene => (
                  <option value={scene} key={scene}>
                    {scene.replace("-", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Companion reading day
              <input
                type="number"
                name="study"
                min={1}
                max={84}
                defaultValue={editing?.study_day || ""}
              />
            </label>
          </div>
          <div className="erc-form-grid">
            <label>
              Video source
              <select
                value={source}
                onChange={event => setSource(event.target.value)}
              >
                <option value="youtube">YouTube link · public</option>
                <option value="storage">Private MP4 upload</option>
              </select>
            </label>
            <label>
              Access
              <select
                value={access}
                onChange={event => setAccess(event.target.value)}
              >
                <option value="free">Free</option>
                <option value="member">Elroi Plus</option>
              </select>
            </label>
          </div>
          {source === "youtube" ? (
            <label>
              YouTube video link
              <input
                name="youtube"
                type="text"
                placeholder="https://www.youtube.com/watch?v=…"
                defaultValue={
                  editing?.youtube_id
                    ? `https://www.youtube.com/watch?v=${editing.youtube_id}`
                    : ""
                }
              />
            </label>
          ) : (
            <label className="erc-upload">
              Film file · MP4, up to 50 MB
              <input
                type="file"
                accept="video/mp4"
                onChange={event => setFile(event.target.files?.[0] || null)}
              />
              {editing?.storage_path && (
                <span>
                  A private film is attached. Choose a file only to replace it.
                </span>
              )}
            </label>
          )}
          <div className="erc-form-grid">
            <label>
              Duration in seconds
              <input
                name="duration"
                type="number"
                min={0}
                max={21600}
                defaultValue={editing?.duration_seconds || 0}
              />
            </label>
            <label>
              Position in the library
              <input
                name="position"
                type="number"
                min={0}
                max={9999}
                defaultValue={editing?.position || 0}
              />
            </label>
          </div>
          <label>
            Release status
            <select name="status" defaultValue={editing?.status || "draft"}>
              <option value="draft">Draft · studio only</option>
              <option value="coming_soon">
                Coming soon · visible, no playback
              </option>
              <option value="published">
                Published · visible and playable
              </option>
            </select>
          </label>
          <button
            className="erc-button erc-button-gold"
            type="submit"
            disabled={busy}
          >
            {busy ? "Saving story…" : "Save release"}
          </button>
          {notice && (
            <p role="status" className="erc-success">
              <CheckCircle2 size={17} />
              {notice}
            </p>
          )}
          {error && (
            <p role="alert" className="erc-error">
              {error}
            </p>
          )}
        </form>
      </div>
    </>
  );
}
