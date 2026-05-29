import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import Hostel from "../hostel_modal/hostel";

export async function POST(request) {
  try {
    const { category, name, price, stock, img } = await request.json();

    // 1. Get the current admin's hostel name from cookies
    const cookieStore = await cookies();
    const userDataStr = cookieStore.get("user_data")?.value;
    
    if (!userDataStr) {
      return Response.json({ message: "Unauthorized: No user session" }, { status: 401 });
    }

    const user = JSON.parse(decodeURIComponent(userDataStr));
    const hostelname = user.hostelname;

    if (!category || !name || !price) {
      return Response.json({ message: "Category, name, and price are required" }, { status: 400 });
    }

    await connectToDatabase();

    // 2. Fetch the specific hostel
    const hostel = await Hostel.findOne({ hostelname });
    if (!hostel) {
      return Response.json({ message: "Hostel not found" }, { status: 404 });
    }

    // 3. Create the new product object according to your schema
    const newProduct = {
      id: `prod_${Date.now()}`, // Generate a unique ID based on timestamp
      name: name,
      price: price,
      stock: stock || 1,
      img: img,
      sales: 0
    };

    // 4. Check if the category already exists (case-insensitive check)
    const categoryIndex = hostel.products.findIndex(
      (cat) => cat.category.toLowerCase() === category.toLowerCase()
    );

    if (categoryIndex > -1) {
      // Category exists, push the product into it
      hostel.products[categoryIndex].products.push(newProduct);
    } else {
      // Category does not exist, create a new category object
      hostel.products.push({
        category: category,
        products: [newProduct]
      });
    }

    // 5. Save the updated hostel document
    await hostel.save();

    return Response.json({ ok: true, message: "Product added successfully" }, { status: 201 });

  } catch (error) {
    console.error("Add product error:", error);
    return Response.json({ message: error.message || "Server error" }, { status: 500 });
  }
}