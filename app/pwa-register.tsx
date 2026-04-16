"use client";

import { useEffect, useState } from "react";

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export function PWARegister() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    let registration: ServiceWorkerRegistration | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    function trackWaiting(reg: ServiceWorkerRegistration) {
      if (reg.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(reg.waiting);
      }
      reg.addEventListener("updatefound", () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (
            installing.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setWaitingWorker(installing);
          }
        });
      });
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        registration = reg;
        trackWaiting(reg);
        intervalId = setInterval(() => {
          reg.update().catch(() => {});
        }, UPDATE_CHECK_INTERVAL_MS);
      })
      .catch(() => {});

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        registration?.update().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    let reloaded = false;
    const onControllerChange = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, []);

  if (!waitingWorker) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-black/10 bg-white/90 px-4 py-1.5 text-xs shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/90">
      <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden="true" />
        <span>A new version is available.</span>
      </span>
      <button
        type="button"
        onClick={() => waitingWorker.postMessage({ type: "SKIP_WAITING" })}
        className="rounded-full border border-black/15 px-2.5 py-1 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
      >
        Reload
      </button>
    </div>
  );
}
