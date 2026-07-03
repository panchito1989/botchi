import type { MetadataRoute } from "next";

const SITE = "https://botchi-one.vercel.app";

// Explicitly welcome AI search crawlers (GEO) + classic crawlers.
export default function robots(): MetadataRoute.Robots {
  const aiBots = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-Web",
    "PerplexityBot",
    "Google-Extended",
    "Applebot-Extended",
    "Bingbot",
    "Amazonbot",
    "Bytespider",
  ];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/botchi", "/api"] },
      ...aiBots.map((ua) => ({ userAgent: ua, allow: "/" })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
