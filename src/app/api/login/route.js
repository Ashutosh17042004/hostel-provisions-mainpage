import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/app/api/user_modal/User";
import { generateToken } from "@/lib/jwt";
import { authCookieOptions, displayCookieOptions } from "@/lib/cookies";

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

    // Non-sensitive profile fields safe to expose to the client for display.
    const publicUser = {
      _id: user._id.toString(),
      role: user.role,
      fullname: user.fullname,
      email: user.email,
      hostelname: user.hostelname,
      profilepic: user.profilepic,
    };

    // The signed JWT is the source of truth for authorization. It carries the
    // identity fields the API routes need (role + hostelname) so they never
    // have to trust the client-writable `user_data` cookie.
    const authtoken = generateToken({
      userId: user._id.toString(),
      role: user.role,
      hostelname: user.hostelname,
      fullname: user.fullname,
      email: user.email,
    });

    const cookieStore = await cookies();

    // httpOnly session cookie — never readable by client JS.
    cookieStore.set("auth", authtoken, authCookieOptions(request));

    // Display-only cookie. Set server-side with correct, host-relative
    // attributes so it actually persists in production (the previous
    // client-side setCookie pinned domain=.example.com and dropped it).
    // Pass the raw JSON string — Next.js URL-encodes cookie values on
    // serialization, and the client reads it back with a single
    // decodeURIComponent (see AdminDashboard / UserPage getCookie).
    cookieStore.set(
      "user_data",
      JSON.stringify(publicUser),
      displayCookieOptions(request),
    );

    return Response.json({
      ok: true,
      message: "Login successful",
      user: publicUser,
    });
  } catch (err) {
    console.error("POST /api/login failed:", err);
    return Response.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
