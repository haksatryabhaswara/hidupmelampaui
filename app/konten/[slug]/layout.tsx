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

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getContent(slug: string): Promise<Content | undefined> {
  // Try static data first (fastest, works without env vars)
  const staticContent = allContents.find((c) => c.slug === slug);
  if (staticContent) return staticContent;

  // Fall back to Firebase Admin for dynamically created content
  try {
    const { getAdminApp } = await import("@/lib/firebase-admin");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getFirestore } = require("firebase-admin/firestore") as typeof import("firebase-admin/firestore");
    const app = getAdminApp();
    const db = getFirestore(app);
    const snap = await db
      .collection("contents")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (!snap.empty) {
      return { ...(snap.docs[0].data() as Content), id: snap.docs[0].id };
    }
  } catch {
    // Firebase Admin not configured — static fallback already returned undefined
  }

  return undefined;
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
