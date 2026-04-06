const nodemailer = require("nodemailer");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, otp, type = "register") => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const subject =
    type === "register"
      ? "Verify Your Account - ઘનશ્યામ Ladies Tailor"
      : "Password Reset OTP - ઘનશ્યામ Ladies Tailor";

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 1px;">ઘનશ્યામ Ladies Tailor</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">Precision and Perfection in Every Stitch</p>
      </div>
      <div style="padding: 40px 32px; text-align: center;">
        <h2 style="color: #333; font-size: 20px; margin-bottom: 8px;">
          ${type === "register" ? "Verify Your Account" : "Reset Your Password"}
        </h2>
        <p style="color: #666; font-size: 15px; margin-bottom: 32px;">
          Use the OTP below to ${type === "register" ? "complete your registration" : "reset your password"}.
        </p>
        <div style="background: #FFF5F0; border: 2px dashed #D2691E; border-radius: 12px; padding: 24px; display: inline-block;">
          <div style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #8B4513;">${otp}</div>
        </div>
        <p style="color: #999; font-size: 13px; margin-top: 24px;">This OTP expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
      </div>
      <div style="background: #f9f5f2; padding: 16px; text-align: center;">
        <p style="color: #aaa; font-size: 12px; margin: 0;">© 2026 ઘનશ્યામ Ladies Tailor. All rights reserved.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"ઘનશ્યામ Ladies Tailor" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });

  return otp;
};

module.exports = { generateOTP, sendOTPEmail };
