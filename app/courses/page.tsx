import Link from "next/link";
import { CoursesRepository } from "@/lib/courses/courses-repository";

export const metadata = {
  title: "Courses — Study Kit",
};

export default async function CoursesPage() {
  const courses = await CoursesRepository.default().list();

  const byYear = new Map<number, typeof courses>();
  for (const course of courses) {
    const list = byYear.get(course.year) ?? [];
    list.push(course);
    byYear.set(course.year, list);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-16 sm:px-16">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Courses</h1>
      {years.length === 0 ? (
        <p className="text-zinc-500">No courses available.</p>
      ) : (
        <div className="flex flex-col gap-10">
          {years.map((year) => (
            <section key={year}>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
                {year}
              </h2>
              <ul className="flex flex-col gap-2">
                {byYear.get(year)!.map((course) => (
                  <li key={course.id}>
                    <Link
                      href={`/courses/${course.year}/${course.id}`}
                      className="block rounded-md border border-black/10 px-4 py-3 hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
                    >
                      <span className="font-medium">{course.title}</span>
                      <span className="ml-2 text-sm text-zinc-500">
                        {course.sections.length} section
                        {course.sections.length === 1 ? "" : "s"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
