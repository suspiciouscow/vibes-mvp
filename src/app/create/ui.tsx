"use client";
import { useState } from "react";
import { browserSupabase } from "@/lib/supabase/client";

export default function CreateClient() {
  const supabase = browserSupabase();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // get user
    const { data: { user }, error: uerr } = await supabase.auth.getUser();
    if (uerr || !user) { alert("Sign in required"); setLoading(false); return; }

    // create a queued video (temporary)
    const { error } = await supabase.from("videos").insert({
      owner_id: user.id,
      prompt,
      provider: "pending",
      status: "queued"
    });
    setLoading(false);

    if (error) alert(error.message);
    else {
      setPrompt("");
      alert("Created draft video (queued). We'll hook generation next.");
    }
  };

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Create</h1>
      <form onSubmit={submit} className="space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none"
          rows={4}
          placeholder="Describe the video you want to generate…"
          required
        />
        <button disabled={loading} className="rounded-lg bg-white px-4 py-2 text-black">
          {loading ? "Saving…" : "Generate (stub)"}
        </button>
      </form>
    </div>
  );
}
