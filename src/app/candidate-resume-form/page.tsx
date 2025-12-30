"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Particles from "react-tsparticles";
import { z } from "zod";
import BgVideo from "@/components/resume/BgVideo";
import Popup from "@/components/resume/Popup";
import InputBox from "@/components/resume/InputBox";
import SelectBox from "@/components/resume/SelectBox";
import DatePicker from "@/components/resume/DatePicker";
import EmailStep from "@/components/resume/popup/EmailStep";
import OtpStep from "@/components/resume/popup/OtpStep";
import {
  experienceSchema,
  educationSchema,
  skillSchema,
  resumeSchema,
} from "@/schemas/resumeSchemas";
import { useGlobalUI } from "@/components/global/GlobalUIProvider";

const phoneRegex = /^(?:\+91[-\s]?)?(?:\d{10}|\d{5}\s?\d{5})$/;
const normalizeIndianPhone = (input: string) => {
  const digits = input.replace(/\D/g, ""); // remove non-digits

  // If number starts with 91 and total is 12 digits → treat as +91XXXXXXXXXX
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  // If user entered only 10 digits → prepend +91
  if (digits.length === 10) {
    return `+91${digits}`;
  }

  // Anything else → return raw so validation can catch it
  return input;
};

type IndiaJson = {
  [state: string]: {
    [district: string]: {
      [city: string]: string[];
    };
  };
};

type WorkType = "experienced" | "fresher";

type ExperienceEntry = {
  position: string;
  company: string;
  noticePeriod: string;
  startDate: string;
  endDate: string;
  stillWorkingDate: string;
};

