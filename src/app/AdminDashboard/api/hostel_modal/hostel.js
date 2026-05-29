import mongoose from "mongoose";

const productItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  img: { type: String, required: true },
  sales: { type: Number, default: 0 },
  stock: { type: Number, default: 1 },
});

const productCategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  products: [productItemSchema],
});

const hostelSchema = new mongoose.Schema(
  {
    Admin: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    Users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    hostelname: { type: String, required: true },
    telegram_token: { type: String },
    telegram_chat_id: { type: String },
    buisness_email: { type: String },
    buisness_email_password: { type: String },
    phone: { type: Number },
    products: [productCategorySchema],
    logo: { type: String },
    Orders: [{ type: String }],
  },
  { timestamps: true },
);

const Hostel = mongoose.models.Hostel || mongoose.model("Hostel", hostelSchema);

export default Hostel;
