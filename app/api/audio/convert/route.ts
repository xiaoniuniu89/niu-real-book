import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import { isAppleLossless } from "@/lib/audioFile";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const run = promisify(execFile);
const BUCKETS: Record<string, string> = { original_recordings: "original-recordings", setlist_recordings: "setlist-recordings" };

// POST /api/audio/convert  { table, path }  ->  { path, mime, size }
// Needs "Authorization: Bearer <supabase access token>". Swaps your own Apple Lossless recording for an AAC copy.
// Everything runs as you, so the database rules still decide; only Apple Lossless files ever reach ffmpeg.
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!url || !anon || !token) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const sb = createClient(url, anon, { global: { headers: { Authorization: "Bearer " + token } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: u, error: ue } = await sb.auth.getUser(token);
  if (ue || !u.user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const b = await req.json().catch(() => null) as { table?: unknown; path?: unknown } | null;
  const table = String(b?.table ?? ""), path = String(b?.path ?? ""), bucket = BUCKETS[table];
  const [owner, folder] = path.split("/");
  if (!bucket || owner !== u.user.id || !folder) return NextResponse.json({ error: "That isn't your recording." }, { status: 403 });
  const { data: rows, error: re } = await sb.from(table).select("id").eq("path", path).eq("owner", u.user.id);
  if (re || !rows?.length) return NextResponse.json({ error: "That isn't your recording." }, { status: 403 });

  const { data: blob, error: de } = await sb.storage.from(bucket).download(path);
  if (de || !blob) return NextResponse.json({ error: "Couldn't read that recording." }, { status: 502 });
  const input = new Uint8Array(await blob.arrayBuffer());
  if (!isAppleLossless(input)) return NextResponse.json({ error: "That recording doesn't need converting." }, { status: 400 });
  if (!ffmpegPath) return NextResponse.json({ error: "Converting isn't set up here." }, { status: 503 });

  const dir = await mkdtemp(join(tmpdir(), "niu-audio-"));
  try {
    const from = join(dir, "in.m4a"), to = join(dir, "out.m4a");
    await writeFile(from, input);
    await run(ffmpegPath, ["-hide_banner", "-nostdin", "-protocol_whitelist", "file", "-i", from, "-map", "0:a:0", "-vn", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-f", "ipod", to], { timeout: 100_000 });
    const out = await readFile(to);
    const next = `${owner}/${folder}/${crypto.randomUUID()}-playable.m4a`, mime = "audio/mp4";
    // the row names the new path first, because an upload has to match a row of yours
    const { data: moved, error: me } = await sb.from(table).update({ path: next, mime, size: out.length }).eq("path", path).select("id");
    if (me || !moved?.length) throw new Error("couldn't update the row");
    const { error: pe } = await sb.storage.from(bucket).upload(next, out, { contentType: mime });
    if (pe) {
      await sb.from(table).update({ path, mime: "audio/x-m4a", size: input.length }).eq("path", next);
      throw new Error("couldn't store the copy");
    }
    await sb.storage.from(bucket).remove([path]);
    return NextResponse.json({ path: next, mime, size: out.length });
  } catch (e) {
    console.warn("audio convert failed: " + (e instanceof Error ? e.message.slice(0, 200) : "unknown"));
    return NextResponse.json({ error: "Couldn't make a playable copy." }, { status: 502 });
  } finally { await rm(dir, { recursive: true, force: true }); }
}
