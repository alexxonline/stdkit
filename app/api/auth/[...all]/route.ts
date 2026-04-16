import { toNextJsHandler } from "better-auth/next-js";
import { auth, isAuthEnabled } from "@/lib/auth";

const handler = isAuthEnabled && auth
  ? toNextJsHandler(auth.handler)
  : {
      GET: async () => new Response("Auth disabled", { status: 404 }),
      POST: async () => new Response("Auth disabled", { status: 404 }),
    };

export const { GET, POST } = handler;
