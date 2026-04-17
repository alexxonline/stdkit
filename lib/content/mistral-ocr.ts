const MISTRAL_API_BASE = "https://api.mistral.ai/v1";

type MistralFileUploadResponse = { id: string };
type MistralSignedUrlResponse = { url: string };
type MistralOcrPage = { index?: number; markdown?: string };
type MistralOcrResponse = { pages?: MistralOcrPage[] };

export async function convertPdfToMarkdown(
  pdf: File,
  apiKey: string = process.env.MISTRAL_API_KEY ?? ""
): Promise<string> {
  if (!apiKey) throw new Error("MISTRAL_API_KEY is not set.");

  const fileId = await uploadPdf(pdf, apiKey);
  const signedUrl = await getSignedUrl(fileId, apiKey);
  const pages = await runOcr(signedUrl, apiKey);

  return pages
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((p) => (p.markdown ?? "").trim())
    .filter((md) => md.length > 0)
    .join("\n\n---\n\n");
}

async function uploadPdf(pdf: File, apiKey: string): Promise<string> {
  const form = new FormData();
  form.append("purpose", "ocr");
  form.append("file", pdf, pdf.name || "document.pdf");

  const res = await fetch(`${MISTRAL_API_BASE}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Mistral file upload failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as MistralFileUploadResponse;
  if (!data.id) throw new Error("Mistral file upload returned no id.");
  return data.id;
}

async function getSignedUrl(fileId: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `${MISTRAL_API_BASE}/files/${encodeURIComponent(fileId)}/url?expiry=24`,
    { headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" } }
  );
  if (!res.ok) {
    throw new Error(`Mistral signed url failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as MistralSignedUrlResponse;
  if (!data.url) throw new Error("Mistral signed url response missing `url`.");
  return data.url;
}

async function runOcr(documentUrl: string, apiKey: string): Promise<MistralOcrPage[]> {
  const res = await fetch(`${MISTRAL_API_BASE}/ocr`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-ocr-latest",
      document: { type: "document_url", document_url: documentUrl },
    }),
  });
  if (!res.ok) {
    throw new Error(`Mistral OCR failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as MistralOcrResponse;
  return data.pages ?? [];
}
