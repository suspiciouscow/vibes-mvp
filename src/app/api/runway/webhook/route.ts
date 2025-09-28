import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase/server";
import { createMuxAssetFromUrl, getPublicPlaybackId } from "@/lib/supabase/mux";

// If Runway signs webhooks, verify here. If not, at least check a shared secret header.
function verify(req: NextRequest) {
  const expected = process.env.RUNWAY_WEBHOOK_SECRET;
  if (!expected) return true; // last resort
  const got = req.headers.get("x-runway-signature");
  return !!got && got === expected;
}

export async function POST(req: NextRequest) {
  if (!verify(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  // Normalize fields from Runway's payload:
  const jobId = body.id || body.task_id || body.inference_id || body.job_id;
  const status = body.status || body.state; // "succeeded" | "failed" | etc.

  // Output URL location differs by model/version — check these candidates:
  const outputUrl =
    body.output?.[0]?.url ||
    body.result?.assets?.[0]?.url ||
    body.assets?.[0]?.url ||
    body.video_url ||
    null;

  if (!jobId) return NextResponse.json({ ok: true }); // ignore unknown

  const supabase = await serverSupabase();
  const { data: video } = await supabase
    .from("videos")
    .select("id")
    .eq("provider_job_id", jobId)
    .single();

  if (!video) return NextResponse.json({ ok: true });

  if (String(status).toLowerCase() !== "succeeded" || !outputUrl) {
    await supabase.from("videos").update({ status: "failed" }).eq("id", video.id);
    return NextResponse.json({ ok: true });
  }

  try {
    const asset = await createMuxAssetFromUrl(outputUrl);
    // small delay to help ensure playback id is attached
    await new Promise((r) => setTimeout(r, 1000));
    const playbackId = await getPublicPlaybackId(asset);

    await supabase
      .from("videos")
      .update({
        status: "ready",
        playback_id: playbackId ?? outputUrl, // fall back to raw url
        provider: "runway",
      })
      .eq("id", video.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    await supabase.from("videos").update({ status: "failed" }).eq("id", video.id);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
