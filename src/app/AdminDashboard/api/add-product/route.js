import { connectToDatabase } from "@/lib/mongodb";
import Hostel from "../hostel_modal/hostel";
import { getAuthUser } from "@/lib/protectRoute";

export async function POST(request) {
  try {
    // Authorization comes from the signed httpOnly JWT, never the
    // client-writable `user_data` cookie.
    const auth = await getAuthUser();
    if (!auth) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (auth.role !== "admin") {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    const hostelname = auth.hostelname;
    const { category, name, price, stock, img } = await request.json();

    const priceNum = Number(price);
    if (!category || !name || !Number.isFinite(priceNum) || priceNum < 0) {
      return Response.json(
        { message: "Category, name, and a valid price are required" },
        { status: 400 },
      );
    }

    const stockNum = Number(stock);

    await connectToDatabase();

    const hostel = await Hostel.findOne({ hostelname });
    if (!hostel) {
      return Response.json({ message: "Hostel not found" }, { status: 404 });
    }

    const newProduct = {
      id: `prod_${Date.now()}`,
      name: name.trim(),
      price: priceNum,
      stock: Number.isFinite(stockNum) && stockNum > 0 ? stockNum : 1,
      img: img || "default-image-url.jpg",
      sales: 0,
    };

    // Case-insensitive category match so products group correctly.
    const categoryIndex = hostel.products.findIndex(
      (cat) => cat.category.toLowerCase() === category.trim().toLowerCase(),
    );

    if (categoryIndex > -1) {
      hostel.products[categoryIndex].products.push(newProduct);
    } else {
      hostel.products.push({
        category: category.trim(),
        products: [newProduct],
      });
    }

    await hostel.save();

    return Response.json(
      { ok: true, message: "Product added successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Add product error:", error);
    return Response.json(
      { message: "Failed to add product. Please try again." },
      { status: 500 },
    );
  }
}
