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

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.error || "Generation failed");
        return;
      }

      setPrompt("");
      alert("Video generation started! Check the feed for updates.");
    } catch (error) {
      setLoading(false);
      alert("Failed to start generation");
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
