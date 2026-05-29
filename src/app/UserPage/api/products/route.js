import { connectToDatabase } from "@/lib/mongodb";
import Hostel from "@/app/AdminDashboard/api/hostel_modal/hostel";
import { getAuthUser } from "@/lib/protectRoute";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Hostel is resolved from the signed token, so a user can only ever read
    // the products of their own hostel.
    const hostel = await Hostel.findOne({ hostelname: auth.hostelname });
    if (!hostel) {
      return Response.json({ message: "Hostel not found" }, { status: 404 });
    }

    return Response.json(
      { ok: true, products: hostel.products },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
