import { cookies } from "next/headers";

import { verifyToken } from "./jwt";

/**
 * Read and verify the httpOnly `auth` JWT from the request cookies.
 *
 * This is the single source of truth for authentication on the server.
 * Returns the decoded token payload
 * (`{ userId, role, hostelname, fullname, email }`) when valid, or `null`
 * when the cookie is missing/invalid/expired.
 *
 * Never trust the non-httpOnly `user_data` cookie for authorization — it is
 * client-writable and exists only for display.
 */
export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) return null;

  return verifyToken(token);
}
