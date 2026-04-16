import { describe, expect, it } from "vitest";
import { CoursesRepository } from "./courses-repository";
import type { CoursesSource } from "./json-source";
import type { CoursesFile } from "./types";

function fakeSource(file: CoursesFile): CoursesSource {
  return {
    read: async () => file,
  };
}

const fixture: CoursesFile = {
  courses: [
    {
      id: "c-2024",
      year: 2024,
      title: "Course 2024",
      sections: [{ id: "s1", title: "Section One" }],
    },
    {
      id: "b-2025",
      year: 2025,
      title: "Beta",
      sections: [{ id: "s1", title: "Section One" }],
    },
    {
      id: "a-2025",
      year: 2025,
      title: "Alpha",
      sections: [
        { id: "intro", title: "Intro" },
        { id: "deep-dive", title: "Deep Dive" },
      ],
    },
  ],
};

describe("CoursesRepository", () => {
  it("lists courses sorted by year desc then title asc", async () => {
    const repo = new CoursesRepository(fakeSource(fixture));
    const result = await repo.list();
    expect(result.map((c) => c.id)).toEqual(["a-2025", "b-2025", "c-2024"]);
  });

  it("finds a course by id", async () => {
    const repo = new CoursesRepository(fakeSource(fixture));
    const course = await repo.findById("a-2025");
    expect(course?.title).toBe("Alpha");
  });

  it("returns null for an unknown course", async () => {
    const repo = new CoursesRepository(fakeSource(fixture));
    expect(await repo.findById("missing")).toBeNull();
  });

  it("finds a section by course and section id", async () => {
    const repo = new CoursesRepository(fakeSource(fixture));
    const result = await repo.findSection("a-2025", "deep-dive");
    expect(result?.course.id).toBe("a-2025");
    expect(result?.section.title).toBe("Deep Dive");
  });

  it("returns null when section does not belong to course", async () => {
    const repo = new CoursesRepository(fakeSource(fixture));
    expect(await repo.findSection("a-2025", "missing")).toBeNull();
  });
});
