import { useEffect } from "react";

type DocumentMeta = {
  title: string;
  description: string;
  canonical?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
};

function upsertMeta(selector: string, attributes: Record<string, string>, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => element!.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

export function useDocumentMeta({
  title,
  description,
  canonical,
  robots = "index,follow",
  ogTitle = title,
  ogDescription = description,
}: DocumentMeta) {
  useEffect(() => {
    document.title = title;
    upsertMeta('meta[name="description"]', { name: "description" }, description);
    upsertMeta('meta[name="robots"]', { name: "robots" }, robots);
    upsertMeta('meta[property="og:title"]', { property: "og:title" }, ogTitle);
    upsertMeta('meta[property="og:description"]', { property: "og:description" }, ogDescription);
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, ogTitle);
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description" }, ogDescription);

    if (canonical) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
      upsertMeta('meta[property="og:url"]', { property: "og:url" }, canonical);
    }
  }, [canonical, description, ogDescription, ogTitle, robots, title]);
}
