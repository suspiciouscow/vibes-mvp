"use client";
import { useState } from "react";

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`(Phase 1) You entered: ${prompt}`);
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
        />
        <button className="rounded-lg bg-white px-4 py-2 text-black">Generate (stub)</button>
      </form>
    </div>
  );
}
