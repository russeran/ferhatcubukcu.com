import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET() {
  const authenticated = await getSessionFromCookies();
  return NextResponse.json({ authenticated });
}
