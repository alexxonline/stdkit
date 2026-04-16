import { loadR2ConfigFromEnv, type ContentClient } from "./client";
import { R2Client } from "./r2-client";

export type ContentRef = {
  year: number | string;
  courseId: string;
  sectionId: string;
  filename: string;
};

export class ContentRepository {
  constructor(private readonly client: ContentClient) {}

  static buildPrefix(year: number | string, courseId: string, sectionId: string): string {
    return `${year}/${courseId}/${sectionId}/`;
  }

  static buildKey(ref: ContentRef): string {
    return `${ref.year}/${ref.courseId}/${ref.sectionId}/${ref.filename}`;
  }

  async listFilenames(
    year: number | string,
    courseId: string,
    sectionId: string
  ): Promise<string[]> {
    const prefix = ContentRepository.buildPrefix(year, courseId, sectionId);
    const keys = await this.client.list(prefix);
    return keys
      .map((k) => k.slice(prefix.length))
      .filter((name) => name.length > 0);
  }

  async getContent(ref: ContentRef): Promise<string> {
    return await this.client.get(ContentRepository.buildKey(ref));
  }

  async saveContent(ref: ContentRef, body: string): Promise<void> {
    await this.client.put(ContentRepository.buildKey(ref), body);
  }

  async deleteContent(ref: ContentRef): Promise<void> {
    await this.client.delete(ContentRepository.buildKey(ref));
  }

  static default(): ContentRepository {
    const config = loadR2ConfigFromEnv();
    return new ContentRepository(new R2Client(config));
  }
}
