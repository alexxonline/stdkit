"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CoursesRepository } from "@/lib/courses/courses-repository";
import { ContentRepository } from "@/lib/content/content-repository";
import { convertPdfToMarkdown } from "@/lib/content/mistral-ocr";
import { requireSession } from "@/lib/auth";

function sanitizeFilename(raw: string, { appendMd = true } = {}): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Filename is required.");
  if (trimmed.includes("/") || trimmed.includes("\\"))
    throw new Error("Filename cannot contain slashes.");
  if (trimmed.startsWith("."))
    throw new Error("Filename cannot start with a dot.");
  if (trimmed.includes(".."))
    throw new Error("Filename cannot contain '..'.");
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f\x7f]/.test(trimmed))
    throw new Error("Filename contains invalid characters.");
  if (!appendMd) return trimmed;
  return trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
}

async function ensureSectionExists(
  year: string,
  courseId: string,
  sectionId: string
) {
  const found = await CoursesRepository.default().findSection(courseId, sectionId);
  if (!found || String(found.course.year) !== year) {
    throw new Error("Course or section not found.");
  }
}

export async function createContent(formData: FormData): Promise<void> {
  await requireSession();

  const year = String(formData.get("year") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const sectionId = String(formData.get("sectionId") ?? "");
  const filename = sanitizeFilename(String(formData.get("filename") ?? ""));
  const body = String(formData.get("body") ?? "");

  await ensureSectionExists(year, courseId, sectionId);
  await ContentRepository.default().saveContent(
    { year, courseId, sectionId, filename },
    body
  );

  revalidatePath(`/courses/${year}/${courseId}/${sectionId}`);
  redirect(
    `/courses/${year}/${courseId}/${sectionId}/${encodeURIComponent(filename)}`
  );
}

export async function updateContent(formData: FormData): Promise<void> {
  await requireSession();

  const year = String(formData.get("year") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const sectionId = String(formData.get("sectionId") ?? "");
  const filename = sanitizeFilename(String(formData.get("filename") ?? ""), {
    appendMd: false,
  });
  const body = String(formData.get("body") ?? "");

  await ensureSectionExists(year, courseId, sectionId);
  await ContentRepository.default().saveContent(
    { year, courseId, sectionId, filename },
    body
  );

  revalidatePath(`/courses/${year}/${courseId}/${sectionId}/${filename}`);
  redirect(
    `/courses/${year}/${courseId}/${sectionId}/${encodeURIComponent(filename)}`
  );
}

export async function uploadPdfContent(formData: FormData): Promise<void> {
  await requireSession();

  const year = String(formData.get("year") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const sectionId = String(formData.get("sectionId") ?? "");
  const pdf = formData.get("pdf");

  if (!(pdf instanceof File) || pdf.size === 0) {
    throw new Error("PDF file is required.");
  }
  if (pdf.type && pdf.type !== "application/pdf") {
    throw new Error("File must be a PDF.");
  }

  await ensureSectionExists(year, courseId, sectionId);

  const markdown = await convertPdfToMarkdown(pdf);
  const base = pdf.name.replace(/\.pdf$/i, "") || "document";
  const filename = sanitizeFilename(base);

  await ContentRepository.default().saveContent(
    { year, courseId, sectionId, filename },
    markdown
  );

  revalidatePath(`/courses/${year}/${courseId}/${sectionId}`);
  redirect(
    `/courses/${year}/${courseId}/${sectionId}/${encodeURIComponent(filename)}`
  );
}

export async function deleteContent(formData: FormData): Promise<void> {
  await requireSession();

  const year = String(formData.get("year") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const sectionId = String(formData.get("sectionId") ?? "");
  const filename = sanitizeFilename(String(formData.get("filename") ?? ""), {
    appendMd: false,
  });

  await ensureSectionExists(year, courseId, sectionId);
  await ContentRepository.default().deleteContent({
    year,
    courseId,
    sectionId,
    filename,
  });

  revalidatePath(`/courses/${year}/${courseId}/${sectionId}`);
  redirect(`/courses/${year}/${courseId}/${sectionId}`);
}
