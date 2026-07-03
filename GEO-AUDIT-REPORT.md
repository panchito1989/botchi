# GEO + SEO Audit — Botchi

**Sitio:** https://botchi-one.vercel.app
**Fecha:** 2026-05-19
**Tipo de negocio:** Hardware + SaaS educativo (dispositivo mentor IA para niños/jóvenes + plataforma para padres). Español, México.

---

## Puntaje GEO compuesto: **26 / 100** — Crítico (base sólida, capa de visibilidad ausente)

| Categoría | Peso | Puntaje | Estado |
|---|---|---|---|
| AI Citability & Visibility | 25% | 34 | Pobre |
| Brand Authority Signals | 20% | 6 | Crítico |
| Content Quality & E-E-A-T | 20% | 24 | Crítico |
| Technical Foundations | 15% | 58 | Regular |
| Structured Data | 10% | 8 | Crítico |
| Platform Optimization | 10% | 24 | Crítico |
| **Compuesto** | 100% | **26** | **Crítico** |

**Lectura honesta:** el sitio está técnicamente bien construido (Next.js SSR — los crawlers de IA ven todo el contenido en el HTML). El problema no es la base, es que **falta toda la capa de descubrimiento e identidad**: no hay robots.txt, sitemap, llms.txt, datos estructurados, ni contenido citable, ni presencia de marca externa. Para una marca nueva esto es normal — y todo lo pendiente es **aditivo y de alto apalancamiento**.

---

## Hallazgos críticos (los que más duelen)

1. **[Crítico] Cero identidad de entidad.** "Botchi" no existe para los modelos de IA: sin Wikipedia/Wikidata, sin LinkedIn, sin schema Organization, sin `sameAs`. Además el nombre choca con resultados de Pokémon. Los modelos no pueden reconocer ni citar la marca. (Brand Authority 6/100.)
2. **[Crítico] Cero datos estructurados (JSON-LD).** Ni Organization, ni Product, ni WebSite, ni FAQ. La IA tiene que adivinar todo desde prosa de marketing. (Schema 8/100.)
3. **[Crítico] Contenido no citable.** ~1,300 palabras en todo el sitio, casi todo eslóganes. No hay respuestas autocontenidas a preguntas reales ("¿Qué es Botchi?", "¿Es seguro para niños?", "¿En qué se diferencia de ChatGPT?"). (Content 24/100.)
4. **[Crítico] No hay robots.txt, sitemap.xml ni llms.txt.** El acceso funciona por defecto, pero no hay guía para crawlers ni descubrimiento de páginas.
5. **[Alto] Dominio `botchi-one.vercel.app`.** Subdominio tipo preview: diluye marca y confianza, limita autoridad de ranking, puede cambiar/deindexarse. Riesgo estratégico.
6. **[Alto] Sin Open Graph/Twitter, sin canonical, títulos duplicados** en /apoyar /signup /login. Mal unfurl en WhatsApp/X y señales débiles.
7. **[Alto] Sin identidad de autor.** Christian Fiesco se menciona de pasada; sin bio/credenciales/about → falla E-E-A-T en un tema YMYL (niños).

---

## Plan de acción priorizado

### 🟢 Quick Wins — alto impacto, se hacen en código ya (Next.js)
1. `app/robots.ts` + `app/sitemap.ts` → robots.txt (permitir GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended, Bing) + sitemap de las 8 rutas públicas.
2. `/llms.txt` (+ `/llms-full.txt`) describiendo Botchi y enlazando secciones clave (en español).
3. **JSON-LD** en el layout: `Organization` (founder Christian Fiesco, "Hecho en México"), `Product`/`SoftwareApplication`, `WebSite`+`SearchAction`, `BreadcrumbList`.
4. **Metadata por página**: `title`/`description` únicos + `canonical` autoreferente + `openGraph`/`twitter` + `og:image`, `locale: es_MX`.
5. **Sección FAQ en español** en `/` + página `/preguntas` con preguntas reales como H2 y respuestas directas de 40–60 palabras (+ `FAQPage` JSON-LD).
6. **Ampliar `/prueba` y `/apoyar`** con 300–500 palabras citables (cómo funciona el demo, ejemplo de diálogo socrático).
7. Headers de seguridad (`CSP`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) vía `next.config`.

### 🟡 Mediano plazo — contenido y dominio
8. Páginas `/sobre` (founder + credenciales + Person schema), `/metodo` (explicador del método socrático, 800–1,200 palabras con ejemplos), `/seguridad-datos` (qué datos se recopilan, control parental — sustenta los claims YMYL).
9. Tabla comparativa "Botchi vs. tablets vs. apps educativas" con fechas visibles.
10. **Dominio propio** (ej. botchi.mx) + `metadataBase` + redirección 308 del vercel.app.

### 🔴 Estratégico — presencia externa (lo haces tú, no es código)
11. Crear footprint de entidad: LinkedIn de empresa, Wikidata, Product Hunt/Crunchbase, canal de YouTube con el demo de `/prueba`, y 2–3 menciones en prensa edu/tech mexicana. **Es la palanca #1 para que la IA reconozca y cite la marca.**

---

## Notas
- Core Web Vitals: estimación estática (bien: edge-cache, fuente precargada). Confirmar costo del widget de voz de `/prueba` con PageSpeed Insights cuando haya dominio propio.
- Validar todo el JSON-LD con Google Rich Results Test tras implementarlo.
- FAQPage: Google restringió su rich result, pero sigue teniendo alto valor semántico para motores de IA.
