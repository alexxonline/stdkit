import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-8 py-24 px-8 sm:px-16">
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Study Kit
        </h1>
        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Organize your courses, sections, and study notes. Notes are stored as
          markdown in Cloudflare R2.
        </p>
        <div>
          <Link
            href="/courses"
            className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Browse courses
          </Link>
        </div>
      </main>
    </div>
  );
}
