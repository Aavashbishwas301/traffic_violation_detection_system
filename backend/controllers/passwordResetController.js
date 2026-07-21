import crypto from "crypto";
import Admin from "../models/Admin.js";
import TrafficPolice from "../models/TrafficPolice.js";
import VehicleOwner from "../models/VehicleOwner.js";

// @desc    Request password reset (generates token, stores it)
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    let user =
      (await Admin.findOne({ email })) ||
      (await TrafficPolice.findOne({ email })) ||
      (await VehicleOwner.findOne({ email }));

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpire = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetExpire;
    await user.save();

    // In production, send email with reset link
    // For now, return the token directly for testing/development
    res.json({
      message: "Password reset link sent. (Dev mode: token returned below)",
      resetToken:
        process.env.NODE_ENV === "production" ? undefined : resetToken,
      resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Reset password using token
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res
      .status(400)
      .json({ message: "Token and new password are required" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    // Search all user models for valid token
    let user =
      (await Admin.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() },
      })) ||
      (await TrafficPolice.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() },
      })) ||
      (await VehicleOwner.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() },
      }));

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update password and clear reset fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export { forgotPassword, resetPassword };
