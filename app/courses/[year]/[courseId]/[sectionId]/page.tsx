import Link from "next/link";
import { notFound } from "next/navigation";
import { CoursesRepository } from "@/lib/courses/courses-repository";
import { ContentRepository } from "@/lib/content/content-repository";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ year: string; courseId: string; sectionId: string }>;
}) {
  const { year, courseId, sectionId } = await params;
  const found = await CoursesRepository.default().findSection(courseId, sectionId);
  if (!found || String(found.course.year) !== year) notFound();
  const { course, section } = found;

  let filenames: string[] = [];
  let listError: string | null = null;
  try {
    filenames = await ContentRepository.default().listFilenames(
      year,
      courseId,
      sectionId
    );
  } catch (e) {
    listError = e instanceof Error ? e.message : "Failed to list content.";
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
      </nav>
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">{section.title}</h1>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Content
        </h2>
        <Link
          href={`/courses/${course.year}/${course.id}/${section.id}/new`}
          className="rounded-full bg-foreground px-4 py-2 text-sm text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          New content
        </Link>
      </div>

      {listError && (
        <p className="mb-4 rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {listError}
        </p>
      )}

      {filenames.length === 0 && !listError ? (
        <p className="text-zinc-500">No content yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filenames.map((filename) => (
            <li key={filename}>
              <Link
                href={`/courses/${course.year}/${course.id}/${section.id}/${encodeURIComponent(filename)}`}
                className="block rounded-md border border-black/10 px-4 py-3 font-mono text-sm hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
              >
                {filename}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
