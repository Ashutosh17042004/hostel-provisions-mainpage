import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import Hostel from "@/app/AdminDashboard/api/hostel_modal/hostel";

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
    const { cart, total } = await request.json();
    const cookieStore = await cookies();
    const userDataStr = cookieStore.get("user_data")?.value;

    if (!userDataStr || !cart || cart.length === 0) {
      return Response.json({ message: "Invalid request" }, { status: 400 });
    }

    const user = JSON.parse(decodeURIComponent(userDataStr));
    await connectToDatabase();

    const order = {
      orderId: `ORD-${Date.now()}`,
      userName: user.name || user.fullname,
      userEmail: user.email,
      items: cart,
      totalAmount: total,
      date: new Date().toISOString(),
      status: "Pending",
    };

    // Hostel schema stores Orders as an array of strings.
    const hostel = await Hostel.findOneAndUpdate(
      { hostelname: user.hostelname },
      { $push: { Orders: JSON.stringify(order) } },
      { new: true },
    );

    await sendTelegramNotification(hostel, order);

    return Response.json(
      { ok: true, message: "Order placed successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error placing order:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
