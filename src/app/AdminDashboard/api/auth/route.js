import { getUser } from "@/lib/protectRoute";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const check = await getUser();
    if (check.message === "authorized") {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ ok: false });
    }
  } catch (error) {
    console.log(error);
  }
}
