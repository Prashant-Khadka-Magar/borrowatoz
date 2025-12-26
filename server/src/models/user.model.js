import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto"

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    roles: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    emailVerificationCode: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
    phoneVerificationCode: {
      type: String,
    },
    phoneVerificationExpiry: {
      type: Date,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationCodeAndExpiry = async function () {
  const otp = Math.floor(100000 + Math.random() * 900000);

  const hashedOtp = crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(String(otp))
    .digest("hex");

  this.emailVerificationCode = hashedOtp;
  this.emailVerificationExpiry = new Date(Date.now() + 10 * 60 * 1000);

  return otp;
};

userSchema.methods.verifyEmailOtp = async function (enteredOtp) {
  if (!this.emailVerificationCode || !this.emailVerificationExpiry) {
    return { valid: false, reason: "No OTP requested" };
  }

  if (this.emailVerificationExpiry < Date.now()) {
    return { valid: false, reason: "OTP has expired" };
  }

  const hashedOtp = crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(enteredOtp.toString())
    .digest("hex");

  if (hashedOtp !== this.emailVerificationCode) {
    return { valid: false, reason: "Invalid OTP" };
  }

  return { valid: true };
};

export const User = mongoose.model("user", userSchema);
