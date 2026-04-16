"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CoursesRepository } from "@/lib/courses/courses-repository";
import { ContentRepository } from "@/lib/content/content-repository";

function sanitizeFilename(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Filename is required.");
  if (trimmed.includes("/") || trimmed.includes("\\"))
    throw new Error("Filename cannot contain slashes.");
  if (trimmed.startsWith("."))
    throw new Error("Filename cannot start with a dot.");
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
  const year = String(formData.get("year") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const sectionId = String(formData.get("sectionId") ?? "");
  const filename = String(formData.get("filename") ?? "");
  const body = String(formData.get("body") ?? "");

  if (!filename) throw new Error("Filename is required.");
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

export async function deleteContent(formData: FormData): Promise<void> {
  const year = String(formData.get("year") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const sectionId = String(formData.get("sectionId") ?? "");
  const filename = String(formData.get("filename") ?? "");

  if (!filename) throw new Error("Filename is required.");
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
