import type { MetadataRoute } from "next";

const SITE = "https://botchi-one.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] =
    [
      ["", 1.0, "weekly"],
      ["/precios", 0.9, "weekly"],
      ["/prueba", 0.9, "weekly"],
      ["/preguntas", 0.8, "monthly"],
      ["/metodo", 0.8, "monthly"],
      ["/comparativa", 0.7, "monthly"],
      ["/sobre", 0.6, "monthly"],
      ["/seguridad-datos", 0.6, "monthly"],
      ["/apoyar", 0.6, "monthly"],
      ["/signup", 0.5, "monthly"],
      ["/login", 0.3, "yearly"],
      ["/privacidad", 0.3, "yearly"],
      ["/cookies", 0.3, "yearly"],
      ["/terminos", 0.3, "yearly"],
    ];
  return routes.map(([path, priority, changeFrequency]) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
