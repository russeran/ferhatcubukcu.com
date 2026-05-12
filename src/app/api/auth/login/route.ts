import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
  verifyPassword,
} from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = typeof body.password === "string" ? body.password : "";
    const ok = await verifyPassword(password);
    if (!ok) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    const token = await createSessionToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Login failed. Check server configuration.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
