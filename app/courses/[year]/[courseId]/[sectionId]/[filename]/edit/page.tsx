import Link from "next/link";
import { notFound } from "next/navigation";
import { CoursesRepository } from "@/lib/courses/courses-repository";
import { ContentRepository } from "@/lib/content/content-repository";
import { updateContent } from "@/app/actions/content";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{
    year: string;
    courseId: string;
    sectionId: string;
    filename: string;
  }>;
}) {
  const { year, courseId, sectionId, filename: rawFilename } = await params;
  const filename = decodeURIComponent(rawFilename);

  const found = await CoursesRepository.default().findSection(courseId, sectionId);
  if (!found || String(found.course.year) !== year) notFound();
  const { course, section } = found;

  let body = "";
  let loadError: string | null = null;
  try {
    body = await ContentRepository.default().getContent({
      year,
      courseId,
      sectionId,
      filename,
    });
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load content.";
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-16 sm:px-16">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/courses" className="hover:underline">
          Courses
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/courses/${course.year}/${course.id}`}
          className="hover:underline"
        >
          {course.title}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/courses/${course.year}/${course.id}/${section.id}`}
          className="hover:underline"
        >
          {section.title}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/courses/${course.year}/${course.id}/${section.id}/${encodeURIComponent(filename)}`}
          className="hover:underline"
        >
          {filename}
        </Link>
      </nav>
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Edit content</h1>

      {loadError ? (
        <p className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {loadError}
        </p>
      ) : (
        <form action={updateContent} className="flex flex-col gap-4">
          <input type="hidden" name="year" value={year} />
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="sectionId" value={sectionId} />
          <input type="hidden" name="filename" value={filename} />

          <div className="text-sm text-zinc-500">
            Filename: <span className="font-mono">{filename}</span>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Markdown</span>
            <textarea
              name="body"
              rows={18}
              required
              defaultValue={body}
              className="rounded-md border border-black/20 px-3 py-2 font-mono text-sm dark:border-white/20 dark:bg-zinc-900"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-full bg-foreground px-5 py-2 text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Save
            </button>
            <Link
              href={`/courses/${course.year}/${course.id}/${section.id}/${encodeURIComponent(filename)}`}
              className="rounded-full border border-black/20 px-5 py-2 dark:border-white/20"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
