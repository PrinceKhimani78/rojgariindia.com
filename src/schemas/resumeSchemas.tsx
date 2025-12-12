import { z } from "zod";

export const experienceSchema = z.object({
  position: z.string().min(1, "Position is required"),
  company: z.string().min(1, "Company name is required"),
  noticePeriod: z.string().min(1, "Notice period is required"),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  stillWorkingDate: z.string().min(1, "Still working from required"),
});

export const educationSchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  university: z.string().min(1, "University is required"),
  passingYear: z.string().min(1, "Passing year is required"),
});

export const skillSchema = z.object({
  name: z.string().min(1, "Skill name required"),
  level: z.string().min(1, "Skill level required"),
  years: z.string().min(1, "Experience years required"),
});

export const resumeSchema = z
  .object({
    workType: z.enum(["experienced", "fresher"]),
    firstName: z.string().min(1, "First name required"),
    surName: z.string().min(1, "Surname required"),
    email: z.string().email("Invalid email"),

    phone: z
      .string()
      .refine(
        (val) => /^(\+91)[6-9]\d{9}$/.test(val),
        "Enter a valid Indian mobile number"
      ),

    // all other fields...
    experiences: z.array(experienceSchema).default([]),
    educationList: z.array(educationSchema).optional(),
    skillsList: z.array(skillSchema).min(1, "Add at least one skill"),
  })
  .refine(
    (data) =>
      data.workType === "experienced" ? data.experiences.length > 0 : true,
    {
      message: "Add at least one experience",
      path: ["experiences"],
    }
  )
  .refine(
    (data) =>
      data.workType === "fresher"
        ? data.educationList && data.educationList.length > 0
        : true,
    {
      message: "Add at least one education",
      path: ["educationList"],
    }
  );
