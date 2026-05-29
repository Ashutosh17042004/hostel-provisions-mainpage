import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/app/api/user_modal/User";
import { verifyToken } from "@/lib/jwt";

export async function POST(request) {
  try {
    const token = (await cookies()).get("auth")?.value;
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { otp, newPassword } = await request.json();
    if (!otp || !newPassword) {
      return Response.json(
        { message: "OTP and new password are required" },
        { status: 400 },
      );
    }
    if (newPassword.length < 6) {
      return Response.json(
        { message: "New password must be at least 6 characters" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.resetOtp || !user.resetOtpExpiry) {
      return Response.json(
        { message: "No reset code requested. Please request a new code." },
        { status: 400 },
      );
    }
    if (user.resetOtpExpiry.getTime() < Date.now()) {
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      await user.save();
      return Response.json(
        { message: "Reset code has expired. Please request a new code." },
        { status: 400 },
      );
    }

    const otpMatch = await bcrypt.compare(String(otp), user.resetOtp);
    if (!otpMatch) {
      return Response.json({ message: "Invalid reset code" }, { status: 401 });
    }

    user.password = newPassword;
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    return Response.json({ ok: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("POST /api/reset-password failed:", err);
    return Response.json({ message: err.message }, { status: 500 });
  }
}
