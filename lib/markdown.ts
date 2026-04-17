import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const FORBIDDEN_TAGS = new Set(["style", "form", "input", "button", "iframe", "object", "embed"]);

const ALLOWED_TAGS = sanitizeHtml.defaults.allowedTags.filter((tag) => !FORBIDDEN_TAGS.has(tag));

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  ...sanitizeHtml.defaults.allowedAttributes,
  "*": ["class", "id"],
  img: ["src", "alt", "title", "width", "height"],
};

export async function markdownToHtml(source: string): Promise<string> {
  const dirty = await marked.parse(source, { async: true });
  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    disallowedTagsMode: "discard",
  });
}
