import { NextResponse } from "next/server";
import {
  createSessionToken,
  setSessionCookie,
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
    await setSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Login failed. Check server configuration.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
