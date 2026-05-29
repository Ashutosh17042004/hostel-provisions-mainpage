import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/app/api/user_modal/User";
import Hostel from "../hostel_modal/hostel";

export async function POST(request) {
  try {
    const { email, password, fullname } = await request.json();
    const cookieStore = await cookies();
    const hostelname = cookieStore.get("hostelname")?.value;
    if (!hostelname) {
      return Response.json({ message: "Hostel name not found" }, { status: 400 });
    }
    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { message: "An account with this business email already exists" },
        { status: 409 },
      );
    }

    const newuser = await User.create({
      email,
      hostelname: hostelname,
      fullname,
      password,
      role: "user",
    });
    await Hostel.findOneAndUpdate(
      { hostelname },
      { $push: { Users: newuser._id } },
    );

    return Response.json(
      {
        ok: true,
        message: "User registered successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json(
      { message: error.message || "Server error" },
      { status: 500 },
    );
  }
}
