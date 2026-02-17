import { z } from "zod";

export const experienceSchema = z
  .object({
    industry: z.string().min(1, "Industry is required"),
    position: z.string().min(1, "Position is required"),
    company: z.string().min(1, "Company name is required"),
    currentWages: z.string().min(1, "Current wages required"),
    currentCity: z.string().min(1, "Current city required"),
    currentVillage: z.string().min(1, "Current village required"),
    currentVillageOther: z.string().optional(),
    noticePeriod: z.string().optional(),
    startDate: z.string().min(1, "Start date required"),
    endDate: z.string().optional(),
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
    },
  );

export const educationSchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  university: z.string().min(1, "University is required"),
  passingYear: z.string().min(1, "Passing year is required"),
});

export const certificationSchema = z.object({
  name: z.string().optional(),
  year: z.string().optional(),
  achievement: z.string().optional(),
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
  totalExperience: z.string().optional(),
  dob: z.string().min(1, "Date of birth required"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Select gender",
  }),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"], {
    message: "Select marital status",
  }),
  alternateMobile: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+91)\s?[6-9]\d{9}$/.test(val),
      "Enter a valid Indian mobile number",
    ),
  phone: z
    .string()
    .refine(
      (val) => /^(\+91)\s?[6-9]\d{9}$/.test(val),
      "Enter a valid Indian mobile number",
    ),
  skillsList: z.array(skillSchema).min(1, "Add at least one skill"),
  languagesKnown: z.array(z.string()).default([]),

  // Location Fields
  state: z.string().min(1, "State required"),
  district: z.string().min(1, "District required"),
  city: z.string().min(1, "City required"),
  village: z.string().min(1, "Village required"),
  address: z.string().min(1, "Address required"),

  // Availability
  expectedSalary: z.string().min(1, "Expected salary required"),
  availabilityCategory: z.string().min(1, "Category required"),
  availabilityJobCategory: z.string().min(1, "Job category required"),
  availabilityState: z.string().min(1, "Availability state required"),
  availabilityDistrict: z.string().min(1, "Availability district required"),
  availabilityCity: z.array(z.string()).nonempty("Select at least one city"),
  availabilityVillage: z.string().min(1, "Availability village required"),

  // Summaries
  summary: z.string().optional(),
  pincode: z
    .string()
    .length(6, "PIN CODE must be 6 digits")
    .regex(/^\d+$/, "PIN CODE must contain only numbers"),

  declarationChecked: z.boolean().refine((val) => val === true, {
    message: "You must certify that the information is true",
  }),
};

// Schema for experienced candidates
const experiencedSchema = z.object({
  ...baseSchema,
  workType: z.literal("experienced"),
  experiences: z.array(experienceSchema).min(1, "Add at least one experience"),
  educationList: z.array(educationSchema).min(1, "Add at least one education"),
  certificationList: z.array(certificationSchema).optional().default([]),
});

// Schema for fresher candidates
const fresherSchema = z.object({
  ...baseSchema,
  workType: z.literal("fresher"),
  experiences: z.array(experienceSchema).optional().default([]),
  educationList: z.array(educationSchema).min(1, "Add at least one education"),
  certificationList: z.array(certificationSchema).optional().default([]),
});

// Union of both schemas
export const resumeSchema = z.discriminatedUnion("workType", [
  experiencedSchema,
  fresherSchema,
]);
