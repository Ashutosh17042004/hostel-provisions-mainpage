import { connectToDatabase } from "@/lib/mongodb";
import Hostel from "@/app/AdminDashboard/api/hostel_modal/hostel";
import { getAuthUser } from "@/lib/protectRoute";

async function sendTelegramNotification(hostel, order) {
  const token = hostel?.telegram_token || process.env.TELEGRAM_TOKEN;
  const chatId = hostel?.telegram_chat_id || process.env.ADMIN_CHAT_ID;
  if (!token || !chatId) return;

  const itemLines = order.items
    .map((i) => `• ${i.name} x ${i.qty}`)
    .join("\n");

  const text = `🍽️ *New Order Received!*

🆔 *Order ID:* ${order.orderId}
👤 *Customer:* ${order.userName}
📧 *Email:* ${order.userEmail}
🏠 *Hostel:* ${hostel?.hostelname || "-"}

🛒 *Items:*
${itemLines}

💰 *Total Amount:* ₹${order.totalAmount}
⏱️ *Time:* ${new Date(order.date).toLocaleString()}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (error) {
    console.error("Telegram notification failed:", error);
  }
}

export async function POST(request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { cart } = await request.json();
    if (!Array.isArray(cart) || cart.length === 0) {
      return Response.json({ message: "Cart is empty" }, { status: 400 });
    }

    await connectToDatabase();

    const hostel = await Hostel.findOne({ hostelname: auth.hostelname });
    if (!hostel) {
      return Response.json({ message: "Hostel not found" }, { status: 404 });
    }

    // Build an authoritative price lookup from the DB so the order total and
    // line prices cannot be tampered with by a modified client payload.
    const priceMap = new Map();
    for (const category of hostel.products) {
      for (const product of category.products) {
        priceMap.set(String(product._id), {
          name: product.name,
          price: product.price,
        });
      }
    }

    const items = [];
    let totalAmount = 0;
    for (const line of cart) {
      const ref = priceMap.get(String(line?._id));
      const qty = Number(line?.qty);
      if (!ref || !Number.isFinite(qty) || qty <= 0) {
        return Response.json(
          { message: "Cart contains an invalid or unavailable item" },
          { status: 400 },
        );
      }
      const quantity = Math.floor(qty);
      items.push({ name: ref.name, price: ref.price, qty: quantity });
      totalAmount += ref.price * quantity;
    }

    const order = {
      orderId: `ORD-${Date.now()}`,
      userName: auth.fullname,
      userEmail: auth.email,
      items,
      totalAmount,
      date: new Date().toISOString(),
      status: "Pending",
    };

    // Hostel schema stores Orders as an array of stringified order records.
    hostel.Orders.push(JSON.stringify(order));
    await hostel.save();

    await sendTelegramNotification(hostel, order);

    return Response.json(
      { ok: true, message: "Order placed successfully!", orderId: order.orderId },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error placing order:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
