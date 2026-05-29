export async function clearAuthCookies() {
  // `user_data` is a non-httpOnly display cookie, so clear it directly.
  document.cookie = "user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // `auth` is httpOnly and can only be cleared by the server.
  await fetch("/api/logout", { method: "POST" });
}
