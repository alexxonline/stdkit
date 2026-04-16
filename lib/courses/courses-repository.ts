import { FileCoursesSource, type CoursesSource } from "./json-source";
import type { Course, Section } from "./types";

export class CoursesRepository {
  constructor(private readonly source: CoursesSource) {}

  async list(): Promise<Course[]> {
    const { courses } = await this.source.read();
    return [...courses].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return a.title.localeCompare(b.title);
    });
  }

  async findById(courseId: string): Promise<Course | null> {
    const { courses } = await this.source.read();
    return courses.find((c) => c.id === courseId) ?? null;
  }

  async findSection(
    courseId: string,
    sectionId: string
  ): Promise<{ course: Course; section: Section } | null> {
    const course = await this.findById(courseId);
    if (!course) return null;
    const section = course.sections.find((s) => s.id === sectionId);
    if (!section) return null;
    return { course, section };
  }

  static default(): CoursesRepository {
    return new CoursesRepository(
      new FileCoursesSource(FileCoursesSource.defaultPath())
    );
  }
}
