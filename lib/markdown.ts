import { marked } from "marked";

export async function markdownToHtml(source: string): Promise<string> {
  return await marked.parse(source, { async: true });
}
