import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("RESUME BODY:", body);

    const f = body;
    // 🔍 CHECK FOR DUPLICATE NAME + SURNAME
    const [existing]: any = await db.execute(
      "SELECT id FROM resumes WHERE firstName = ? AND surName = ? LIMIT 1",
      [f.firstName, f.surName]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Name + Surname already exists" },
        { status: 400 }
      );
    }
    await db.execute(
      `INSERT INTO resumes 
        (firstName, surName, email, phone, state, district, city, village, address, summary,
 workType, joiningDate, availabilityCategory, availabilityState, availabilityDistrict,
 availabilityCity, availabilityVillage, availabilityJobCategory, expectedSalaryRange, additionalInfo,
 photoUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        f.firstName,
        f.surName,
        f.email,
        f.phone,
        f.state,
        f.district,
        f.city,
        f.village,
        f.address,
        f.summary,
        f.workType,
        f.joiningDate,
        f.availabilityCategory,
        f.availabilityState,
        f.availabilityDistrict,
        f.availabilityCity,
        f.availabilityVillage,
        f.availabilityJobCategory,
        f.expectedSalaryRange,
        f.additionalInfo,
        f.photoUrl,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("🔥 MYSQL ERROR:", err?.message || err);
    return NextResponse.json(
      { success: false, error: err?.message || err },
      { status: 500 }
    );
  }
}
