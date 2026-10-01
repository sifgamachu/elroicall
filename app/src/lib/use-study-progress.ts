import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const GUEST_KEY = "elroi-app-guest-study-v1";
function guestProgress() {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
    return Array.isArray(raw)
      ? raw.filter(
          (day): day is number => Number.isInteger(day) && day >= 1 && day <= 84
        )
      : [];
  } catch {
    return [];
  }
}
export function useStudyProgress(userId: string | undefined) {
  const [completed, setCompleted] = useState<number[]>(() =>
    userId ? [] : guestProgress()
  );
  const [loading, setLoading] = useState(Boolean(userId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    void supabase
      .from("elroi_study_progress")
      .select("day")
      .eq("user_id", userId)
      .eq("completed", true)
      .then(({ data, error }) => {
        if (!alive) return;
        if (error)
          setError("Your reading progress could not sync. Please try again.");
        else setCompleted((data || []).map(item => item.day));
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [userId]);
  async function toggle(day: number) {
    if (saving || loading) return;
    const checked = !completed.includes(day);
    const next = checked
      ? [...completed, day]
      : completed.filter(value => value !== day);
    setSaving(true);
    setError("");
    try {
      if (userId) {
        const { error } = await supabase.rpc("save_elroi_study_progress", {
          p_day: day,
          p_completed: checked,
        });
        if (error) throw error;
      } else localStorage.setItem(GUEST_KEY, JSON.stringify(next));
      setCompleted(next);
    } catch {
      setError("This change could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }
  return { completed, loading, saving, error, toggle };
}
