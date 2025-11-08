import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Manager", "Team"], default: "Team" },
  hourlyRate: { type: Number, default: 0 }, // Per hour rate set by admin
  isActive: { type: Boolean, default: true },
  // Email verification OTP
  otp: { type: String, select: false },
  otpExpiry: { type: Date, select: false },
  isVerified: { type: Boolean, default: false },
  // Password reset OTP
  resetPasswordOTP: { type: String, select: false },
  resetPasswordOTPExpiry: { type: Date, select: false },
}, {
  timestamps: true,
});

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);
