import type { Metadata } from "next";
import type { ReactNode } from "react";
import { allContents, type Content } from "@/lib/content-data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 3) + "…";
}

// ─── Firestore REST helpers ───────────────────────────────────────────────────

const PROJECT_ID = "hidupmelampaui";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

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
  if ("mapValue" in v) return fsFieldsToObj(v.mapValue.fields);
  return undefined;
}

function fsFieldsToObj(fields: Record<string, FsValue>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, fsConvert(v)]));
}

async function fetchContentBySlug(slug: string): Promise<Content | undefined> {
  try {
    const res = await fetch(`${FIRESTORE_BASE}:runQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "contents" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "slug" },
              op: "EQUAL",
              value: { stringValue: slug },
            },
          },
          limit: 1,
        },
      }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return undefined;
    const rows = (await res.json()) as Array<{ document?: { name: string; fields: Record<string, FsValue> } }>;
    const doc = rows[0]?.document;
    if (!doc) return undefined;
    const id = doc.name.split("/").pop() ?? "";
    return { ...(fsFieldsToObj(doc.fields) as Content), id };
  } catch {
    return undefined;
  }
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getContent(slug: string): Promise<Content | undefined> {
  // Try static data first (fastest, no network)
  const staticContent = allContents.find((c) => c.slug === slug);
  if (staticContent) return staticContent;

  // Fall back to Firestore REST API (contents collection is publicly readable)
  return fetchContentBySlug(slug);
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent(slug);

  if (!content) {
    return {
      title: "Konten | Hidup Melampaui",
      description:
        "Platform pengembangan diri dan edukasi untuk membangun manusia yang stabil, bertumbuh, dan berdampak.",
    };
  }

  const rawDescription = content.description
    ? stripHtml(content.description)
    : "Platform pengembangan diri dan edukasi untuk membangun manusia yang stabil, bertumbuh, dan berdampak.";
  const description = truncate(rawDescription, 160);

  const title = `${content.title} | Hidup Melampaui`;
  const url = `https://hidupmelampaui.com/konten/${slug}`;

  // Prefer cover image, fall back to YouTube thumbnail
  const imageUrl =
    content.coverImage ??
    (content.youtubeId
      ? `https://img.youtube.com/vi/${content.youtubeId}/maxresdefault.jpg`
      : undefined);

  const images = imageUrl ? [{ url: imageUrl, alt: content.title }] : [];

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: content.title,
      description,
      url,
      siteName: "Hidup Melampaui",
      locale: "id_ID",
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

// ─── Structured data (JSON-LD) ────────────────────────────────────────────────

async function buildJsonLd(
  slug: string,
  content: Content,
): Promise<Record<string, unknown>> {
  const url = `https://hidupmelampaui.com/konten/${slug}`;
  const description = content.description ? stripHtml(content.description) : "";

  const imageUrl =
    content.coverImage ??
    (content.youtubeId
      ? `https://img.youtube.com/vi/${content.youtubeId}/maxresdefault.jpg`
      : undefined);

  const publisher = {
    "@type": "Organization",
    name: "Hidup Melampaui",
    url: "https://hidupmelampaui.com",
  };

  // HowTo schema for step-based content
  if (content.isSteppedContent && content.steps?.length) {
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: content.title,
      description,
      url,
      ...(imageUrl ? { image: { "@type": "ImageObject", url: imageUrl } } : {}),
      author: { "@type": "Person", name: content.instructor },
      publisher,
      step: content.steps.map((step, idx) => ({
        "@type": "HowToStep",
        position: idx + 1,
        name: step.title,
        text: step.description ? stripHtml(step.description) : step.title,
      })),
    };
  }

  // VideoObject schema for video content
  if (content.type === "video" && content.youtubeId) {
    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: content.title,
      description,
      url,
      embedUrl: `https://www.youtube.com/embed/${content.youtubeId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${content.youtubeId}/maxresdefault.jpg`,
      author: { "@type": "Person", name: content.instructor },
      publisher,
    };
  }

  // Article schema for everything else
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.title,
    description,
    url,
    ...(imageUrl ? { image: imageUrl } : {}),
    author: { "@type": "Person", name: content.instructor },
    publisher,
  };
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default async function KontenSlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getContent(slug);

  const jsonLd = content ? await buildJsonLd(slug, content) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
