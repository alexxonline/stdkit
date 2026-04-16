import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth, isAuthEnabled } from "@/lib/auth";
import { GoogleSignInButton } from "./google-button";

export default async function LoginPage() {
  if (!isAuthEnabled || !auth) redirect("/");

  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/");

  return (
    <div className="flex flex-1 items-center justify-center px-8 py-16">
      <div className="flex w-full max-w-sm flex-col gap-8 rounded-2xl border border-black/10 bg-white/60 p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950/60">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Study Kit</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to continue.
          </p>
        </div>
        <GoogleSignInButton />
      </div>
    </div>
  );
}
