import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export async function markdownToHtml(source: string): Promise<string> {
  const dirty = await marked.parse(source, { async: true });
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "form", "input", "button", "iframe", "object", "embed"],
    FORBID_ATTR: ["style", "srcdoc"],
  });
}
