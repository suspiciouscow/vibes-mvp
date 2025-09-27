"use client";
import { browserSupabase } from "@/lib/supabase/client";
import { useState } from "react";

export function LikeButton({ videoId, initiallyLiked }: { videoId: string; initiallyLiked: boolean }) {
  const supabase = browserSupabase();
  const [liked, setLiked] = useState(initiallyLiked);

  const toggle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Sign in required");
    if (!liked) {
      await supabase.from("likes").insert({ user_id: user.id, video_id: videoId });
      setLiked(true);
    } else {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("video_id", videoId);
      setLiked(false);
    }
  };

  return (
    <button onClick={toggle} className="text-sm rounded-lg border border-white/10 px-2 py-1">
      {liked ? "♥️ Liked" : "♡ Like"}
    </button>
  );
}
