import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/app/api/user_modal/User";
import { generateToken } from "@/lib/jwt";

const SEVEN_DAYS = 60 * 60 * 24 * 7;

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }
    const authtoken = generateToken({
      userId: user._id.toString(),
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("auth", authtoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SEVEN_DAYS,
    });

    return Response.json({
      ok: true,
      message: "Login successful",
      user: {
        _id: user._id,
        role: user.role,
        fullname: user.fullname,
        email: user.email,
        profilepic: user.profilepic,
        hostelname: user.hostelname,
      },
    });
  } catch (err) {
    console.error("POST /api/login failed:", err);
    return Response.json({ message: err.message }, { status: 500 });
  }
}
