import Link from "next/link";
import { notFound } from "next/navigation";
import { CoursesRepository } from "@/lib/courses/courses-repository";
import { ContentRepository } from "@/lib/content/content-repository";
import { markdownToHtml } from "@/lib/markdown";
import { deleteContent } from "@/app/actions/content";
import { AskQuestion } from "./ask-question";

export default async function ContentViewPage({
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

  let html = "";
  let source = "";
  let loadError: string | null = null;
  try {
    source = await ContentRepository.default().getContent({
      year,
      courseId,
      sectionId,
      filename,
    });
    html = await markdownToHtml(source);
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
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-mono text-lg">{filename}</h1>
        <div className="flex gap-2">
          <Link
            href={`/courses/${course.year}/${course.id}/${section.id}/${encodeURIComponent(filename)}/edit`}
            className="rounded-full border border-black/20 px-4 py-2 text-sm dark:border-white/20"
          >
            Edit
          </Link>
          <form action={deleteContent}>
            <input type="hidden" name="year" value={year} />
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="sectionId" value={sectionId} />
            <input type="hidden" name="filename" value={filename} />
            <button
              type="submit"
              className="rounded-full border border-red-600/40 px-4 py-2 text-sm text-red-600 hover:bg-red-600/10"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      {loadError ? (
        <p className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {loadError}
        </p>
      ) : (
        <>
          <article
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <AskQuestion content={source} />
        </>
      )}
    </div>
  );
}
