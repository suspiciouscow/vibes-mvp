import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase/server";
import { runwayStartJob } from "@/lib/runway";

export async function POST(req: NextRequest) {
  const supabase = await serverSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { prompt, duration_s, aspect_ratio } = await req.json().catch(() => ({}));
  if (!prompt || typeof prompt !== "string" || prompt.length < 5) {
    return NextResponse.json({ error: "invalid_prompt" }, { status: 400 });
  }

  // (Optional) very light prompt moderation
  const banned = ["gore", "explicit-phrase-1"]; // expand later
  if (banned.some((b) => prompt.toLowerCase().includes(b))) {
    return NextResponse.json({ error: "prompt_blocked" }, { status: 400 });
  }

  // Create a queued video row up front
  const { data: video, error } = await supabase
    .from("videos")
    .insert({
      owner_id: user.id,
      prompt,
      provider: "runway",
      status: "queued",
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Build our webhook URL for this deployment
  const origin = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `${new URL(req.url).origin}`;
  const webhookUrl = `${origin}/api/runway/webhook`;

  // Start Runway job
  try {
    const { jobId } = await runwayStartJob({
      prompt,
      duration_s: typeof duration_s === "number" ? duration_s : 6,
      aspect_ratio: aspect_ratio || "16:9",
      webhookUrl,
    });

    await supabase
      .from("videos")
      .update({ provider_job_id: jobId })
      .eq("id", video.id);
  } catch (e: any) {
    // Mark failed immediately if startup fails
    await supabase.from("videos").update({ status: "failed" }).eq("id", video.id);
    return NextResponse.json({ error: e.message || "runway_start_failed" }, { status: 500 });
  }

  // Return queued; feed will show when webhook flips it to 'ready'
  return NextResponse.json({ id: video.id, status: "queued" });
}
