import { NextResponse } from "next/server";

// SAME STORE AS SEND-OTP
let otpStore: any = globalThis.otpStore || {};
globalThis.otpStore = otpStore;

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp)
      return NextResponse.json({ success: false, message: "Missing fields" });

    if (otpStore[email] === otp) {
      delete otpStore[email]; // clear OTP after success
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: "Invalid OTP" });
  } catch (err) {
    console.log("VERIFY OTP ERROR", err);
    return NextResponse.json({ success: false, error: err });
  }
}
