"use client";
import { useState } from "react";
import { browserSupabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = browserSupabase();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (!error) setSent(true);
    else alert(error.message);
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  if (sent) return <p className="text-sm">Check your inbox for the login link.</p>;

  return (
    <div className="space-y-4 max-w-sm">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <form onSubmit={signInWithEmail} className="space-y-3">
        <input
          className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none"
          type="email" placeholder="you@email.com"
          value={email} onChange={(e)=>setEmail(e.target.value)}
        />
        <button disabled={loading} className="w-full rounded-lg bg-white px-4 py-2 text-black">
          {loading ? "Sending..." : "Send magic link"}
        </button>
      </form>
      <button onClick={signInWithGoogle} className="w-full rounded-lg border border-white/20 px-4 py-2">
        Continue with Google
      </button>
    </div>
  );
}
