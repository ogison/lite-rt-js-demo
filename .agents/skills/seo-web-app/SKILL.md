---
name: seo-web-app
description: Use this skill when designing, implementing, or reviewing SEO-friendly web applications. This includes SSR, SSG, metadata, canonical URLs, structured data, Core Web Vitals, sitemap.xml, robots.txt, internal links, semantic HTML, accessibility, and JavaScript SEO for frameworks such as Next.js, Nuxt, React, Vue, Astro, and similar web app frameworks.
---

# SEO Web App Skill

You are an expert in technical SEO, web performance, and modern web application architecture.

Your goal is to help build web applications that are easy for search engines to crawl, render, understand, index, and rank, while also providing a fast and accessible user experience.

Do not treat SEO as an afterthought. SEO requirements should influence routing, rendering strategy, metadata, content structure, internal linking, performance, and deployment behavior.

---

## Core Principles

When designing, implementing, or reviewing a web application, follow these principles:

1. Important indexable content must be available in the initial HTML whenever possible.
2. Prefer SSR, SSG, ISR, prerendering, or server-rendered routes for SEO-critical pages.
3. Avoid relying only on client-side rendering for primary content.
4. Every indexable page must have unique and relevant metadata.
5. Use clean, descriptive, stable URLs.
6. Use semantic HTML and accessible markup.
7. Use structured data when it helps search engines understand the page.
8. Optimize Core Web Vitals.
9. Create useful internal links between related pages.
10. Avoid duplicate, thin, or low-value indexable pages.

---

## Rendering Strategy

For each page, choose the rendering strategy based on SEO value and data freshness.

### Use SSG or prerendering when:

- The page content is public and relatively stable.
- The page targets organic search traffic.
- The content can be generated at build time.
- The page represents articles, landing pages, documentation, product pages, categories, or static marketing pages.

### Use SSR when:

- The page is public and SEO-relevant.
- The content changes frequently.
- The page needs fresh server-side data.
- The content should still be present in the server-rendered HTML.

### Use CSR only when:

- The page is behind authentication.
- The page is a dashboard, admin panel, or user-specific interface.
- The page does not need to be indexed.
- The primary content is not intended for search traffic.

Avoid rendering important SEO content only after `useEffect`, client-side API calls, or browser-only state initialization.

---

## JavaScript SEO Rules

Search engines can process JavaScript, but SEO-critical content should not depend entirely on client-side execution.

Follow these rules:

- Do not hide primary content behind client-only rendering.
- Do not require user interaction to reveal indexable content.
- Do not depend on infinite scroll without crawlable links or paginated URLs.
- Ensure links use real anchor elements with valid `href` values.
- Avoid button-only navigation for crawlable pages.
- Make sure important text, headings, links, and structured data are present after server render whenever possible.
- Avoid blocking important content with loading spinners in the initial HTML.

Bad pattern:

```tsx
useEffect(() => {
  fetchPost().then(setPost);
}, []);

return post ? <Article post={post} /> : <Loading />;
```
