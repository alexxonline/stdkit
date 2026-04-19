"use server";

import { requireSession } from "@/lib/auth";
import {
  ContentRepository,
  type ContentRef,
  type Quiz,
  type QuizQuestion,
} from "@/lib/content/content-repository";

export type QuizResult =
  | { ok: true; quiz: Quiz; cached: boolean }
  | { ok: false; error: string };

export async function getOrGenerateQuiz(
  ref: ContentRef,
  content: string
): Promise<QuizResult> {
  try {
    await requireSession();
  } catch {
    return { ok: false, error: "Unauthorized" };
  }

  const repo = ContentRepository.default();

  const cached = await repo.getQuiz(ref);
  if (cached) return { ok: true, quiz: cached, cached: true };

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
              'You are a study assistant. Create a short quiz from the user\'s study notes. Output strict JSON: {"questions":[{"question":string,"choices":[string,string,string,string],"correctIndex":number,"explanation":string}]}. Generate exactly 4 questions. Each question must have exactly 4 plausible choices. "correctIndex" is the 0-based index of the correct choice. "explanation" briefly justifies the correct answer. Use the same language as the notes.',
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
      return { ok: false, error: "No quiz returned from the model." };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ok: false, error: "Model returned invalid JSON." };
    }

    const quiz = normalizeQuiz(parsed);
    if (!quiz) {
      return { ok: false, error: "Model response was missing valid questions." };
    }

    await repo.saveQuiz(ref, quiz);
    return { ok: true, quiz, cached: false };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Request failed.",
    };
  }
}

function normalizeQuiz(value: unknown): Quiz | null {
  if (!value || typeof value !== "object") return null;
  const questionsRaw = (value as { questions?: unknown }).questions;
  if (!Array.isArray(questionsRaw)) return null;

  const questions = questionsRaw
    .map((q): QuizQuestion | null => {
      if (!q || typeof q !== "object") return null;
      const item = q as {
        question?: unknown;
        choices?: unknown;
        correctIndex?: unknown;
        explanation?: unknown;
      };
      const question =
        typeof item.question === "string" ? item.question.trim() : "";
      if (!question) return null;
      if (!Array.isArray(item.choices)) return null;
      const choices = item.choices
        .map((c) => (typeof c === "string" ? c.trim() : ""))
        .filter((c) => c.length > 0);
      if (choices.length < 2) return null;
      const correctIndex =
        typeof item.correctIndex === "number" ? item.correctIndex : -1;
      if (
        !Number.isInteger(correctIndex) ||
        correctIndex < 0 ||
        correctIndex >= choices.length
      ) {
        return null;
      }
      const explanation =
        typeof item.explanation === "string" && item.explanation.trim()
          ? item.explanation.trim()
          : undefined;
      return explanation
        ? { question, choices, correctIndex, explanation }
        : { question, choices, correctIndex };
    })
    .filter((q): q is QuizQuestion => q !== null);

  if (questions.length === 0) return null;
  return { questions };
}
