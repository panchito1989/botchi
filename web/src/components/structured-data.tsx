const SITE = "https://botchi-one.vercel.app";

// Server-rendered JSON-LD so AI engines can resolve Botchi as an entity.
const GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#org`,
      name: "Botchi",
      url: SITE,
      description:
        "Botchi es un dispositivo mentor educativo con IA para niños y jóvenes, con una plataforma web para padres. Enseña con el método socrático.",
      inLanguage: "es-MX",
      areaServed: "MX",
      founder: { "@type": "Person", name: "Christian Fiesco" },
      slogan: "Aprende sin sentir que estudias.",
      sameAs: [
        "https://www.linkedin.com/in/botchi-for-kids/",
        "https://www.youtube.com/@Botchiforkids",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      name: "Botchi",
      url: SITE,
      inLanguage: "es-MX",
      publisher: { "@id": `${SITE}/#org` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": ["Product", "SoftwareApplication"],
      "@id": `${SITE}/#product`,
      name: "Botchi",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Dispositivo dedicado + plataforma web",
      description:
        "Dispositivo mentor con IA que acompaña el aprendizaje de niños y adolescentes (6–25+) usando el método socrático, con panel web para que los padres personalicen y supervisen el progreso.",
      inLanguage: "es-MX",
      brand: { "@id": `${SITE}/#org` },
      url: SITE,
      audience: {
        "@type": "PeopleAudience",
        audienceType: "Padres y madres de familia",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "MXN",
        availability: "https://schema.org/PreOrder",
        areaServed: "MX",
      },
    },
  ],
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(GRAPH) }}
    />
  );
}
