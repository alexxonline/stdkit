import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CoursesFile } from "./types";

export interface CoursesSource {
  read(): Promise<CoursesFile>;
}

export class FileCoursesSource implements CoursesSource {
  constructor(private readonly filePath: string) {}

  async read(): Promise<CoursesFile> {
    const raw = await readFile(this.filePath, "utf8");
    return JSON.parse(raw) as CoursesFile;
  }

  static defaultPath(): string {
    return path.join(process.cwd(), "data", "courses.json");
  }
}
