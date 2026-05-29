import { getAuthUser } from "@/lib/protectRoute";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getAuthUser();
  if (user && user.role === "admin") {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
