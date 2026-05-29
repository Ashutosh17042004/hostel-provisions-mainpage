"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // function setCookie(name, value, days = 7) {
  //   const expires = new Date(Date.now() + days * 86400000).toUTCString();
  //   document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  // }

  function setCookie(name, value, days = 7) {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();

    // Check if the current website is running on HTTPS (Production)
    const isSecure = window.location.protocol === "https:" ? "; Secure" : "";

    // Attach the isSecure string to the end of your cookie
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${isSecure}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Login failed");
      }

      const { user } = await res.json();

      // The httpOnly `auth` token cookie is set server-side by /api/login.
      // user_data holds only non-sensitive profile fields for display.
      setCookie("user_data", JSON.stringify(user));

      if (user.role === "admin") {
        router.push("/AdminDashboard");
      } else if (user.role === "user") {
        router.push("/UserPage");
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg dark:bg-zinc-900"
      >
        <h1 className="mb-6 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Sign in
        </h1>

        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email ID
          </span>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setemail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-200"
            placeholder="Enter your login ID"
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-200"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
