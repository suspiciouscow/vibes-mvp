import { serverSupabase } from "@/lib/supabase/server";
import { LikeButton } from "@/components/LikeButton";

type Row = {
  id: string;
  prompt: string;
  playback_id: string | null;
  created_at: string;
  profiles: { username: string | null; avatar_url: string | null } | null;
  like_count: number;
  user_liked: boolean;
};

export default async function FeedPage() {
  const supabase = await serverSupabase();

  // Fetch latest 25 ready videos + like counts + owner profile
  const { data, error } = await supabase.rpc("get_feed"); // we'll add rpc below
  if (error) {
    console.error(error);
    return <p>Failed to load feed.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Feed</h1>
      {(!data || data.length === 0) && (
        <p className="text-sm text-white/70">No videos yet — generate one on the Create page.</p>
      )}
      {data?.map((v: Row) => (
        <article key={v.id} className="rounded-xl border border-white/10 p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <div className="size-6 rounded-full bg-white/10" />
            <span>{v.profiles?.username ?? "anon"}</span>
            <span className="ml-auto">{new Date(v.created_at).toLocaleString()}</span>
          </div>
          <p className="text-white/90">{v.prompt}</p>
          {v.playback_id ? (
            v.playback_id.startsWith("http")
              ? (
                <video controls playsInline className="w-full rounded-lg border border-white/10" src={v.playback_id}/>
              )
              : (
                // treat as Mux playback id
                <mux-player
                  stream-type="on-demand"
                  playback-id={v.playback_id}
                  class="w-full rounded-lg border border-white/10"
                  muted
                  playsinline
                  controls
                />
              )
          ) : null}
          <div className="flex items-center gap-2">
            <LikeButton videoId={v.id} initiallyLiked={v.user_liked} />
            <span className="text-sm text-white/70">❤️ {v.like_count}</span>
          </div>
        </article>
      ))}
    </div>
  );
}