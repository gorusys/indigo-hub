const required = [
  "OPENAI_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export type RequiredEnvKey = (typeof required)[number];

export interface ServerEnv {
  OPENAI_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

let cached: ServerEnv | null = null;

/**
 * Resolves and validates server env on first use (runtime), not at module load.
 * This allows `next build` to succeed without secrets in the environment.
 */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const out: Partial<ServerEnv> = {};
  for (const key of required) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    (out as Record<string, string>)[key] = value;
  }
  cached = out as ServerEnv;
  return cached;
}

export function hasServerEnv(): boolean {
  return required.every((k) => Boolean(process.env[k]));
}
