"use client";

import { useEffect, useState, useTransition } from "react";
import { getOrGenerateQuiz } from "@/app/actions/quiz";
import type { Quiz } from "@/lib/content/content-repository";

type Props = {
  year: string;
  courseId: string;
  sectionId: string;
  filename: string;
  content: string;
};

export function QuizMode({
  year,
  courseId,
  sectionId,
  filename,
  content,
}: Props) {
  const [open, setOpen] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [pending, startTransition] = useTransition();

  function start() {
    setError(null);
    setQuiz(null);
    setQuestionIndex(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
    setOpen(true);
    startTransition(async () => {
      const result = await getOrGenerateQuiz(
        { year, courseId, sectionId, filename },
        content
      );
      if (result.ok) setQuiz(result.quiz);
      else setError(result.error);
    });
  }

  function close() {
    setOpen(false);
  }

  function choose(index: number) {
    if (selected !== null || !quiz) return;
    setSelected(index);
    const correct = index === quiz.questions[questionIndex].correctIndex;
    setAnswers((prev) => [...prev, correct]);
  }

  function next() {
    if (!quiz) return;
    if (questionIndex + 1 >= quiz.questions.length) {
      setFinished(true);
      return;
    }
    setQuestionIndex((i) => i + 1);
    setSelected(null);
  }

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const current = quiz?.questions[questionIndex];
  const total = quiz?.questions.length ?? 0;
  const correctCount = answers.filter(Boolean).length;
  const correctIndex = current?.correctIndex ?? -1;
  const isLast = quiz ? questionIndex + 1 >= quiz.questions.length : false;

  return (
    <>
      <button
        type="button"
        onClick={start}
        className="rounded-full border border-black/20 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
      >
        Quiz
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Quiz"
        >
          <div
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 dark:border-white/10">
              <h2 className="text-base font-semibold">Quiz</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="text-xl leading-none text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
              {pending && !quiz && (
                <div className="text-sm text-zinc-500">Generating quiz…</div>
              )}

              {error && (
                <div className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {quiz && !finished && current && (
                <>
                  <div className="flex gap-1">
                    {quiz.questions.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < questionIndex
                            ? answers[i]
                              ? "bg-green-500"
                              : "bg-red-500"
                            : i === questionIndex
                              ? "bg-zinc-400 dark:bg-zinc-500"
                              : "bg-black/10 dark:bg-white/10"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="text-xs text-zinc-500">
                    Question {questionIndex + 1} of {total}
                  </div>

                  <h3 className="text-lg font-semibold leading-snug">
                    {current.question}
                  </h3>

                  <div className="flex flex-col gap-2">
                    {current.choices.map((choice, i) => {
                      const isSelected = selected === i;
                      const isCorrect = i === correctIndex;
                      const revealed = selected !== null;
                      const base =
                        "rounded-lg border px-4 py-3 text-left text-sm transition-colors";
                      let style =
                        "border-black/20 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10";
                      if (revealed) {
                        if (isCorrect) {
                          style =
                            "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300";
                        } else if (isSelected) {
                          style =
                            "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300";
                        } else {
                          style =
                            "border-black/10 text-zinc-500 dark:border-white/10";
                        }
                      }
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => choose(i)}
                          disabled={revealed}
                          className={`${base} ${style} disabled:cursor-default`}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>

                  {selected !== null && (
                    <div
                      className={`rounded-md px-3 py-2 text-sm ${
                        selected === correctIndex
                          ? "bg-green-500/10 text-green-700 dark:text-green-300"
                          : "bg-red-500/10 text-red-700 dark:text-red-300"
                      }`}
                    >
                      <div className="font-semibold">
                        {selected === correctIndex ? "Correct!" : "Not quite."}
                      </div>
                      {current.explanation && (
                        <div className="mt-1 text-zinc-700 dark:text-zinc-300">
                          {current.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {quiz && finished && (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="text-sm text-zinc-500">You scored</div>
                  <div className="text-4xl font-bold">
                    {correctCount} / {total}
                  </div>
                  <div className="text-sm text-zinc-500">
                    {correctCount === total
                      ? "Perfect!"
                      : correctCount >= Math.ceil(total / 2)
                        ? "Nice work."
                        : "Keep reviewing."}
                  </div>
                </div>
              )}
            </div>

            {quiz && (
              <div className="flex justify-end gap-2 border-t border-black/10 px-5 py-4 dark:border-white/10">
                {!finished ? (
                  <button
                    type="button"
                    onClick={next}
                    disabled={selected === null}
                    className="rounded-full bg-black px-4 py-2 text-sm text-white disabled:opacity-40 dark:bg-white dark:text-black"
                  >
                    {isLast ? "Finish" : "Continue"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-full bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
                  >
                    Close
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
