import Admin from "../models/Admin.js";
import TrafficPolice from "../models/TrafficPolice.js";
import VehicleOwner from "../models/VehicleOwner.js";
import sendEmail from "../utils/sendEmail.js";

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

    // Generate 6-digit OTP
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetExpire;
    await user.save();

    // Send email with OTP
    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset for your TVDS account.</p>
      <p>Your One-Time Password (OTP) is: <strong>${resetToken}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "TVDS Password Reset OTP",
        html: message,
      });

      res.json({
        message: "OTP sent to your email",
        // In dev mode without real email, we can return it for testing
        devOtp: process.env.EMAIL_USER ? undefined : resetToken,
      });
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Reset password using token
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) {
    return res
      .status(400)
      .json({ message: "Email, OTP token, and new password are required" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    // Search all user models for valid token and matching email
    let user =
      (await Admin.findOne({
        email,
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() },
      })) ||
      (await TrafficPolice.findOne({
        email,
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() },
      })) ||
      (await VehicleOwner.findOne({
        email,
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
