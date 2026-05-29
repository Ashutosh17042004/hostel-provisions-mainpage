import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  // Clear both the httpOnly session cookie and the display cookie.
  cookieStore.delete("auth");
  cookieStore.delete("user_data");
  return Response.json({ ok: true });
}
