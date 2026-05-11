import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "fc_admin";
const SALT_ROUNDS = 12;

export function getDataDir() {
  return path.join(process.cwd(), "data");
}

async function readPasswordHashFromDisk(): Promise<string | null> {
  const authPath = path.join(getDataDir(), "auth.json");
  try {
    const raw = await fs.readFile(authPath, "utf-8");
    const parsed = JSON.parse(raw) as { passwordHash?: string };
    if (parsed?.passwordHash) return parsed.passwordHash;
  } catch {
    /* missing or invalid */
  }
  return null;
}

async function bootstrapPasswordHashFromEnvPlain(): Promise<string> {
  const plain = process.env.ADMIN_PASSWORD;
  if (!plain || plain === "change-this-password") {
    throw new Error(
      "Set ADMIN_PASSWORD (writable disk) or ADMIN_PASSWORD_HASH (any host). See README."
    );
  }
  const passwordHash = await bcrypt.hash(plain, SALT_ROUNDS);
  const auth = { passwordHash };
  try {
    await fs.mkdir(getDataDir(), { recursive: true });
    await fs.writeFile(
      path.join(getDataDir(), "auth.json"),
      JSON.stringify(auth, null, 2),
      "utf-8"
    );
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Cannot write data/auth.json (${detail}). On Vercel set ADMIN_PASSWORD_HASH (bcrypt). Run: npm run hash-admin-password -- "YourPassword" and paste the hash into env.`
    );
  }
  return passwordHash;
}

/** Prefer ADMIN_PASSWORD_HASH on serverless; else data/auth.json; else bootstrap from ADMIN_PASSWORD. */
async function resolvePasswordHash(): Promise<string> {
  const envHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (envHash) return envHash;

  const fromDisk = await readPasswordHashFromDisk();
  if (fromDisk) return fromDisk;

  return bootstrapPasswordHashFromEnvPlain();
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = await resolvePasswordHash();
  return bcrypt.compare(password, hash);
}

export async function changeAdminPassword(newPlain: string): Promise<void> {
  const dir = getDataDir();
  await fs.mkdir(dir, { recursive: true });
  const passwordHash = await bcrypt.hash(newPlain, SALT_ROUNDS);
  await fs.writeFile(
    path.join(dir, "auth.json"),
    JSON.stringify({ passwordHash }, null, 2),
    "utf-8"
  );
}

function getSecret(): Uint8Array {
  let s = process.env.AUTH_SECRET;
  if (!s || s === "change-me-to-a-long-random-string") {
    if (process.env.NODE_ENV !== "development") {
      throw new Error(
        "Set AUTH_SECRET in your host environment (e.g. Vercel) to a long random string."
      );
    }
    s = "dev-only-insecure-secret-do-not-use-in-production";
  }
  return new TextEncoder().encode(s);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function getSessionFromCookies(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
