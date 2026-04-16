import Link from "next/link";
import { notFound } from "next/navigation";
import { CoursesRepository } from "@/lib/courses/courses-repository";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ year: string; courseId: string }>;
}) {
  const { year, courseId } = await params;
  const course = await CoursesRepository.default().findById(courseId);
  if (!course || String(course.year) !== year) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-16 sm:px-16">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/courses" className="hover:underline">
          Courses
        </Link>
        <span className="mx-2">/</span>
        <span>{course.year}</span>
      </nav>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">{course.title}</h1>
      <p className="mb-8 text-zinc-500">{course.year}</p>

      <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
        Sections
      </h2>
      <ul className="flex flex-col gap-2">
        {course.sections.map((section) => (
          <li key={section.id}>
            <Link
              href={`/courses/${course.year}/${course.id}/${section.id}`}
              className="block rounded-md border border-black/10 px-4 py-3 hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
            >
              {section.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
