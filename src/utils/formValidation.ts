import { z } from "zod";
import {
  experienceSchema,
  educationSchema,
  skillSchema,
  certificationSchema,
  resumeSchema,
} from "@/schemas/resumeSchemas";

export const initialForm = {
  firstName: "",
  surName: "",
  email: "",
  phone: "",
  alternateMobile: "",
  dob: "",
  gender: "",
  maritalStatus: "",
  state: "",
  district: "",
  city: "",
  village: "",
  otherVillage: "",
  address: "",
  summary: "",
  availabilityCategory: "",
  availabilityIndustry: "",
  availabilityCustomIndustry: "",
  availabilityJobCategory: "",
  availabilityState: "",
  availabilityDistrict: "",
  availabilityCity: [] as string[],
  availabilityVillage: "",
  availabilityOtherVillage: "",
  expectedSalary: "",
  totalExperience: "",
  pincode: "",
  additionalInfo: "",
  languagesKnown: [] as string[],
  declarationChecked: false,
  certificationList: [{ name: "", year: "", achievement: "" }],
};

export const normalizeIndianPhone = (input: string) => {
  const digits = input.replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  return input;
};

// Validate a single field and return an error message or null
export function validateField(
  name: string,
  value: unknown,
  workType: "experienced" | "fresher",
): string | null {
  try {
    // ARRAY FIELDS LIKE: fieldName-0 or prefix-fieldName-0
    if (name.includes("-")) {
      const parts = name.split("-");
      const field = parts.length > 2 ? parts[1] : parts[0];
      const prefix = parts.length > 2 ? parts[0] : "";

      const fieldSchema =
        (!prefix && (experienceSchema as any).shape[field]) ||
        (!prefix && (educationSchema as any).shape[field]) ||
        (prefix === "skill" && (skillSchema as any).shape[field]) ||
        (prefix === "cert" && (certificationSchema as any).shape[field]);

      if (!fieldSchema) return null;

      // Conditional: don't validate hidden groups
      if (
        workType === "fresher" &&
        !prefix &&
        (experienceSchema as any).shape[field]
      )
        return null;

      z.object({ [field]: fieldSchema }).parse({ [field]: value });

      return null;
    }

    // NORMAL FIELDS
    const normalFieldSchemas: Record<string, z.ZodTypeAny> = {
      firstName: z.string().min(1, "First name required"),
      surName: z.string().min(1, "Last name required"),
      email: z.string().email("Invalid email"),
      phone: z
        .string()
        .refine(
          (val) => /^(\+91)\s?[6-9]\d{9}$/.test(val),
          "Enter a valid Indian mobile number",
        ),
      alternateMobile: z
        .string()
        .optional()
        .refine(
          (val) => !val || /^(\+91)\s?[6-9]\d{9}$/.test(val),
          "Enter a valid Indian mobile number",
        ),
      dob: z.string().min(1, "Date of birth required"),
      gender: z.string().min(1, "Gender required"),
      maritalStatus: z.string().min(1, "Marital status required"),
      state: z.string().min(1, "State required"),
      district: z.string().min(1, "District required"),
      city: z.string().min(1, "City required"),
      village: z.string().min(1, "Village required"),
      address: z.string().min(1, "Address required"),
      summary: z.string().optional(),
      availabilityCategory: z.string().min(1, "Category required"),
      availabilityState: z.string().min(1, "State required"),
      availabilityDistrict: z.string().min(1, "District required"),
      availabilityCity: z
        .array(z.string())
        .nonempty("Select at least one city"),
      availabilityVillage: z.string().min(1, "Village required"),
      joiningDate: z.string().min(1, "Joining date required"),
      availabilityJobCategory: z.string().min(1, "Job category required"),
      expectedSalary: z.string().min(1, "Expected salary required"),
      totalExperience: z.string().optional(),
      pincode: z
        .string()
        .length(6, "PIN CODE must be 6 digits")
        .regex(/^\d+$/, "PIN CODE must contain only numbers"),
      additionalInfo: z.string().optional(),
      languagesKnown: z.array(z.string()).optional(),
      declarationChecked: z.boolean().refine((val) => val === true, {
        message: "You must certify that the information is true",
      }),
    };

    const fieldSchema = normalFieldSchemas[name];

    if (fieldSchema) {
      z.object({ [name]: fieldSchema }).parse({ [name]: value });
      return null;
    }

    return null;
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return err.issues?.[0]?.message || "Invalid value";
    }

    try {
      const maybe = err as {
        message?: string;
        errors?: Array<{ message?: string }>;
      };
      return maybe.errors?.[0]?.message || maybe.message || "Invalid value";
    } catch {
      return "Invalid value";
    }
  }
}

export function validateExperienceDates(
  _index: number,
  startDate: string,
  endDate: string,
): string | null {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) return "End date cannot be before start date";
  return null;
}

// Validate whole form payload and return { isValid, errors }
export function validateForm(payload: unknown) {
  const parsed = resumeSchema.safeParse(payload);

  if (parsed.success)
    return { isValid: true, errors: {} as Record<string, string> };

  const mapped: Record<string, string> = {};

  parsed.error.issues.forEach((err) => {
    const path = err.path;
    if (!path.length) return;

    if (path[0] === "experiences") {
      const [, index, field] = path;
      const key = `${String(field)}-${String(index)}`;
      mapped[key] = err.message;
      return;
    }

    if (path[0] === "educationList") {
      const [, index, field] = path;
      const key = `${String(field)}-${String(index)}`;
      mapped[key] = err.message;
      return;
    }

    if (path[0] === "skillsList") {
      const [, index, field] = path;
      const key = `skill-${String(field)}-${String(index)}`;
      mapped[key] = err.message;
      return;
    }

    if (path[0] === "certificationList") {
      const [, index, field] = path;
      const key = `cert-${String(field)}-${String(index)}`;
      mapped[key] = err.message;
      return;
    }

    const key = String(path[0]);
    mapped[key] = err.message;
  });

  const data = payload as any;

  // Personal Village
  if (data.village === "Other (Type Manually)" && !data.otherVillage?.trim()) {
    mapped.otherVillage = "Village name is required";
  }

  // Availability Village
  if (
    data.availabilityVillage === "Other (Type Manually)" &&
    !data.availabilityOtherVillage?.trim()
  ) {
    mapped.availabilityOtherVillage = "Village name is required";
  }

  // Experience Village
  if (Array.isArray(data.experiences)) {
    data.experiences.forEach((exp: any, index: number) => {
      if (
        exp.currentVillage === "Other (Type Manually)" &&
        !exp.currentVillageOther?.trim()
      ) {
        mapped[`currentVillageOther-${index}`] = "Village name is required";
      }
    });
  }

  return { isValid: false, errors: mapped };
}
