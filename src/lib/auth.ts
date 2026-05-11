import { timingSafeEqual } from "crypto";
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

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * 1) ADMIN_PASSWORD_HASH (bcrypt) if set
 * 2) data/auth.json bcrypt hash if present (legacy / password change)
 * 3) ADMIN_PASSWORD plain text from env (timing-safe compare; works on Vercel without disk)
 */
export async function verifyPassword(password: string): Promise<boolean> {
  const envHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (envHash) {
    return bcrypt.compare(password, envHash);
  }

  const fromDisk = await readPasswordHashFromDisk();
  if (fromDisk) {
    return bcrypt.compare(password, fromDisk);
  }

  const plain = process.env.ADMIN_PASSWORD;
  if (!plain || plain === "change-this-password") {
    throw new Error(
      "Set ADMIN_PASSWORD in your environment (see README). Optional: ADMIN_PASSWORD_HASH or data/auth.json."
    );
  }

  return timingSafeStringEqual(password, plain);
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
