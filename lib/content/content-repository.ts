import { loadR2ConfigFromEnv, type ContentClient } from "./client";
import { R2Client } from "./r2-client";

export type ContentRef = {
  year: number | string;
  courseId: string;
  sectionId: string;
  filename: string;
};

export type StorySlide = {
  title?: string;
  text: string;
};

export type Story = {
  slides: StorySlide[];
};

export type QuizQuestion = {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
};

export type Quiz = {
  questions: QuizQuestion[];
};

export class ContentRepository {
  constructor(private readonly client: ContentClient) {}

  static buildPrefix(year: number | string, courseId: string, sectionId: string): string {
    return `${year}/${courseId}/${sectionId}/`;
  }

  static buildKey(ref: ContentRef): string {
    return `${ref.year}/${ref.courseId}/${ref.sectionId}/${ref.filename}`;
  }

  static buildStoryKey(ref: ContentRef): string {
    return `${ContentRepository.buildKey(ref)}.story.json`;
  }

  static buildQuizKey(ref: ContentRef): string {
    return `${ContentRepository.buildKey(ref)}.quiz.json`;
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
      .filter((name) => name.length > 0 && name.endsWith(".md"));
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

  async getStory(ref: ContentRef): Promise<Story | null> {
    let raw: string;
    try {
      raw = await this.client.get(ContentRepository.buildStoryKey(ref));
    } catch {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as { slides?: unknown };
      if (!parsed || !Array.isArray(parsed.slides)) return null;
      return parsed as Story;
    } catch {
      return null;
    }
  }

  async saveStory(ref: ContentRef, story: Story): Promise<void> {
    await this.client.put(
      ContentRepository.buildStoryKey(ref),
      JSON.stringify(story)
    );
  }

  async getQuiz(ref: ContentRef): Promise<Quiz | null> {
    let raw: string;
    try {
      raw = await this.client.get(ContentRepository.buildQuizKey(ref));
    } catch {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as { questions?: unknown };
      if (!parsed || !Array.isArray(parsed.questions)) return null;
      return parsed as Quiz;
    } catch {
      return null;
    }
  }

  async saveQuiz(ref: ContentRef, quiz: Quiz): Promise<void> {
    await this.client.put(
      ContentRepository.buildQuizKey(ref),
      JSON.stringify(quiz)
    );
  }

  static default(): ContentRepository {
    const config = loadR2ConfigFromEnv();
    return new ContentRepository(new R2Client(config));
  }
}
