"use server";

import { requireSession } from "@/lib/auth";

export type AskResult =
  | { ok: true; answer: string }
  | { ok: false; error: string };

export async function askQuestion(
  content: string,
  question: string
): Promise<AskResult> {
  try {
    await requireSession();
  } catch {
    return { ok: false, error: "Unauthorized" };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { ok: false, error: "OPENROUTER_API_KEY is not set." };

  const trimmed = question.trim();
  if (!trimmed) return { ok: false, error: "Question is required." };

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it",
        messages: [
          {
            role: "system",
            content:
              "You are a study assistant. Answer the user's question using the provided study notes as context. If the answer is not in the notes, say so plainly.",
          },
          {
            role: "user",
            content: `Study notes:\n\n${content}\n\n---\n\nQuestion: ${trimmed}`,
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
    const answer = data?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return { ok: false, error: "No answer returned from the model." };
    }
    return { ok: true, answer };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Request failed.",
    };
  }
}
