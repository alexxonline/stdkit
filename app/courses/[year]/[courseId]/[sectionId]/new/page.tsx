import Link from "next/link";
import { notFound } from "next/navigation";
import { CoursesRepository } from "@/lib/courses/courses-repository";
import { createContent, uploadPdfContent } from "@/app/actions/content";

export default async function NewContentPage({
  params,
}: {
  params: Promise<{ year: string; courseId: string; sectionId: string }>;
}) {
  const { year, courseId, sectionId } = await params;
  const found = await CoursesRepository.default().findSection(courseId, sectionId);
  if (!found || String(found.course.year) !== year) notFound();
  const { course, section } = found;

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
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">New content</h1>

      <form
        action={uploadPdfContent}
        className="mb-10 flex flex-col gap-3 rounded-md border border-black/10 p-4 dark:border-white/10"
      >
        <input type="hidden" name="year" value={year} />
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="sectionId" value={sectionId} />

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Upload a PDF</span>
          <span className="text-xs text-zinc-500">
            Mistral OCR converts it to markdown and saves it here.
          </span>
        </div>

        <input
          type="file"
          name="pdf"
          accept="application/pdf"
          required
          className="text-sm"
        />

        <div>
          <button
            type="submit"
            className="rounded-full bg-foreground px-5 py-2 text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Upload PDF
          </button>
        </div>
      </form>

      <div className="mb-4 text-sm uppercase tracking-wider text-zinc-500">
        Or write markdown directly
      </div>

      <form action={createContent} className="flex flex-col gap-4">
        <input type="hidden" name="year" value={year} />
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="sectionId" value={sectionId} />

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Filename</span>
          <input
            type="text"
            name="filename"
            required
            placeholder="lesson-01.md"
            className="rounded-md border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-zinc-900"
          />
          <span className="text-xs text-zinc-500">
            `.md` is added automatically if missing.
          </span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Markdown</span>
          <textarea
            name="body"
            rows={18}
            required
            className="rounded-md border border-black/20 px-3 py-2 font-mono text-sm dark:border-white/20 dark:bg-zinc-900"
            placeholder={"# Title\n\nWrite your notes here..."}
          />
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-full bg-foreground px-5 py-2 text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Create
          </button>
          <Link
            href={`/courses/${course.year}/${course.id}/${section.id}`}
            className="rounded-full border border-black/20 px-5 py-2 dark:border-white/20"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