const ResumePage = () => {
  const [duplicateError, setDuplicateError] = useState("");
  const [isClient, setIsClient] = useState(false);
  const { showSnackbar } = useGlobalUI();
  const [workType, setWorkType] = useState<WorkType>("experienced");
  const [indiaData, setIndiaData] = useState<IndiaJson | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [popupStep, setPopupStep] = useState<"email" | "otp">("email");
  const [anim, setAnim] = useState("");
  const [emailVerificationLoading, setEmailVerificationLoading] =
    useState(false);
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Timers for debounced validation per-field
  const validateTimers = React.useRef<
    Record<string, ReturnType<typeof setTimeout> | null>
  >({});

  const initialForm = {
    firstName: "",
    surName: "",
    email: "",
    phone: "",
    state: "",
    district: "",
    city: "",
    village: "",
    address: "",
    summary: "",
    availabilityCategory: "",
    availabilityState: "",
    availabilityDistrict: "",
    availabilityCity: "",
    availabilityVillage: "",

    joiningDate: "",
    availabilityJobCategory: "",
    expectedSalaryRange: "",
    additionalInfo: "",
  };
  const [form, setForm] = useState(initialForm);

  const [experiences, setExperiences] = useState<ExperienceEntry[]>([
    {
      position: "",
      company: "",
      noticePeriod: "",
      startDate: "",
      endDate: "",
      stillWorkingDate: "",
    },
  ]);

  const [educationList, setEducationList] = useState([
    { degree: "", university: "", passingYear: "" },
  ]);

  const [skillsList, setSkillsList] = useState([
    { name: "", level: "", years: "" },
  ]);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null); // Store the actual file

  useEffect(() => {
    setIsClient(true);

    const loadIndiaData = async () => {
      try {
        const res = await fetch("/data/india_state_district_city_village.json");
        if (!res.ok) return;
        const json = (await res.json()) as IndiaJson;
        setIndiaData(json);
      } catch (err) {
        console.error("Error loading India JSON", err);
      }
    };

    loadIndiaData();
  }, []);
  useEffect(() => {
    setShowPopup(true);
  }, []);
  const handleEmailNext = async () => {
    if (!form.email) return alert("Enter email");

    setEmailVerificationLoading(true);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

    await fetch(`${BACKEND_URL}/otp/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });

    setEmailVerificationLoading(false);
    setPopupStep("otp");
  };

  // Validate experience date range
  const validateExperienceDates = (
    index: number,
    startDate: string,
    endDate: string
  ) => {
    console.log(`🔍 Validating dates for experience ${index}:`, {
      startDate,
      endDate,
    });

    // Clear previous error first
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`endDate-${index}`];
      return newErrors;
    });

    // Only validate if both dates are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        console.log(
          `❌ Validation failed: End date (${endDate}) is before start date (${startDate})`
        );
        setErrors((prev) => ({
          ...prev,
          [`endDate-${index}`]: "End date cannot be before start date",
        }));
      } else {
        console.log(`✅ Validation passed: Dates are in correct order`);
      }
    }
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Mark field as touched (so we show validation only after interaction)
    setTouched((t) => ({ ...t, [name]: true }));

    // Clear duplicate email inline error when user edits email (we show the error via toast)
    if (name === "email") {
      setDuplicateError("");
    }

    // ------------------------------
    // SPECIAL CASE: DYNAMIC ARRAY FIELDS
    // ------------------------------
    if (name.includes("-")) {
      const [fieldName, idxStr] = name.split("-");
      const index = Number(idxStr);

      // EXPERIENCE FIELDS
      if (experienceSchema.shape[fieldName]) {
        setExperiences((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, [fieldName]: value } : item
          )
        );
        // Debounce field validation for UX
        scheduleValidate(name, value);
        return;
      }

      // EDUCATION FIELDS
      if (educationSchema.shape[fieldName]) {
        setEducationList((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, [fieldName]: value } : item
          )
        );
        scheduleValidate(name, value);
        return;
      }

      // SKILL FIELDS
      if (skillSchema.shape[fieldName]) {
        setSkillsList((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, [fieldName]: value } : item
          )
        );
        scheduleValidate(name, value);
        return;
      }
    }

    // ------------------------------
    // CASCADING SELECT LOGIC (unchanged)
    // ------------------------------
    if (name === "state") {
      setForm((f) => ({
        ...f,
        state: value,
        district: "",
        city: "",
        village: "",
      }));
      scheduleValidate("state", value);
      return;
    }

    if (name === "district") {
      setForm((f) => ({
        ...f,
        district: value,
        city: "",
        village: "",
      }));
      scheduleValidate("district", value);
      return;
    }

    if (name === "city") {
      setForm((f) => ({
        ...f,
        city: value,
        village: "",
      }));
      scheduleValidate("city", value);
      return;
    }

    // Availability cascading
    if (name === "availabilityState") {
      setForm((f) => ({
        ...f,
        availabilityState: value,
        availabilityDistrict:
          value === f.availabilityState ? f.availabilityDistrict : "",
        availabilityCity: "",
        availabilityVillage: "",
      }));
      scheduleValidate("availabilityState", value);
      return;
    }

    if (name === "availabilityDistrict") {
      setForm((f) => ({
        ...f,
        availabilityDistrict: value,
        availabilityCity:
          value === f.availabilityDistrict ? f.availabilityCity : "",
        availabilityVillage: "",
      }));
      scheduleValidate("availabilityDistrict", value);
      return;
    }

    if (name === "availabilityCity") {
      setForm((f) => ({
        ...f,
        availabilityCity: value,
        availabilityVillage:
          value === f.availabilityCity ? f.availabilityVillage : "",
      }));
      scheduleValidate("availabilityCity", value);
      return;
    }

    if (name === "phone") {
      const formatted = normalizeIndianPhone(value);

      setForm((prev) => ({
        ...prev,
        phone: formatted,
      }));

      scheduleValidate("phone", formatted);
      return;
    }

    // ------------------------------
    // DEFAULT NORMAL FIELD UPDATE
    // ------------------------------
    setForm((prev) => ({ ...prev, [name]: value }));

    // ------------------------------
    // REAL-TIME VALIDATION (debounced)
    // ------------------------------
    scheduleValidate(name, value);
  };

  // Schedule a debounced validateField call per field
  const scheduleValidate = (name: string, value: unknown, ms = 220) => {
    // clear existing
    const prev = validateTimers.current[name];
    if (prev) clearTimeout(prev as ReturnType<typeof setTimeout>);

    validateTimers.current[name] = setTimeout(() => {
      validateField(name, value);
      validateTimers.current[name] = null;
    }, ms);
  };

  const handleOtpVerify = async () => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

    const res = await fetch(`${BACKEND_URL}/otp/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, otp }),
    });

    const data = await res.json();
    if (!data.success) return alert("Incorrect OTP");

    setIsVerified(true);
    setTimeout(() => setShowPopup(false), 1500);
  };

  const handlePhoto = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      console.log("📸 Photo selected:", file.name, file.size, "bytes");

      // Store the file for later upload
      setPhotoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);

      console.log(
        "✅ Photo ready for upload (will upload after profile creation)"
      );
    },
    []
  );
  const validateField = (name: string, value: unknown) => {
    try {
      // ARRAY FIELDS LIKE: fieldName-0
      if (name.includes("-")) {
        const [field, indexStr] = name.split("-");
        const index = Number(indexStr);

        const fieldSchema =
          experienceSchema.shape[field] ||
          educationSchema.shape[field] ||
          skillSchema.shape[field];

        if (!fieldSchema) return;

        // CONDITIONAL:
        if (workType === "fresher" && experienceSchema.shape[field]) return;
        if (workType === "experienced" && educationSchema.shape[field]) return;

        z.object({ [field]: fieldSchema }).parse({ [field]: value });

        setErrors((e) => {
          const copy = { ...e };
          delete copy[name];
          return copy;
        });

        return;
      }

      // NORMAL FIELDS - validate individual primitive fields using zod
      // Provide per-field schemas for immediate feedback so errors are
      // removed as soon as user corrects the value.
      const normalFieldSchemas: Record<string, z.ZodTypeAny> = {
        firstName: z.string().min(1, "First name required"),
        surName: z.string().min(1, "Surname required"),
        email: z.string().email("Invalid email"),
        phone: z
          .string()
          .refine(
            (val) => /^(\+91)[6-9]\d{9}$/.test(val),
            "Enter a valid Indian mobile number"
          ),
        // Cascading/selects that you mark required in the UI
        state: z.string().min(1, "State required"),
        district: z.string().min(1, "District required"),
        city: z.string().min(1, "City required"),
        village: z.string().min(1, "Village required"),
        address: z.string().min(1, "Address required"),
        // Optional / informational fields
        summary: z.string().optional(),
        availabilityCategory: z.string().optional(),
        availabilityState: z.string().optional(),
        availabilityDistrict: z.string().optional(),
        availabilityCity: z.string().optional(),
        availabilityVillage: z.string().optional(),
        joiningDate: z.string().optional(),
        availabilityJobCategory: z.string().optional(),
        expectedSalaryRange: z.string().optional(),
        additionalInfo: z.string().optional(),
      };

      const fieldSchema = normalFieldSchemas[name];

      if (fieldSchema) {
        z.object({ [name]: fieldSchema }).parse({ [name]: value });

        setErrors((e) => {
          const copy = { ...e };
          delete copy[name];
          return copy;
        });
      } else {
        // If we don't have a specific schema, just clear any existing error
        setErrors((e) => {
          const copy = { ...e };
          delete copy[name];
          return copy;
        });
      }
    } catch (err: unknown) {
      let msg = "Invalid value";
      if (err instanceof z.ZodError) {
        msg = err.issues?.[0]?.message || msg;
      } else if (err && typeof err === "object") {
        const maybe = err as {
          message?: string;
          errors?: Array<{ message?: string }>;
        };
        msg = maybe.errors?.[0]?.message || maybe.message || msg;
      }

      // Only set a validation error if the user has interacted with the field
      // or after they tried to submit the form. This prevents showing errors
      // for untouched fields and improves UX while typing.
      if (touched[name] || formSubmitted) {
        setErrors((e) => ({
          ...e,
          [name]: msg,
        }));
      }
    }
  };

  const validateForm = (payload: unknown) => {
    const p = payload as { workType?: string; educationList?: unknown[] };
    console.log("🔍 Validating form with workType:", p.workType);
    console.log("📚 Education entries:", p.educationList?.length || 0);

    const parsed = resumeSchema.safeParse(payload);

    // DEBUG LOG: shows EXACT failing fields
    if (!parsed.success) {
      console.log(
        "❌ ZOD VALIDATION ERRORS:",
        parsed.error.issues.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }))
      );
    } else {
      console.log("✅ Form validation passed!");
    }

    if (parsed.success) {
      setErrors({});
      return true;
    }

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

    setErrors(mapped);
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // mark that user has attempted to submit - show all validation errors
    setFormSubmitted(true);

    console.log("🚀 FORM SUBMIT STARTED");
    console.log("📝 Form Data:", form);
    console.log("💼 Work Type:", workType);
    console.log("📋 Experiences:", experiences);
    console.log("🎓 Education:", educationList);
    console.log("⚡ Skills:", skillsList);

    // Validate first
    const payload = {
      ...form,
      phone: normalizeIndianPhone(form.phone),
      workType,
      experiences,
      educationList,
      skillsList,
    };

    console.log("✅ Validation Payload:", payload);

    const isValid = validateForm(payload);
    console.log("✅ Validation Result:", isValid);

    if (!isValid) {
      console.log("❌ Validation FAILED - scrolling to top");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Transform to backend API format
    const apiPayload = {
      full_name: form.firstName,
      surname: form.surName,
      email: form.email,
      mobile_number: form.phone.replace(/\D/g, "").slice(-10), // Remove +91 and get last 10 digits
      gender: "Male", // Default gender, you may want to add a gender field to form
      address: form.address,
      state: form.state,
      city: form.city,
      country: "India",
      experienced: workType === "experienced",
      fresher: workType === "fresher",
      expected_salary: form.expectedSalaryRange,
      job_category: form.availabilityJobCategory,
      current_location: `${form.availabilityCity}, ${form.availabilityState}`,
      interview_availability: form.availabilityCategory,
      work_experience: experiences.map((exp) => ({
        position: exp.position,
        company: exp.company,
        start_date: exp.startDate,
        end_date: exp.endDate || null,
        salary_period: exp.noticePeriod,
        is_current: !exp.endDate || exp.endDate === "",
      })),
      skills: skillsList.map((skill) => ({
        skill_name: skill.name,
        years_of_experience: skill.years,
      })),
    };

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

      // Call backend API
      const res = await fetch(`${BACKEND_URL}/candidate-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      console.log("📥 Response Status:", res.status);
      console.log("📥 Response OK:", res.ok);

      let data;
      try {
        data = await res.json();
        console.log("📦 Response Data:", data);
      } catch {
        console.error("❌ Failed to parse JSON response");
        setDuplicateError("Server error. Please try again.");
        return;
      }

      // Handle errors
      if (!res.ok) {
        if (res.status === 409) {
          showSnackbar(
            data.message || "Conflict: Email already exists!",
            "error"
          );
        } else if (res.status === 500) {
          showSnackbar(
            data.message || "Internal server error. Please try again later.",
            "error"
          );
        } else {
          showSnackbar(data.message || "Something went wrong", "error");
        }
        setDuplicateError(data.message || "Something went wrong");
        return;
      }

      // Get candidate ID from response
      const candidateId = data.data.id;

      // Upload photo if file was selected
      if (photoFile) {
        try {
          const photoFormData = new FormData();
          photoFormData.append("profile_photo", photoFile);

          const uploadRes = await fetch(
            `${BACKEND_URL}/candidate-profile/${candidateId}/upload`,
            {
              method: "POST",
              body: photoFormData,
            }
          );

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
          } else {
            const errorData = await uploadRes.json();
            if (uploadRes.status === 409) {
              showSnackbar(
                errorData.message || "Conflict during photo upload!",
                "error"
              );
            } else if (uploadRes.status === 500) {
              showSnackbar(
                errorData.message || "Photo upload server error.",
                "error"
              );
            } else {
              showSnackbar(
                errorData.message || "Photo upload failed.",
                "error"
              );
            }
          }
        } catch (photoError) {
          showSnackbar("Photo upload error. Please try again.", "error");
          console.error("❌ Photo upload error:", photoError);
        }
      } else {
        console.log("ℹ️ No photo to upload");
      }

      // Clear error and show success
      setDuplicateError("");
      showSnackbar(
        `Profile created successfully for ${form.firstName} ${form.surName}!`,
        "success"
      );
      // Reset form to initial state after successful creation
      setForm(initialForm);
      setTouched({});
      setFormSubmitted(false);
      setExperiences([
        {
          position: "",
          company: "",
          noticePeriod: "",
          startDate: "",
          endDate: "",
          stillWorkingDate: "",
        },
      ]);
      setEducationList([{ degree: "", university: "", passingYear: "" }]);
      setSkillsList([{ name: "", level: "", years: "" }]);
      setPhotoPreview(null);
      setPhotoFile(null);
      setErrors({});
      setIsVerified(false);
      setShowPopup(false);
    } catch (_err: unknown) {
      // Generic server error — keep a user-friendly message
      setDuplicateError("Server error. Please try again.");
    }
  };

  const stateOptions = indiaData ? Object.keys(indiaData) : [];
  const districtOptions =
    indiaData && form.state ? Object.keys(indiaData[form.state]) : [];
  const cityOptions =
    indiaData && form.state && form.district
      ? Object.keys(indiaData[form.state][form.district])
      : [];
  const villageOptions =
    indiaData && form.state && form.district && form.city
      ? indiaData[form.state][form.district][form.city]
      : [];

  const availabilityStateOptions = stateOptions;
  const availabilityDistrictOptions =
    indiaData && form.availabilityState
      ? Object.keys(indiaData[form.availabilityState])
      : [];
  const availabilityCityOptions =
    indiaData &&
    form.availabilityState &&
    form.availabilityDistrict &&
    indiaData[form.availabilityState][form.availabilityDistrict]
      ? Object.keys(
          indiaData[form.availabilityState][form.availabilityDistrict]
        )
      : [];
  const availabilityVillageOptions =
    indiaData &&
    form.availabilityState &&
    form.availabilityDistrict &&
    form.availabilityCity
      ? indiaData[form.availabilityState][form.availabilityDistrict][
          form.availabilityCity
        ]
      : [];

  if (!isClient) return null;
  // console.log("CURRENT ERRORS --->", errors);
  return (
    <div className="relative min-h-screen w-full flex justify-center px-4 py-10 overflow-x-hidden bg-gray-50">
      <Popup open={showPopup} onClose={() => setShowPopup(false)}>
        <div className="flex flex-col items-center gap-4 mb-4">
          <Image
            src="/images/logo.svg"
            alt="logo"
            width={160}
            height={60}
            style={{ height: "auto", width: "auto" }}
          />
        </div>

        {popupStep === "email" ? (
          <EmailStep
            email={form.email}
            setEmail={(email) => setForm((p) => ({ ...p, email }))}
            loading={emailVerificationLoading}
            onNext={handleEmailNext}
          />
        ) : (
          <OtpStep
            otp={otp}
            setOtp={setOtp}
            onVerify={handleOtpVerify}
            isVerified={isVerified}
          />
        )}
      </Popup>

      <BgVideo />

      <Particles className="absolute inset-0 -z-10" />

      <div className="w-full max-w-5xl p-8 overflow-x-hidden bg-white rounded-2xl shadow-lg">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo.svg"
            alt="logo"
            width={160}
            height={60}
            style={{ height: "auto", width: "auto" }}
          />
        </div>

        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Create Your Rojgari Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-10 text-gray-800">
          {/* Personal Info */}
          <>
            <h3 className="text-lg font-semibold text-gray-800">
              PERSONAL INFO
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              <InputBox
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
              />
              <InputBox
                label="Surname"
                name="surName"
                value={form.surName}
                onChange={handleChange}
                error={errors.surName}
                required
              />

              <label className="w-full h-[45px] sm:h-auto bg-white/10 border border-gray-300 rounded-xl flex items-center justify-center cursor-pointer text-gray-400 overflow-hidden row-span-1 md:row-span-3">
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Photo preview"
                    width={128}
                    height={160}
                    className="w-auto h-auto object-cover"
                  />
                ) : (
                  <span className="text-m opacity-80 sm:text-left">
                    Upload Photo
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  className="hidden"
                />
              </label>

              <InputBox
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
              <InputBox
                label="Mobile Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />

              <SelectBox
                label="State"
                name="state"
                value={form.state}
                options={stateOptions}
                onChange={handleChange}
                error={errors.state}
              />
              <SelectBox
                label="District"
                name="district"
                value={form.district}
                options={districtOptions}
                onChange={handleChange}
                error={errors.district}
              />
              <SelectBox
                label="City"
                name="city"
                value={form.city}
                options={cityOptions}
                onChange={handleChange}
                error={errors.city}
              />

              <SelectBox
                label="Village"
                name="village"
                value={form.village}
                options={villageOptions}
                onChange={handleChange}
                error={errors.village}
              />

              <InputBox
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                error={errors.address}
              />

              <div className="lg:col-span-3">
                <div className="relative w-full h-28">
                  <textarea
                    name="summary"
                    value={form.summary}
                    onChange={handleChange}
                    placeholder=" "
                    className={`peer w-full px-4 pt-6 pb-2 rounded-xl bg-white
                      border outline-none transition-all
                      ${errors.summary ? "border-red-500" : "border-gray-300"}
                      focus:border-[#72B76A] focus:ring-1 focus:ring-[#72B76A]
                      resize-none h-full`}
                  />

                  <label
                    className={`absolute left-4 px-1 bg-white text-gray-500 pointer-events-none
                      transition-all duration-150
                      top-1/2 -translate-y-1/2
                      peer-focus:top-1 peer-focus:-translate-y-1/2 peer-focus:text-sm peer-focus:text-[#72B76A]
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base
                      peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:-translate-y-1/2 peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:text-[#72B76A]`}
                  >
                    Summary
                  </label>
                  {errors.summary && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.summary}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* duplicateError is shown via global toast; do not render inline */}
          </>

          {/* Work Type Toggle */}
          <div className="grid grid-cols-2 gap-4 w-full">
            {/* EXPERIENCED BUTTON */}
            <button
              type="button"
              onClick={() => {
                setWorkType("experienced");

                // Experience is required → ensure at least one row
                setExperiences((prev) =>
                  prev.length === 0
                    ? [
                        {
                          position: "",
                          company: "",
                          noticePeriod: "",
                          startDate: "",
                          endDate: "",
                          stillWorkingDate: "",
                        },
                      ]
                    : prev
                );

                // Education is NOT required for experienced → clear it
                setEducationList([]);
              }}
              className={`
      w-full h-12 rounded-lg transition
      ${
        workType === "experienced"
          ? "bg-[#72B76A] text-white border border-[#72B76A]"
          : "bg-transparent text-[#72B76A] border border-[#72B76A]"
      }
    `}
            >
              Experienced
            </button>

            {/* FRESHER BUTTON */}
            <button
              type="button"
              onClick={() => {
                setWorkType("fresher");

                // Education is required → ensure at least one row
                setEducationList((prev) =>
                  prev.length === 0
                    ? [{ degree: "", university: "", passingYear: "" }]
                    : prev
                );

                // Experience is NOT required for fresher → clear it
                setExperiences([]);
              }}
              className={`
      w-full h-12 rounded-lg transition
      ${
        workType === "fresher"
          ? "bg-[#72B76A] text-white border border-[#72B76A]"
          : "bg-transparent text-[#72B76A] border border-[#72B76A]"
      }
    `}
            >
              Fresher
            </button>
          </div>

          {/* Experience / Education */}
          {workType === "experienced" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Work Experience
              </h3>

              {experiences.map((exp, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-5 bg-white/70 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputBox
                      label="Position"
                      name={`position-${index}`}
                      value={exp.position}
                      onChange={(e) => {
                        setExperiences((p) =>
                          p.map((v, i) =>
                            i === index ? { ...v, position: e.target.value } : v
                          )
                        );
                        validateField(`position-${index}`, e.target.value);
                      }}
                      error={errors[`position-${index}`]}
                      required
                    />
                    <InputBox
                      label="Company"
                      name={`company-${index}`}
                      value={exp.company}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExperiences((p) =>
                          p.map((v, i) =>
                            i === index ? { ...v, company: val } : v
                          )
                        );
                        validateField(`company-${index}`, val);
                      }}
                      error={errors[`company-${index}`]}
                      required
                    />
                    <InputBox
                      label="Notice Period"
                      name={`noticePeriod-${index}`}
                      value={exp.noticePeriod}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExperiences((p) =>
                          p.map((v, i) =>
                            i === index ? { ...v, noticePeriod: val } : v
                          )
                        );
                        validateField(`noticePeriod-${index}`, val);
                      }}
                      error={errors[`noticePeriod-${index}`]}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DatePicker
                      label="Start Date"
                      name={`startDate-${index}`}
                      value={exp.startDate}
                      onChange={(e) => {
                        const newStartDate = e.target.value;
                        setExperiences((p) =>
                          p.map((v, i) =>
                            i === index ? { ...v, startDate: newStartDate } : v
                          )
                        );
                        // mark touched for this array field
                        setTouched((t) => ({
                          ...t,
                          [`startDate-${index}`]: true,
                        }));
                        // Validate against endDate if it exists
                        if (exp.endDate) {
                          validateExperienceDates(
                            index,
                            newStartDate,
                            exp.endDate
                          );
                        }
                        // validate the startDate field itself (debounced)
                        scheduleValidate(`startDate-${index}`, newStartDate);
                      }}
                      error={errors[`startDate-${index}`]}
                      required
                    />

                    <DatePicker
                      label="End Date"
                      name={`endDate-${index}`}
                      value={exp.endDate}
                      onChange={(e) => {
                        const newEndDate = e.target.value;
                        setExperiences((prev) =>
                          prev.map((v, i) =>
                            i === index ? { ...v, endDate: newEndDate } : v
                          )
                        );
                        // mark touched and validate
                        setTouched((t) => ({
                          ...t,
                          [`endDate-${index}`]: true,
                        }));
                        // Validate against startDate in real-time
                        validateExperienceDates(
                          index,
                          exp.startDate,
                          newEndDate
                        );
                        scheduleValidate(`endDate-${index}`, newEndDate);
                      }}
                      error={errors[`endDate-${index}`]}
                    />

                    <DatePicker
                      label="Still Working From"
                      name={`stillWorkingDate-${index}`}
                      value={exp.stillWorkingDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExperiences((prev) =>
                          prev.map((v, i) =>
                            i === index ? { ...v, stillWorkingDate: val } : v
                          )
                        );
                        setTouched((t) => ({
                          ...t,
                          [`stillWorkingDate-${index}`]: true,
                        }));
                        scheduleValidate(`stillWorkingDate-${index}`, val);
                      }}
                      error={errors[`stillWorkingDate-${index}`]}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExperiences((p) => [
                          ...p,
                          {
                            position: "",
                            company: "",
                            noticePeriod: "",
                            startDate: "",
                            endDate: "",
                            stillWorkingDate: "",
                          },
                        ])
                      }
                      className="w-7 h-7 text-xl font-bold rounded-md text-[#72B76A] border border-[#72B76A]"
                    >
                      +
                    </button>

                    <button
                      type="button"
                      disabled={experiences.length === 1}
                      onClick={() =>
                        setExperiences((p) => p.filter((_, i) => i !== index))
                      }
                      className={`w-7 h-7 text-xl font-bold rounded-md ${
                        experiences.length === 1
                          ? "text-[#A6D8A3] border border-[#A6D8A3] font-bold rounded-md cursor-not-allowed"
                          : "bg-[#72B76A] text-white"
                      }`}
                    >
                      –
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {workType === "fresher" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Education Details
              </h3>

              {educationList.map((edu, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-5 bg-white/70 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputBox
                      label="Degree"
                      name={`degree-${index}`}
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...educationList];
                        updated[index].degree = e.target.value;
                        setEducationList(updated);
                      }}
                      error={errors[`degree-${index}`]}
                      required
                    />

                    <InputBox
                      label="University"
                      name={`university-${index}`}
                      value={edu.university}
                      onChange={(e) => {
                        const updated = [...educationList];
                        updated[index].university = e.target.value;
                        setEducationList(updated);
                      }}
                      error={errors[`university-${index}`]}
                      required
                    />

                    <InputBox
                      label="Passing Year"
                      name={`passingYear-${index}`}
                      value={edu.passingYear}
                      onChange={(e) => {
                        const updated = [...educationList];
                        updated[index].passingYear = e.target.value;
                        setEducationList(updated);
                      }}
                      error={errors[`passingYear-${index}`]}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEducationList([
                          ...educationList,
                          {
                            degree: "",
                            university: "",
                            passingYear: "",
                          },
                        ])
                      }
                      className="w-7 h-7 text-xl font-bold rounded-md text-[#72B76A] border border-[#72B76A]"
                    >
                      +
                    </button>

                    <button
                      type="button"
                      disabled={educationList.length === 1}
                      onClick={() =>
                        setEducationList(
                          educationList.filter((_, i) => i !== index)
                        )
                      }
                      className={`w-7 h-7 text-xl ${
                        educationList.length === 1
                          ? "text-[#A6D8A3] border border-[#A6D8A3]  font-bold rounded-md  cursor-not-allowed"
                          : "bg-[#72B76A] text-white"
                      }`}
                    >
                      –
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Skills</h3>

            {skillsList.map((skill, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-5 bg-white/70 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputBox
                    label="Skill Name"
                    name={`name-${index}`}
                    value={skill.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      const updated = [...skillsList];
                      updated[index].name = val;
                      setSkillsList(updated);
                      setTouched((t) => ({ ...t, [`name-${index}`]: true }));
                      scheduleValidate(`name-${index}`, val);
                    }}
                    error={errors[`name-${index}`]}
                    required
                  />

                  <SelectBox
                    label="Level"
                    name={`level-${index}`}
                    value={skill.level}
                    options={["Beginner", "Intermediate", "Expert"]}
                    onChange={(e) => {
                      const val = e.target.value;
                      const updated = [...skillsList];
                      updated[index].level = val;
                      setSkillsList(updated);
                      setTouched((t) => ({ ...t, [`level-${index}`]: true }));
                      scheduleValidate(`level-${index}`, val);
                    }}
                    error={errors[`level-${index}`]}
                    required
                  />

                  <InputBox
                    label="Years of Experience"
                    name={`years-${index}`}
                    value={skill.years}
                    onChange={(e) => {
                      const val = e.target.value;
                      const updated = [...skillsList];
                      updated[index].years = val;
                      setSkillsList(updated);
                      setTouched((t) => ({ ...t, [`years-${index}`]: true }));
                      scheduleValidate(`years-${index}`, val);
                    }}
                    error={errors[`years-${index}`]}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSkillsList([
                        ...skillsList,
                        { name: "", level: "", years: "" },
                      ])
                    }
                    className="w-7 h-7 text-xl font-bold rounded-md text-[#72B76A] border border-[#72B76A]"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    disabled={skillsList.length === 1}
                    onClick={() =>
                      setSkillsList(skillsList.filter((_, i) => i !== index))
                    }
                    className={`w-7 h-7 text-xl ${
                      skillsList.length === 1
                        ? "text-[#A6D8A3] border border-[#A6D8A3] font-bold rounded-md cursor-not-allowed"
                        : "bg-[#72B76A] text-white"
                    }`}
                  >
                    –
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Availability
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectBox
                label="Category"
                name="availabilityCategory"
                value={form.availabilityCategory}
                options={["Part-Time", "Full-Time", "Contract", "Internship"]}
                onChange={handleChange}
                error={errors.availabilityCategory}
              />

              <SelectBox
                label="State"
                name="availabilityState"
                value={form.availabilityState}
                options={availabilityStateOptions}
                onChange={handleChange}
                error={errors.availabilityState}
              />

              <SelectBox
                label="District"
                name="availabilityDistrict"
                value={form.availabilityDistrict}
                options={availabilityDistrictOptions}
                onChange={handleChange}
                error={errors.availabilityDistrict}
              />

              <SelectBox
                label="City"
                name="availabilityCity"
                value={form.availabilityCity}
                options={availabilityCityOptions}
                onChange={handleChange}
                error={errors.availabilityCity}
              />

              <SelectBox
                label="Village"
                name="availabilityVillage"
                value={form.availabilityVillage}
                options={availabilityVillageOptions}
                onChange={handleChange}
                error={errors.availabilityVillage}
              />

              <InputBox
                label="Additional Info"
                name="additionalInfo"
                value={form.additionalInfo}
                onChange={handleChange}
                error={errors.additionalInfo}
              />

              <DatePicker
                label="Joining Date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={handleChange}
                error={errors.joiningDate}
              />

              <SelectBox
                label="Job Category"
                name="availabilityJobCategory"
                value={form.availabilityJobCategory}
                options={[
                  "IT & Software",
                  "Tech Support",
                  "Doctors",
                  "Nurses",
                  "Teachers",
                  "Marketing",
                  "Sales",
                  "Accountant",
                  "Engineer",
                  "Driver",
                  "Receptionist",
                  "Customer Support",
                  "Factory Worker",
                  "Electrician",
                  "Other",
                ]}
                onChange={handleChange}
                error={errors.availabilityJobCategory}
              />

              <SelectBox
                label="Expected Salary Range"
                name="expectedSalaryRange"
                value={form.expectedSalaryRange}
                options={[
                  "1 Lakh - 2 Lakh",
                  "2 Lakh - 3 Lakh",
                  "3 Lakh - 4 Lakh",
                  "4 Lakh - 5 Lakh",
                  "5 Lakh - 7 Lakh",
                  "7 Lakh - 10 Lakh",
                ]}
                onChange={handleChange}
                error={errors.expectedSalaryRange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn 
              w-full h-12 bg-[#72B76A] text-white rounded-xl 
              font-semibold text-lg transition active:scale-95
            "
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResumePage;
