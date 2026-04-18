"use client";

import { useEffect, useState, useTransition } from "react";
import { getOrGenerateStory } from "@/app/actions/story";
import type { Story } from "@/lib/content/content-repository";

type Props = {
  year: string;
  courseId: string;
  sectionId: string;
  filename: string;
  content: string;
};

export function StoryMode({
  year,
  courseId,
  sectionId,
  filename,
  content,
}: Props) {
  const [open, setOpen] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [pending, startTransition] = useTransition();

  function start() {
    setError(null);
    setStory(null);
    setSlideIndex(0);
    setOpen(true);
    startTransition(async () => {
      const result = await getOrGenerateStory(
        { year, courseId, sectionId, filename },
        content
      );
      if (result.ok) setStory(result.story);
      else setError(result.error);
    });
  }

  function close() {
    setOpen(false);
  }

  function next() {
    if (!story) {
      if (!pending) close();
      return;
    }
    if (slideIndex + 1 >= story.slides.length) close();
    else setSlideIndex((i) => i + 1);
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
      else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, story, slideIndex, pending]);

  const current = story?.slides[slideIndex];

  return (
    <>
      <button
        type="button"
        onClick={start}
        className="rounded-full border border-black/20 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
      >
        Story mode
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black select-none"
          onClick={next}
          role="dialog"
          aria-modal="true"
          aria-label="Story mode"
        >
          {story && (
            <div className="absolute inset-x-3 top-3 z-10 flex gap-1 sm:inset-x-6 sm:top-4">
              {story.slides.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < slideIndex
                      ? "bg-white"
                      : i === slideIndex
                        ? "bg-white"
                        : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Close story"
            className="absolute right-3 top-6 z-10 flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-white/80 hover:bg-white/10 hover:text-white sm:right-6 sm:top-7"
          >
            ×
          </button>

          <div className="mx-auto flex h-full w-full max-w-md items-center justify-center px-6 sm:max-w-lg md:max-w-2xl">
            {pending && !story && (
              <div className="text-center text-sm text-white/70">
                Generating story…
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-500/10 px-4 py-3 text-center text-sm text-red-200">
                {error}
              </div>
            )}

            {current && (
              <div className="flex flex-col gap-5 text-center">
                {current.title && (
                  <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
                    {current.title}
                  </h2>
                )}
                <p className="text-base leading-relaxed text-white/90 sm:text-lg md:text-xl">
                  {current.text}
                </p>
              </div>
            )}
          </div>

          {story && (
            <div className="absolute inset-x-0 bottom-4 z-10 text-center text-xs text-white/50">
              {slideIndex + 1} / {story.slides.length} · tap to continue
            </div>
          )}
        </div>
      )}
    </>
  );
}
