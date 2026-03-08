import { useEffect } from "react";

interface SEOProps {
  title?: string;
  fullTitle?: boolean;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  locale?: string;
  lang?: string;
}

function setMetaTag(property: string, content: string, isName = false) {
  const attr = isName ? "name" : "property";
  let el = document.querySelector(`meta[${attr}="${property}"]`);
  if (el) {
    el.setAttribute("content", content);
  } else {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    el.setAttribute("content", content);
    document.head.appendChild(el);
  }
}

function setCanonical(url: string) {
  const baseUrl = window.location.origin;
  const absoluteUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (el) {
    el.href = absoluteUrl;
  } else {
    el = document.createElement("link");
    el.rel = "canonical";
    el.href = absoluteUrl;
    document.head.appendChild(el);
  }
}

const langMap: Record<string, string> = {
  pt: "pt",
  en: "en",
  fr: "fr",
  es: "es",
  de: "de",
};

const localeMap: Record<string, string> = {
  pt: "pt_PT",
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
};

const defaultTitle = "Snowman - Banda de Rock Progressivo de Portugal";
const defaultDescription = "Snowman é uma banda de rock progressivo de Portugal. Descobre a nossa música, próximos concertos, notícias e loja oficial.";
const defaultImage = "/og-image.png";

export function useSEO({ title, fullTitle = false, description, image, url, type = "website", locale, lang }: SEOProps) {
  useEffect(() => {
    const pageTitle = fullTitle ? (title || defaultTitle) : (title ? `${title} | Snowman` : defaultTitle);
    const desc = description || defaultDescription;
    const baseUrl = window.location.origin;
    const img = (image || defaultImage).startsWith("http") ? (image || defaultImage) : `${baseUrl}${image || defaultImage}`;
    const pageUrl = url || window.location.pathname;
    const absoluteUrl = pageUrl.startsWith("http") ? pageUrl : `${baseUrl}${pageUrl}`;

    document.title = pageTitle;

    if (lang) {
      document.documentElement.lang = langMap[lang] || lang;
    }

    setMetaTag("description", desc, true);

    setMetaTag("og:title", pageTitle);
    setMetaTag("og:description", desc);
    setMetaTag("og:type", type);
    setMetaTag("og:image", img);
    setMetaTag("og:url", absoluteUrl);
    setMetaTag("og:locale", locale || localeMap[lang || "pt"] || "pt_PT");

    setMetaTag("twitter:title", pageTitle, true);
    setMetaTag("twitter:description", desc, true);
    setMetaTag("twitter:image", img, true);

    setCanonical(pageUrl);

    return () => {
      document.title = defaultTitle;
      document.documentElement.lang = "pt";
      setMetaTag("description", defaultDescription, true);
      setMetaTag("og:title", defaultTitle);
      setMetaTag("og:description", defaultDescription);
      setMetaTag("og:type", "website");
      setMetaTag("og:image", `${baseUrl}${defaultImage}`);
      setMetaTag("og:url", baseUrl);
      setMetaTag("og:locale", "pt_PT");
      setMetaTag("twitter:title", defaultTitle, true);
      setMetaTag("twitter:description", defaultDescription, true);
      setMetaTag("twitter:image", `${baseUrl}${defaultImage}`, true);
      setCanonical("/");
    };
  }, [title, fullTitle, description, image, url, type, locale, lang]);
}
