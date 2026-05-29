import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import Hostel from "@/app/AdminDashboard/api/hostel_modal/hostel";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userDataStr = cookieStore.get("user_data")?.value;

    if (!userDataStr) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Decode and parse the user cookie
    const user = JSON.parse(decodeURIComponent(userDataStr));

    await connectToDatabase();

    // Find the hostel based on the user's hostelname
    const hostel = await Hostel.findOne({ hostelname: user.hostelname });

    if (!hostel) {
      return Response.json({ message: "Hostel not found" }, { status: 404 });
    }

    return Response.json({ ok: true, products: hostel.products }, { status: 200 });

  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}