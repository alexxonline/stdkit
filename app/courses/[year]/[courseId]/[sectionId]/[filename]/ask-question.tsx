"use client";

import { useState, useTransition } from "react";
import { askQuestion } from "@/app/actions/ask";

export function AskQuestion({ content }: { content: string }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    setOpen(false);
  }

  function submit() {
    setError(null);
    setAnswer(null);
    startTransition(async () => {
      const result = await askQuestion(content, question);
      if (result.ok) setAnswer(result.answer);
      else setError(result.error);
    });
  }

  return (
    <>
      <div className="mt-10 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-black/20 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          Ask a question
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 dark:border-white/10">
              <h2 className="text-base font-semibold">Ask a question</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="text-xl leading-none text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto px-5 py-4">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question about this content..."
                rows={3}
                disabled={pending}
                className="w-full resize-y rounded-md border border-black/20 bg-transparent p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 dark:border-white/20"
              />

              {error && (
                <div className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {pending && !answer && (
                <div className="text-sm text-zinc-500">Thinking…</div>
              )}

              {answer && (
                <div className="rounded-md border border-black/10 bg-black/5 p-3 text-sm leading-relaxed whitespace-pre-wrap dark:border-white/10 dark:bg-white/5">
                  {answer}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-black/10 px-5 py-4 dark:border-white/10">
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="rounded-full border border-black/20 px-4 py-2 text-sm disabled:opacity-50 dark:border-white/20"
              >
                Close
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={pending || !question.trim()}
                className="rounded-full bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
              >
                {pending ? "Asking…" : "Ask"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
