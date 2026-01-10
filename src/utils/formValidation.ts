import { z } from "zod";
import {
  experienceSchema,
  educationSchema,
  skillSchema,
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
  availabilityState: "",
  availabilityDistrict: "",
  availabilityCity: "",
  availabilityVillage: "",
  availabilityOtherVillage: "",

  joiningDate: "",
  availabilityJobCategory: "",
  expectedSalaryMin: "",
  expectedSalaryMax: "",
  totalExperience: "",
  additionalInfo: "",
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
  workType: "experienced" | "fresher"
): string | null {
  try {
    // ARRAY FIELDS LIKE: fieldName-0
    if (name.includes("-")) {
      const [field] = name.split("-");

      const fieldSchema =
        (experienceSchema as any).shape[field] ||
        (educationSchema as any).shape[field] ||
        (skillSchema as any).shape[field];

      if (!fieldSchema) return null;

      // Conditional: don't validate hidden groups
      if (workType === "fresher" && (experienceSchema as any).shape[field])
        return null;
      if (workType === "experienced" && (educationSchema as any).shape[field])
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
          (val) => /^(\+91)[6-9]\d{9}$/.test(val),
          "Enter a valid Indian mobile number"
        ),
      alternateMobile: z
        .string()
        .optional()
        .refine(
          (val) => !val || /^(\+91)?[6-9]\d{9}$/.test(val),
          "Enter a valid Indian mobile number"
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
      availabilityCategory: z.string().optional(),
      availabilityState: z.string().optional(),
      availabilityDistrict: z.string().optional(),
      availabilityCity: z.string().optional(),
      availabilityVillage: z.string().optional(),
      joiningDate: z.string().optional(),
      availabilityJobCategory: z.string().optional(),
      expectedSalaryMin: z.string().min(1, "Min salary required"),
      expectedSalaryMax: z.string().min(1, "Max salary required"),
      totalExperience: z.string().optional(),
      additionalInfo: z.string().optional(),
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
  endDate: string
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
      const key = `${String(field)}-${String(index)}`;
      mapped[key] = err.message;
      return;
    }

    const key = String(path[0]);
    mapped[key] = err.message;
  });

  return { isValid: false, errors: mapped };
}
