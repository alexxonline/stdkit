import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";

export const isAuthEnabled =
  (process.env.AUTH_ENABLED ?? "").trim().toLowerCase() === "true";

const connectionString = process.env.DB_CONNECTION_STRING;
const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;
const googleClientId = process.env.GOOGLE_AUTH_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_AUTH_CLIENT_SECRET;

const globalForAuth = globalThis as unknown as {
  __mongoClient?: MongoClient;
};

function getMongoClient() {
  if (!connectionString) {
    throw new Error("DB_CONNECTION_STRING is not set.");
  }
  if (!globalForAuth.__mongoClient) {
    globalForAuth.__mongoClient = new MongoClient(connectionString);
  }
  return globalForAuth.__mongoClient;
}

function createAuth() {
  if (!isAuthEnabled) return null;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not set.");
  if (!googleClientId || !googleClientSecret) {
    throw new Error(
      "GOOGLE_AUTH_CLIENT_ID and GOOGLE_AUTH_CLIENT_SECRET must be set."
    );
  }

  const client = getMongoClient();
  const db = client.db("yt-transcript");

  return betterAuth({
    baseURL,
    secret,
    database: mongodbAdapter(db, { client }),
    emailAndPassword: { enabled: false },
    socialProviders: {
      google: {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      },
    },
    plugins: [nextCookies()],
  });
}

export const auth = createAuth();

export type Auth = NonNullable<typeof auth>;
