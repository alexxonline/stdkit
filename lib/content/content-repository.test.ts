import { describe, expect, it } from "vitest";
import { ContentRepository } from "./content-repository";
import type { ContentClient } from "./client";

class FakeContentClient implements ContentClient {
  public store = new Map<string, string>();
  public lastListPrefix: string | null = null;
  public deleted: string[] = [];

  async list(prefix: string): Promise<string[]> {
    this.lastListPrefix = prefix;
    return [...this.store.keys()].filter((k) => k.startsWith(prefix));
  }
  async get(key: string): Promise<string> {
    const v = this.store.get(key);
    if (v === undefined) throw new Error(`Not found: ${key}`);
    return v;
  }
  async put(key: string, body: string): Promise<void> {
    this.store.set(key, body);
  }
  async delete(key: string): Promise<void> {
    this.store.delete(key);
    this.deleted.push(key);
  }
}

describe("ContentRepository", () => {
  it("builds keys in {year}/{course}/{section}/{filename} format", () => {
    expect(
      ContentRepository.buildKey({
        year: 2025,
        courseId: "intro",
        sectionId: "algorithms",
        filename: "lesson-01.md",
      })
    ).toBe("2025/intro/algorithms/lesson-01.md");
  });

  it("builds prefixes with trailing slash", () => {
    expect(ContentRepository.buildPrefix(2025, "intro", "algo")).toBe(
      "2025/intro/algo/"
    );
  });

  it("lists only filenames under the section prefix", async () => {
    const client = new FakeContentClient();
    client.store.set("2025/intro/algo/a.md", "A");
    client.store.set("2025/intro/algo/b.md", "B");
    client.store.set("2025/intro/data/c.md", "C");
    client.store.set("2024/intro/algo/x.md", "X");

    const repo = new ContentRepository(client);
    const files = await repo.listFilenames(2025, "intro", "algo");

    expect(client.lastListPrefix).toBe("2025/intro/algo/");
    expect(files.sort()).toEqual(["a.md", "b.md"]);
  });

  it("saves and reads content", async () => {
    const client = new FakeContentClient();
    const repo = new ContentRepository(client);
    const ref = {
      year: 2025,
      courseId: "intro",
      sectionId: "algo",
      filename: "lesson.md",
    };
    await repo.saveContent(ref, "# hello");
    expect(await repo.getContent(ref)).toBe("# hello");
    expect(client.store.get("2025/intro/algo/lesson.md")).toBe("# hello");
  });

  it("deletes content by key", async () => {
    const client = new FakeContentClient();
    client.store.set("2025/intro/algo/lesson.md", "x");
    const repo = new ContentRepository(client);
    await repo.deleteContent({
      year: 2025,
      courseId: "intro",
      sectionId: "algo",
      filename: "lesson.md",
    });
    expect(client.deleted).toEqual(["2025/intro/algo/lesson.md"]);
    expect(client.store.has("2025/intro/algo/lesson.md")).toBe(false);
  });
});
