// lib/runway.ts
// Minimal adapter around Runway's video generation API.
// Swap MODEL + payload keys to match the current Runway docs for your account.

type StartOpts = {
  prompt: string;
  duration_s?: number;     // keep short to control cost (e.g. 5–8)
  aspect_ratio?: "16:9" | "9:16" | "1:1";
  webhookUrl: string;      // we'll pass our callback url
};

export async function runwayStartJob(opts: StartOpts) {
  const apiKey = process.env.RUNWAY_API_KEY!;
  if (!apiKey) throw new Error("Missing RUNWAY_API_KEY");

  // ▼ Replace this with your current Runway endpoint for the model you use.
  // Example shape; do not assume this exact path—check your Runway docs/dashboard.
  const url = "https://api.runwayml.com/v1/inferences";

  // ▼ Adjust payload to the model you selected
  const payload = {
    // model name or type can vary by account
    model: process.env.RUNWAY_MODEL || "gen-3.5",

    // Generation params — map to Runway's accepted fields
    input: {
      prompt: opts.prompt,
      duration: opts.duration_s ?? 6,
      aspect_ratio: opts.aspect_ratio ?? "16:9",
      // Optional: negative_prompt, seed, guidance, motion, camera, fps, etc.
    },

    // Ask Runway to notify us when done
    webhook: {
      url: opts.webhookUrl,
      // If Runway supports headers, add a secret for verification:
      headers: { "x-runway-signature": process.env.RUNWAY_WEBHOOK_SECRET! }
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Runway start failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  // ▼ Normalize whichever id Runway returns to track the job
  // (could be `id`, `task_id`, etc.)
  const jobId = data.id || data.task_id || data.inference_id;
  if (!jobId) throw new Error("Runway response missing job id");

  return { jobId, raw: data };
}

// Optional helper if you want to poll instead of webhooks
export async function runwayGetJob(jobId: string) {
  const apiKey = process.env.RUNWAY_API_KEY!;
  const url = `https://api.runwayml.com/v1/inferences/${jobId}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Runway get failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  // Normalize status + output URL(s)
  // Typical statuses: "queued" | "processing" | "succeeded" | "failed"
  const status: "queued" | "processing" | "succeeded" | "failed" =
    data.status || data.state || "processing";

  // Output might be `data.output[0].url` or `data.result.assets[0].url` etc.
  const outputUrl =
    data.output?.[0]?.url ||
    data.result?.assets?.[0]?.url ||
    data.assets?.[0]?.url ||
    null;

  return { status, outputUrl, raw: data };
}
