"use client";

import { useState } from "react";
import { KeyRound, X, Loader2, MailCheck } from "lucide-react";

export default function ResetPasswordButton({
  label = "Reset Password",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("request"); // "request" | "verify"
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function reset() {
    setStep("request");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
    setSuccess(false);
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function sendOtp() {
    setMessage("");
    setSuccess(false);
    setSending(true);
    try {
      const res = await fetch("/api/reset-password/request-otp", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send code");
      setStep("verify");
      setMessage(data.message);
      setSuccess(true);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      setSuccess(true);
      setMessage("Password updated successfully");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 ${className}`}
      >
        <KeyRound size={16} />
        <span className="hidden sm:inline">{label}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Reset Password
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {step === "request"
                    ? "We'll email a one-time code to your account."
                    : "Enter the code from your email and choose a new password."}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X size={20} />
              </button>
            </div>

            {step === "request" ? (
              <div className="space-y-4">
                {message && (
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      success
                        ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {message}
                  </div>
                )}
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <MailCheck size={16} />
                  )}
                  {sending ? "Sending code..." : "Send reset code"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Reset Code
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`${inputClass} tracking-[0.3em]`}
                    placeholder="6-digit code"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    New Password
                  </span>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                    placeholder="At least 6 characters"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Confirm New Password
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    placeholder="••••••••"
                  />
                </label>

                {message && (
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      success
                        ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? "Updating..." : "Update Password"}
                </button>

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={sending}
                  className="w-full text-center text-sm font-medium text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
                >
                  {sending ? "Resending..." : "Resend code"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
