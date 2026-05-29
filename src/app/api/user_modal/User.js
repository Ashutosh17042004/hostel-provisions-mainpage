import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    hostelname: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: "admin" },
    fullname: { type: String, required: true },
    profilepic: {
      type: String,
      default:
        "https://res.cloudinary.com/dmj3t5tyh/image/upload/v1763289617/933-9332131_profile-picture-default-png_1_wao5pl.jpg",
    },
    resetOtp: { type: String, default: null },
    resetOtpExpiry: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
