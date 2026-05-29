import { connectToDatabase } from "@/lib/mongodb";
import User from "@/app/api/user_modal/User";
import Hostel from "../hostel_modal/hostel";
import { getAuthUser } from "@/lib/protectRoute";

export async function POST(request) {
  try {
    // Only an authenticated admin may register users, and the new user is
    // always attached to that admin's hostel (derived from the signed JWT —
    // previously this read a `hostelname` cookie that was never set, so
    // registration always failed).
    const auth = await getAuthUser();
    if (!auth) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (auth.role !== "admin") {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    const hostelname = auth.hostelname;
    if (!hostelname) {
      return Response.json(
        { message: "No hostel associated with this account" },
        { status: 400 },
      );
    }

    const { email, password, fullname } = await request.json();
    if (!email || !password || !fullname) {
      return Response.json(
        { message: "Full name, email, and password are required" },
        { status: 400 },
      );
    }
    if (password.length < 6) {
      return Response.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { message: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const newuser = await User.create({
      email,
      hostelname,
      fullname,
      password,
      role: "user",
    });

    await Hostel.findOneAndUpdate(
      { hostelname },
      { $push: { Users: newuser._id } },
    );

    return Response.json(
      { ok: true, message: "User registered successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json(
      { message: "Failed to register user. Please try again." },
      { status: 500 },
    );
  }
}
