import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    const f = body.form; // short alias

    // Insert main resume
    const [result]: any = await connection.execute(
      `INSERT INTO resumes (
        firstName, surName, email, phone,
        state, district, city, village,
        address, summary,
        availabilityCategory, availabilityState, availabilityDistrict,
        availabilityCity, availabilityVillage,
        joiningDate, availabilityJobCategory,
        expectedSalaryRange, additionalInfo,
        photoUrl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        f.firstName || null,
        f.surName || null,
        f.email || null,
        f.phone || null,

        f.state || null,
        f.district || null,
        f.city || null,
        f.village || null,

        f.address || null,
        f.summary || null,

        f.availabilityCategory || null,
        f.availabilityState || null,
        f.availabilityDistrict || null,
        f.availabilityCity || null,
        f.availabilityVillage || null,

        f.joiningDate || null,
        f.availabilityJobCategory || null,
        f.expectedSalaryRange || null,
        f.additionalInfo || null,

        f.photoUrl || null,
      ]
    );

    const resumeId = result.insertId;

    // Insert experience
    for (const exp of body.experiences) {
      await connection.execute(
        `INSERT INTO resume_experience (
          resume_id, position, company, noticePeriod,
          startDate, endDate, stillWorkingDate
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          resumeId,
          exp.position || null,
          exp.company || null,
          exp.noticePeriod || null,
          exp.startDate || null,
          exp.endDate || null,
          exp.stillWorkingDate || null,
        ]
      );
    }

    // Insert education
    for (const edu of body.educationList) {
      await connection.execute(
        `INSERT INTO resume_education (
          resume_id, degree, university, passingYear
        ) VALUES (?, ?, ?, ?)`,
        [
          resumeId,
          edu.degree || null,
          edu.university || null,
          edu.passingYear || null,
        ]
      );
    }

    // Insert skills
    for (const skill of body.skillsList) {
      await connection.execute(
        `INSERT INTO resume_skills (
          resume_id, name, level, years
        ) VALUES (?, ?, ?, ?)`,
        [resumeId, skill.name || null, skill.level || null, skill.years || null]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resume stored successfully",
    });
  } catch (err: any) {
    console.error("RESUME INSERT ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
