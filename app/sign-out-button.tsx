"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export function SignOutButton({ email }: { email: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-black/10 bg-white/80 px-4 py-1.5 text-xs shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/80">
      {email && (
        <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
          <span className="max-w-[220px] truncate">Signed in as <span className="font-medium text-zinc-900 dark:text-zinc-100">{email}</span></span>
        </span>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-full border border-black/15 px-2.5 py-1 text-xs hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
      >
        {loading ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
