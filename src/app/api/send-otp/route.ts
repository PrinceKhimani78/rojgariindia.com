import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

let otpStore: any = globalThis.otpStore || {};
globalThis.otpStore = otpStore;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    console.log("EMAIL RECEIVED:", email);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("GENERATED OTP:", otp);

    otpStore[email] = otp;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailResponse = await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`,
    });

    console.log("MAIL RESPONSE:", mailResponse);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.log("SEND OTP ERROR:", err); // 🔥 THIS IS IMPORTANT
    return NextResponse.json({ success: false, error: err.message });
  }
}
