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
    <div className="fixed top-4 right-4 z-40 flex items-center gap-3 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/80">
      {email && <span className="max-w-[180px] truncate text-zinc-600 dark:text-zinc-400">{email}</span>}
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
