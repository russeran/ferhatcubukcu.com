import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "fc_admin";
const SALT_ROUNDS = 12;

export function getDataDir() {
  return path.join(process.cwd(), "data");
}

async function ensureAuthFile(): Promise<{ passwordHash: string }> {
  const dir = getDataDir();
  await fs.mkdir(dir, { recursive: true });
  const authPath = path.join(dir, "auth.json");
  try {
    const raw = await fs.readFile(authPath, "utf-8");
    return JSON.parse(raw) as { passwordHash: string };
  } catch {
    const plain = process.env.ADMIN_PASSWORD;
    if (!plain || plain === "change-this-password") {
      throw new Error(
        "Set ADMIN_PASSWORD in .env.local before using the admin panel."
      );
    }
    const passwordHash = await bcrypt.hash(plain, SALT_ROUNDS);
    const auth = { passwordHash };
    await fs.writeFile(authPath, JSON.stringify(auth, null, 2), "utf-8");
    return auth;
  }
}

export async function verifyPassword(password: string): Promise<boolean> {
  const auth = await ensureAuthFile();
  return bcrypt.compare(password, auth.passwordHash);
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
      throw new Error("Set AUTH_SECRET in .env.local for secure sessions.");
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
  const token = jar.get(COOKIE)?.value;
  return verifySessionToken(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
