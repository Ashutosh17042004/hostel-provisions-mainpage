import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/app/api/user_modal/User";
import Hostel from "@/app/AdminDashboard/api/hostel_modal/hostel";
import { verifyToken } from "@/lib/jwt";
import { sendOtpEmail } from "@/lib/mailer";

const OTP_TTL_MS = 10 * 60 * 1000;

export async function POST() {
  try {
    const token = (await cookies()).get("auth")?.value;
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    // Send from the hostel admin's own business email when configured,
    // otherwise fall back to the app-level sender.
    const hostel = await Hostel.findOne({ hostelname: user.hostelname });
    const fromEmail =
      hostel?.buisness_email || process.env.MY_EMAIL;
    const fromPassword =
      hostel?.buisness_email_password || process.env.APP_PASSWORD;

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = await bcrypt.hash(otp, 10);
    user.resetOtpExpiry = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    await sendOtpEmail({ to: user.email, otp, fromEmail, fromPassword });

    return Response.json({
      ok: true,
      message: `A reset code has been sent to ${user.email}`,
    });
  } catch (err) {
    console.error("POST /api/reset-password/request-otp failed:", err);
    return Response.json({ message: err.message }, { status: 500 });
  }
}
