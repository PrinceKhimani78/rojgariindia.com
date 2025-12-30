type OtpResult = { success: boolean; message?: string; data?: any };

export async function sendOtp(backendUrl: string | undefined, email: string): Promise<OtpResult> {
  if (!backendUrl) return { success: false, message: "Backend URL not configured" };
  try {
    const res = await fetch(`${backendUrl}/otp/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      let msg = "Failed to send OTP";
      try {
        const d = await res.json();
        msg = d.message || msg;
      } catch {}
      return { success: false, message: msg };
    }

    return { success: true };
  } catch (err) {
    return { success: false, message: (err as Error).message || "Network error" };
  }
}

export async function verifyOtp(backendUrl: string | undefined, email: string, otp: string): Promise<OtpResult> {
  if (!backendUrl) return { success: false, message: "Backend URL not configured" };
  try {
    const res = await fetch(`${backendUrl}/otp/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // ignore parse errors
    }

    if (!res.ok) {
      return { success: false, message: data?.message || "OTP verification failed", data };
    }

    // backend returns { success: true } on success in earlier code
    if (data && data.success === false) {
      return { success: false, message: data.message || "Incorrect OTP", data };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, message: (err as Error).message || "Network error" };
  }
}
