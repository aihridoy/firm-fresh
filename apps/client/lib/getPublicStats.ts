import type { PublicStats } from "./api/endpoints/stats";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Server-side fetch for the homepage hero counters.
 *
 * These are public, slow-moving numbers, so they are fetched on the server and
 * cached rather than requested from the browser on every visit. That keeps the
 * hero readable even when the API is briefly unavailable: a stale cached count
 * is served instead of the request failing in the client and leaving the
 * counters blank.
 */
export async function getPublicStats(): Promise<PublicStats | null> {
  try {
    const res = await fetch(`${API_BASE}/stats`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { status: boolean; data: PublicStats };
    return body?.data ?? null;
  } catch {
    // The hero renders an em dash when this is null; a failed count must never
    // take the homepage down.
    return null;
  }
}
