import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function createMuxAssetFromUrl(sourceUrl: string) {
  // public playback so we can stream immediately
  const asset = await mux.video.assets.create({
    input: [{ url: sourceUrl }],
    playback_policy: ["public"],
  });
  return asset; // has id; playback_ids may be empty until ready
}

export async function getPublicPlaybackId(asset: any) {
  // asset.playback_ids might be present right away or shortly after creation
  const pb = asset.playback_ids?.find((p: any) => p.policy === "public");
  return pb?.id ?? null;
}
