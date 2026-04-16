export const dynamic = "force-static";

const BUILD_VERSION = process.env.NEXT_PUBLIC_BUILD_VERSION ?? String(Date.now());

const SW_SOURCE = `
const VERSION = ${JSON.stringify(BUILD_VERSION)};
const CACHE_NAME = "stdkit-" + VERSION;

self.addEventListener("install", () => {
  // The new worker waits in 'installed' until the page posts SKIP_WAITING.
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith("stdkit-") && k !== CACHE_NAME)
        .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", () => {
  // No-op: defer to network. Present so older browsers consider the SW installable.
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
`;

export async function GET() {
  return new Response(SW_SOURCE, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
