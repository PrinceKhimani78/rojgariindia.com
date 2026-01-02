import { z } from "zod";

export const experienceSchema = z
  .object({
    position: z.string().min(1, "Position is required"),
    company: z.string().min(1, "Company name is required"),
    noticePeriod: z.string().min(1, "Notice period is required"),
    startDate: z.string().min(1, "Start date required"),
    endDate: z.string().optional(),
    stillWorkingDate: z.string().optional(),
  })
  .refine(
    (data) => {
      // If endDate is provided, it must be after startDate
      if (data.endDate && data.startDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end >= start;
      }
      return true;
    },
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    }
  );

export const educationSchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  university: z.string().min(1, "University is required"),
  passingYear: z.string().min(1, "Passing year is required"),
});

// Optional education schema for experienced candidates
export const educationSchemaOptional = z.object({
  degree: z.string().optional(),
  university: z.string().optional(),
  passingYear: z.string().optional(),
});

export const skillSchema = z.object({
  name: z.string().min(1, "Skill name required"),
  level: z.string().min(1, "Skill level required"),
  years: z.string().min(1, "Experience years required"),
});

const baseSchema = {
  firstName: z.string().min(1, "First name required"),
  surName: z.string().min(1, "Last name required"),
  email: z.string().email("Invalid email"),
  phone: z
    .string()
    .refine(
      (val) => /^(\+91)[6-9]\d{9}$/.test(val),
      "Enter a valid Indian mobile number"
    ),
  skillsList: z.array(skillSchema).min(1, "Add at least one skill"),
};

// Schema for experienced candidates
const experiencedSchema = z.object({
  ...baseSchema,
  workType: z.literal("experienced"),
  experiences: z.array(experienceSchema).min(1, "Add at least one experience"),
  educationList: z.array(educationSchemaOptional).optional().default([]),
});

// Schema for fresher candidates
const fresherSchema = z.object({
  ...baseSchema,
  workType: z.literal("fresher"),
  experiences: z.array(experienceSchema).optional().default([]),
  educationList: z.array(educationSchema).min(1, "Add at least one education"),
});

// Union of both schemas
export const resumeSchema = z.discriminatedUnion("workType", [
  experiencedSchema,
  fresherSchema,
]);
