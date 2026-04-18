"use server";

import { requireSession } from "@/lib/auth";
import {
  ContentRepository,
  type ContentRef,
  type Story,
  type StorySlide,
} from "@/lib/content/content-repository";

export type StoryResult =
  | { ok: true; story: Story; cached: boolean }
  | { ok: false; error: string };

export async function getOrGenerateStory(
  ref: ContentRef,
  content: string
): Promise<StoryResult> {
  try {
    await requireSession();
  } catch {
    return { ok: false, error: "Unauthorized" };
  }

  const repo = ContentRepository.default();

  const cached = await repo.getStory(ref);
  if (cached) return { ok: true, story: cached, cached: true };

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { ok: false, error: "OPENROUTER_API_KEY is not set." };

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'You are a study assistant. Summarize the user\'s study notes as a short Instagram-story-style slideshow. Output strict JSON: {"slides":[{"title":string,"text":string}]}. Provide 5 to 8 concise slides. Each "text" should be at most 2-3 short sentences readable on a phone screen. "title" is optional but recommended. Use the same language as the notes.',
          },
          {
            role: "user",
            content: `Study notes:\n\n${content}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        error: `OpenRouter error (${res.status}): ${text.slice(0, 500)}`,
      };
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (typeof raw !== "string" || !raw.trim()) {
      return { ok: false, error: "No story returned from the model." };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ok: false, error: "Model returned invalid JSON." };
    }

    const story = normalizeStory(parsed);
    if (!story) {
      return { ok: false, error: "Model response was missing valid slides." };
    }

    await repo.saveStory(ref, story);
    return { ok: true, story, cached: false };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Request failed.",
    };
  }
}

function normalizeStory(value: unknown): Story | null {
  if (!value || typeof value !== "object") return null;
  const slidesRaw = (value as { slides?: unknown }).slides;
  if (!Array.isArray(slidesRaw)) return null;

  const slides = slidesRaw
    .map((s): StorySlide | null => {
      if (!s || typeof s !== "object") return null;
      const slide = s as { title?: unknown; text?: unknown };
      const text = typeof slide.text === "string" ? slide.text.trim() : "";
      if (!text) return null;
      const title =
        typeof slide.title === "string" && slide.title.trim()
          ? slide.title.trim()
          : undefined;
      return title ? { title, text } : { text };
    })
    .filter((s): s is StorySlide => s !== null);

  if (slides.length === 0) return null;
  return { slides };
}
