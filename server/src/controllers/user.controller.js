import asyncHandler from "express-async-handler";
import { User } from "../models/user.model.js";
import sendEmail from "../utils/sendMail.js";
import generateToken from "../utils/generateToken.js";

const generateVerificationEmail = (name, verificationCode) => {
  return `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; background-color: #f9f9f9; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #702f8f; color: white; text-align: center; padding: 20px;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to Our Platform</h1>
          </div>
          <div style="padding: 20px;">
            <h2 style="margin: 0 0 10px;">Hi ${name},</h2>
            <p style="margin: 0 0 15px;">Thank you for joining us! To complete your registration, please use the verification code below:</p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="display: inline-block; padding: 10px 20px; font-size: 20px; font-weight: bold; color: #702f8f; border: 2px solid #702f8f; border-radius: 5px;">${verificationCode}</span>
            </div>
            <p style="margin: 0 0 15px;">This code is valid for 10 minutes.</p>
            <p style="margin: 0;">If you didn’t request this, please ignore this email or contact support if you have questions.</p>
          </div>
          <div style="background-color: #f4f4f4; padding: 10px 20px; text-align: center; font-size: 14px; color: #666;">
            <p style="margin: 0;">Best regards,<br />BorrowAtoZ Team</p>
          </div>
        </div>
      </div>
    `;
};

const register = asyncHandler(async (req, res) => {
  try {
    const firstName = (req.body.firstName || "").trim();
    const lastName = (req.body.lastName || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All field required" });
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      if (userExist.isEmailVerified) {
        return res.status(400).json({
          message: "User already exists. Please log in.",
        });
      } else {
        userExist.firstName = firstName;
        userExist.lastName = lastName;
        userExist.email = email;
        userExist.password = password;

        const verificationCode =
          await userExist.generateVerificationCodeAndExpiry();

        await userExist.save();

        const emailContent = generateVerificationEmail(
          userExist.firstName,
          verificationCode
        );

        await sendEmail(userExist.email, "Verify your Email", emailContent);

        return res.status(200).json({
          success: true,
          message: "Verification code send to your email",
        });
      }
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    const verificationCode = await user.generateVerificationCodeAndExpiry();
    await user.save();

    const emailContent = generateVerificationEmail(
      user.firstName,
      verificationCode
    );

    await sendEmail(user.email, "Verify your Email", emailContent);

    return res
      .status(200)
      .json({ success: true, message: "Verification code send to your email" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: `Error registering` });
  }
});

const login = asyncHandler(async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExist = await User.findOne({ email }).select("+password");

    if (!userExist) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!userExist.isEmailVerified) {
      const verificationCode =
        await userExist.generateVerificationCodeAndExpiry();
      await userExist.save();

      const emailContent = generateVerificationEmail(
        userExist.firstName,
        verificationCode
      );

      await sendEmail(userExist.email, "Verify your Email", emailContent);

      return res.status(200).json({
        success: true,
        message: "Email not verified. Verification code sent",
      });
    }

    const isPassCorrect = await userExist.isPasswordCorrect(password);

    if (!isPassCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const loggedInUser = await User.findById(userExist._id).select("-password");

    generateToken(res, userExist._id);

    return res.status(200).json(loggedInUser);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: `Error logging in` });
  }
});

const verifyOtp = asyncHandler(async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const otp = (req.body.otp || "").trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    if (user.accountVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    const result = await user.verifyEmailOtp(otp);

    if (!result.valid) {
      return res.status(400).json({ message: result.reason });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpiry = null;

    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: `Error while verifying OTP` });
  }
});

const logout = asyncHandler(async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "LOGGED OUT SUCCESSFUL" });
  } catch (error) {
    console.log(error);
    res.status(200).json({ message: "Error Logging out user" });
  }
});

const profile = asyncHandler(async (req, res) => {
  try {
    return res.status(200).json(req.user)
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting Profile" });
  }
});

export { register, login, verifyOtp, logout,profile };
