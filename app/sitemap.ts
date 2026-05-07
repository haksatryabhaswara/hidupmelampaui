import type { MetadataRoute } from "next";
import { allContents } from "@/lib/content-data";

const BASE_URL = "https://hidupmelampaui.com";
const PROJECT_ID = "hidupmelampaui";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ─── Firestore REST helper (contents is public-read) ─────────────────────────

type FsValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { arrayValue: { values?: FsValue[] } }
  | { mapValue: { fields: Record<string, FsValue> } };

function fsConvert(v: FsValue): unknown {
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return parseInt(v.integerValue, 10);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) return (v.arrayValue.values ?? []).map(fsConvert);
  if ("mapValue" in v)
    return Object.fromEntries(
      Object.entries(v.mapValue.fields).map(([k, val]) => [k, fsConvert(val)]),
    );
  return undefined;
}

async function fetchAllSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${FIRESTORE_BASE}:runQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "contents" }],
          select: {
            fields: [{ fieldPath: "slug" }],
          },
          limit: 500,
        },
      }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{
      document?: { fields: Record<string, FsValue> };
    }>;
    return rows
      .map((r) => r.document?.fields?.slug)
      .filter((v): v is FsValue => !!v)
      .map((v) => fsConvert(v) as string)
      .filter(Boolean);
  } catch {
    return [];
  }
}

// ─── Sitemap ──────────────────────────────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static public pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/tentang`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/kontak`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/program`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/program/arsitek-kehidupan`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/program/coaching-mentoring`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/program/ekosistem`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/konten`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/scri`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/scri/36`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/scri72`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  // Collect all slugs: static first, then dynamic from Firestore
  const staticSlugs = new Set(allContents.map((c) => c.slug));
  const staticContentPages: MetadataRoute.Sitemap = allContents.map((c) => ({
    url: `${BASE_URL}/konten/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Fetch additional Firestore slugs that aren't in static data
  const firestoreSlugs = await fetchAllSlugs();
  const dynamicContentPages: MetadataRoute.Sitemap = firestoreSlugs
    .filter((s) => !staticSlugs.has(s))
    .map((s) => ({
      url: `${BASE_URL}/konten/${s}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

  return [...staticPages, ...staticContentPages, ...dynamicContentPages];
}
