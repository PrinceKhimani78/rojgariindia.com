"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import SearchableSelectBox from "@/components/resume/SearchableSelectBox";
import Image from "next/image";
import Particles from "react-tsparticles";
import { z } from "zod";
import BgVideo from "@/components/resume/BgVideo";
import Popup from "@/components/resume/Popup";
import InputBox from "@/components/resume/InputBox";
import SelectBox from "@/components/resume/SelectBox";
import DatePicker from "@/components/resume/DatePicker";
import MultiSelectBox from "@/components/resume/MultiSelectBox";
import EmailStep from "@/components/resume/popup/EmailStep";
import OtpStep from "@/components/resume/popup/OtpStep";
import {
  experienceSchema,
  educationSchema,
  skillSchema,
  certificationSchema,
  resumeSchema,
} from "@/schemas/resumeSchemas";
import { useGlobalUI } from "@/components/global/GlobalUIProvider";
import UI_MESSAGES from "@/constants/uiMessages";
import {
  initialForm,
  normalizeIndianPhone,
  validateField as validateFieldUtil,
  validateForm as validateFormUtil,
  validateExperienceDates as validateExperienceDatesUtil,
} from "@/utils/formValidation";
import { sendOtp, verifyOtp } from "@/services/otpService";

const phoneRegex = /^(?:\+91[-\s]?)?(?:\d{10}|\d{5}\s?\d{5})$/;

type IndiaJson = {
  [state: string]: {
    [district: string]: {
      [city: string]: string[];
    };
  };
};
const INDUSTRY_OPTIONS = [
  "Healthcare",
  "Information Technology",
  "Construction",
  "Education",
  "Finance & Accounting",
  "Sales & Marketing",
  "Manufacturing",
  "Retail",
  "Logistics",
  "Hospitality",
  "Engineering",
  "Government",
  "Legal",
  "Freelancer",
  "Other",
];

const INDUSTRY_JOB_MAP: Record<string, string[]> = {
  "Information Technology": [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UI/UX Designer",
    "QA Engineer",
  ],
  Healthcare: ["Doctor", "Nurse", "Pharmacist"],
  Education: ["Teacher", "Professor", "Tutor"],
  "Finance & Accounting": ["Accountant", "Auditor", "Tax Consultant"],
  "Sales & Marketing": ["Sales Executive", "Marketing Manager"],
  Manufacturing: ["Production Supervisor", "Machine Operator"],
  Construction: ["Site Engineer", "Civil Engineer"],
  Retail: ["Store Manager", "Sales Associate"],
  Logistics: ["Warehouse Manager", "Delivery Executive"],
  Hospitality: ["Hotel Manager", "Chef"],
  Engineering: ["Mechanical Engineer", "Electrical Engineer"],
  Government: ["Clerk", "Officer"],
  Legal: ["Lawyer", "Legal Advisor"],
  Freelancer: ["Freelancer"],
  Other: ["Other"],
};

const INDIAN_LANGUAGES = [
  "Hindi",
  "English",
  "Bengali",
  "Marathi",
  "Telugu",
  "Tamil",
  "Gujarati",
  "Urdu",
  "Kannada",
  "Odia",
  "Malayalam",
  "Punjabi",
  "Sanskrit",
  "Assamese",
  "Maithili",
  "Santali",
  "Kashmiri",
  "Nepali",
  "Gondi",
  "Sindhi",
  "Konkani",
  "Dogri",
  "Manipuri",
  "Khasi",
  "Bodo",
  "Garo",
  "Mizo",
  "Ho",
  "Kui",
  "Mundari",
  "Tripuri",
];

type WorkType = "experienced" | "fresher";

type ExperienceEntry = {
  industry: string;
  customIndustry?: string;
  position: string;
  company: string;
  noticePeriod: string;
  startDate: string;
  endDate: string;
  currentWages?: string;
  currentCity?: string;
  currentVillage?: string;
  currentVillageOther?: string;
};

type CertificationEntry = {
  name: string;
  year: string;
  achievement: string;
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
  const [loading, setLoading] = useState(false);

  // Timers for debounced validation per-field
  const validateTimers = React.useRef<
    Record<string, ReturnType<typeof setTimeout> | null>
  >({});

  const [form, setForm] = useState(initialForm);
  // experience
  const [experiencesExperienced, setExperiencesExperienced] = useState<
    ExperienceEntry[]
  >([
    {
      industry: "",
      customIndustry: "",
      position: "",
      company: "",
      noticePeriod: "",
      startDate: "",
      endDate: "",
    },
  ]);
  const updateExperience = (
    index: number,
    field: keyof ExperienceEntry,
    value: string,
  ) => {
    setExperiencesExperienced((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      // If industry changes and is not Other → clear customIndustry
      if (field === "industry" && value !== "Other") {
        updated[index].customIndustry = "";
      }

      return updated;
    });
  };
  const [educationExperienced, setEducationExperienced] = useState([
    { degree: "", university: "", passingYear: "", grade: "" },
  ]);
  const [skillsExperienced, setSkillsExperienced] = useState([{ name: "" }]);
  const [certificationsExperienced, setCertificationsExperienced] = useState<
    CertificationEntry[]
  >([{ name: "", year: "", achievement: "" }]);

  // freshers
  const [educationFresher, setEducationFresher] = useState([
    { degree: "", university: "", passingYear: "", grade: "" },
  ]);

  const [skillsFresher, setSkillsFresher] = useState([{ name: "" }]);

  const [certificationsFresher, setCertificationsFresher] = useState<
    CertificationEntry[]
  >([{ name: "", year: "", achievement: "" }]);

  // Default years to "0" since we removed the input but schema might check min length?
  // We updated schema to optional? No.
  // We'll set it to "0" to pass "min(1)" check.

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
        // failed to load india JSON — ignore in client
      }
    };

    loadIndiaData();
  }, []);
  useEffect(() => {
    setShowPopup(true);
  }, []);
  const handleEmailNext = async () => {
    if (!form.email) return alert(UI_MESSAGES.ENTER_EMAIL);

    setEmailVerificationLoading(true);
    setLoading(true);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

    try {
      const result = await sendOtp(BACKEND_URL, form.email);
      if (result.success) {
        setPopupStep("otp");
      } else {
        showSnackbar(result.message || UI_MESSAGES.SERVER_ERROR, "error");
      }
    } catch (err) {
      showSnackbar(UI_MESSAGES.SERVER_ERROR, "error");
    } finally {
      setEmailVerificationLoading(false);
      setLoading(false);
    }
  };

  // validateExperienceDates moved to utils; page will set/clear errors using the result

  const handleChange = (arg1: any, arg2?: any) => {
    let name: string;
    let value: any;

    // 🔹 Case 1: Normal Input (event)
    if (arg1?.target) {
      name = arg1.target.name;

      if (arg1.target.type === "checkbox") {
        value = arg1.target.checked;
      } else {
        value = arg1.target.value;
      }
    }
    // 🔹 Case 2: SearchableSelectBox (name, value)
    else {
      name = arg1;
      value = arg2;
    }

    const actualValue = typeof value === "string" ? value : value?.value || "";

    if (!name || typeof name !== "string") return;

    // ===============================
    // WORK EXPERIENCE INDUSTRY
    // ===============================
    if (name.startsWith("industry-")) {
      const index = parseInt(name.split("-")[1]);

      setExperiencesExperienced((prev) => {
        const updated = [...prev];
        updated[index].industry = actualValue;

        if (actualValue !== "Other") {
          updated[index].customIndustry = "";
        }

        return updated;
      });

      return;
    }

    if (name.startsWith("customIndustry-")) {
      const index = parseInt(name.split("-")[1]);

      setExperiencesExperienced((prev) => {
        const updated = [...prev];
        updated[index].customIndustry = actualValue;
        return updated;
      });

      return;
    }

    // ===============================
    // AVAILABILITY INDUSTRY
    // ===============================
    if (name === "availabilityIndustry") {
      setForm((prev) => ({
        ...prev,
        availabilityIndustry: actualValue,
        availabilityCustomIndustry:
          actualValue !== "Other" ? "" : prev.availabilityCustomIndustry,
        availabilityJobCategory: "",
      }));
      return;
    }

    if (name === "availabilityCustomIndustry") {
      setForm((prev) => ({
        ...prev,
        availabilityCustomIndustry: actualValue,
      }));
      return;
    }

    // ===============================
    // DEFAULT FORM FIELDS
    // ===============================
    setForm((prev) => ({
      ...prev,
      [name]: actualValue,
    }));

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
      const parts = name.split("-");
      const index = Number(parts[parts.length - 1]);
      const fieldName = parts.length > 2 ? parts[1] : parts[0];
      const prefix = parts.length > 2 ? parts[0] : "";

      // INT ONLY FIELDS
      if (
        fieldName === "noticePeriod" ||
        fieldName === "currentWages" ||
        fieldName === "year" ||
        fieldName === "passingYear"
      ) {
        value = value.replace(/\D/g, "");
      }

      // EXPERIENCE FIELDS
      if (
        !prefix &&
        (fieldName === "industry" || experienceSchema.shape[fieldName])
      ) {
        setExperiences((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, [fieldName]: value } : item,
          ),
        );

        scheduleValidate(name, value);
        return;
      }

      // EDUCATION FIELDS
      if (
        !prefix &&
        ["degree", "university", "passingYear", "grade"].includes(fieldName)
      ) {
        setEducationList((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, [fieldName]: value } : item,
          ),
        );
        scheduleValidate(name, value);
        return;
      }

      // SKILL FIELDS
      if (prefix === "skill" && skillSchema.shape[fieldName]) {
        setSkillsList((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, [fieldName]: value } : item,
          ),
        );
        scheduleValidate(name, value);
        return;
      }

      // CERTIFICATION FIELDS
      if (prefix === "cert" && certificationSchema.shape[fieldName]) {
        setCertificationList((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, [fieldName]: value } : item,
          ),
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
        availabilityCity: [],
      }));
      scheduleValidate("availabilityState", value);
      return;
    }

    if (name === "availabilityDistrict") {
      setForm((f) => ({
        ...f,
        availabilityDistrict: value,
        availabilityCity:
          value === f.availabilityDistrict ? f.availabilityCity : [],
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

    // MOBILE NUMBER & ALTERNATE MOBILE VALIDATION
    if (name === "phone" || name === "alternateMobile") {
      let digits = value.replace(/\D/g, "");

      // If length > 10 and starts with 91, assume it's the prefix we added or user added
      if (digits.length > 10 && digits.startsWith("91")) {
        digits = digits.slice(2);
      }

      // Truncate to 10 digits
      if (digits.length > 10) {
        digits = digits.slice(0, 10);
      }

      let formatted = digits;
      if (digits.length === 10) {
        formatted = "+91 " + digits;
      }

      setForm((prev) => ({
        ...prev,
        [name]: formatted,
      }));

      scheduleValidate(name, formatted);
      return;
    }

    // ------------------------------
    // DEFAULT NORMAL FIELD UPDATE
    // ------------------------------
    if (
      name === "expectedSalary" ||
      name === "totalExperience" ||
      name === "pincode"
    ) {
      value = value.replace(/\D/g, "");
    }

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
      const err = validateFieldUtil(name, value, workType);

      if (err) {
        // only show error if user interacted or after a submit attempt
        if (touched[name] || formSubmitted) {
          setErrors((e) => ({ ...e, [name]: err }));
        }
      } else {
        // clear success unconditionally so corrected values remove errors
        setErrors((e) => {
          const copy = { ...e };
          delete copy[name];
          return copy;
        });
      }

      validateTimers.current[name] = null;
    }, ms);
  };

  const handleOtpVerify = async () => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    setLoading(true);
    try {
      const result = await verifyOtp(BACKEND_URL, form.email, otp);
      if (!result.success) {
        showSnackbar(UI_MESSAGES.INCORRECT_OTP, "error");
        return;
      }

      setIsVerified(true);
      setTimeout(() => setShowPopup(false), 1500);
    } catch (err) {
      showSnackbar(UI_MESSAGES.SERVER_ERROR, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoto = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      // Store the file for later upload
      setPhotoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
      // Photo prepared for preview/upload
    },
    [],
  );
  // validateField and validateForm moved to utils. We'll call them and
  // set/clear errors here to keep component state local.

  // validateForm moved to utils; call validateFormUtil(payload) below in submit

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("FORM SUBMIT TRIGGERED");
    e.preventDefault();
    // mark that user has attempted to submit - show all validation errors
    setFormSubmitted(true);

    // CHECK PHOTO UPLOAD (Optional now)
    // if (!photoFile) {
    //   setErrors((prev) => ({ ...prev, photo: "Profile photo is required" }));
    //   showSnackbar("Please upload a profile photo.", "error");
    //   window.scrollTo({ top: 0, behavior: "smooth" });
    //   return;
    // }

    // Validate first
    const payload = {
      ...form,
      phone: normalizeIndianPhone(form.phone),
      workType,
      experiences,
      educationList,
      skillsList,
    };

    const vf = validateFormUtil(payload);
    if (!vf.isValid) {
      setErrors(vf.errors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Clear any stale errors if form is valid
    setErrors({});

    // Transform to backend API format
    const apiPayload = {
      full_name: form.firstName,
      surname: form.surName,
      email: form.email,
      mobile_number: form.phone.replace(/\D/g, "").slice(-10),
      gender: form.gender,
      marital_status: form.maritalStatus,
      alternate_mobile_number: form.alternateMobile?.replace(/\D/g, "") || "",
      date_of_birth: form.dob,
      address: form.address,
      state: form.state,
      district: form.district,
      city: form.city,
      village: form.village === "Other" ? form.otherVillage : form.village,
      country: "India",
      experienced: workType === "experienced",
      fresher: workType === "fresher",
      expected_salary: form.expectedSalary,
      expected_salary_min: form.expectedSalary
        ? Number(form.expectedSalary)
        : null,
      expected_salary_max: form.expectedSalary
        ? Number(form.expectedSalary)
        : null,
      total_experience_years: form.totalExperience
        ? Number(form.totalExperience)
        : null,
      job_category: form.availabilityJobCategory,
      current_location: `${form.availabilityCity}, ${form.availabilityState}`,

      interview_availability: form.availabilityCategory,
      preferred_shift: form.availabilityCategory, // Mapping to both for now to be safe
      pref_state: form.availabilityState,
      pref_district: form.availabilityDistrict,
      pref_city: form.availabilityCity.join(", "),
      pref_village:
        form.availabilityVillage === "Other"
          ? form.availabilityOtherVillage
          : form.availabilityVillage,

      summary: form.summary,
      additional_info: form.additionalInfo,
      pincode: form.pincode,

      work_experience:
        workType === "experienced"
          ? experiencesExperienced
          : []
              .filter(
                (exp) =>
                  exp.position.trim() !== "" || exp.company.trim() !== "",
              )
              .map((exp) => ({
                industry: exp.industry,

                position: exp.position,
                company: exp.company,
                start_date: exp.startDate,
                end_date: exp.endDate || null,
                salary_period: exp.noticePeriod,
                is_current: !exp.endDate || exp.endDate === "",
                current_wages: exp.currentWages
                  ? Number(exp.currentWages)
                  : null,
                current_city: exp.currentCity,
                current_village:
                  exp.currentVillage === "Other (Type Manually)"
                    ? exp.currentVillageOther
                    : exp.currentVillage,
              })),
      education:
        workType === "experienced"
          ? educationExperienced.map((edu) => ({
              degree: edu.degree,
              university: edu.university,
              passing_year: edu.passingYear,
              grade: edu.grade,
            }))
          : educationFresher
              .filter(
                (edu) =>
                  edu.degree.trim() !== "" || edu.university.trim() !== "",
              )
              .map((edu) => ({
                degree: edu.degree,
                university: edu.university,
                passing_year: edu.passingYear,
                grade: edu.grade,
              })),

      skills:
        workType === "experienced"
          ? skillsExperienced
          : skillsFresher
              .filter((skill) => skill.name.trim() !== "")
              .map((skill) => ({
                skill_name: skill.name,
              })),
      languages_known: form.languagesKnown,
      certifications:
        workType === "experienced"
          ? certificationsExperienced
          : certificationsFresher
              .filter((cert) => cert.name.trim() !== "")
              .map((cert) => ({
                name: cert.name,
                year: cert.year,
                achievement: cert.achievement,
              })),
    };
    console.log("Education being sent:", apiPayload.education);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    setLoading(true);
    try {
      // Call backend API
      const res = await fetch(`${BACKEND_URL}/candidate-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      // response received
      let data;
      try {
        data = await res.json();
        // parsed response
      } catch {
        // failed to parse JSON response
        showSnackbar(UI_MESSAGES.FAILED_PARSE_JSON, "error");
        setDuplicateError(UI_MESSAGES.SERVER_ERROR);
        return;
      }

      // Handle errors
      if (!res.ok) {
        if (res.status === 409) {
          showSnackbar(data.message || UI_MESSAGES.CONFLICT_EMAIL, "error");
        } else if (res.status === 500) {
          showSnackbar(data.message || UI_MESSAGES.SERVER_ERROR, "error");
        } else {
          showSnackbar(
            data.message || UI_MESSAGES.SOMETHING_WENT_WRONG,
            "error",
          );
        }
        setDuplicateError(data.message || UI_MESSAGES.SOMETHING_WENT_WRONG);
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
            },
          );

          if (uploadRes.ok) {
            await uploadRes.json();
          } else {
            const errorData = await uploadRes.json();
            if (uploadRes.status === 409) {
              showSnackbar(
                errorData.message || UI_MESSAGES.PHOTO_UPLOAD_CONFLICT,
                "error",
              );
            } else if (uploadRes.status === 500) {
              showSnackbar(
                errorData.message || UI_MESSAGES.PHOTO_UPLOAD_SERVER_ERROR,
                "error",
              );
            } else {
              showSnackbar(
                errorData.message || UI_MESSAGES.PHOTO_UPLOAD_FAILED,
                "error",
              );
            }
          }
        } catch (photoError) {
          showSnackbar(UI_MESSAGES.PHOTO_UPLOAD_FAILED, "error");
        }
      } else {
        // no photo selected to upload
      }

      // Clear error and show success
      setDuplicateError("");
      showSnackbar(
        UI_MESSAGES.PROFILE_CREATED_SUCCESS(form.firstName, form.surName),
        "success",
      );
      // Reset form to initial state after successful creation
      setForm(initialForm);
      setTouched({});
      setFormSubmitted(false);
      setCertificationList([{ name: "", year: "", achievement: "" }]);
      setExperiences([
        {
          industry: "",
          position: "",
          company: "",
          noticePeriod: "",
          startDate: "",
          endDate: "",
          currentWages: "",
          currentCity: "",
          currentVillage: "",
          currentVillageOther: "",
        },
      ]);
      setEducationList([
        { degree: "", university: "", passingYear: "", grade: "" },
      ]);
      setSkillsList([{ name: "" }]);
      setPhotoPreview(null);
      setPhotoFile(null);
      setErrors({});
      setIsVerified(false);
      setShowPopup(false);
    } catch (err) {
      setDuplicateError(UI_MESSAGES.SERVER_ERROR);
      showSnackbar(UI_MESSAGES.SERVER_ERROR, "error");
    } finally {
      setLoading(false);
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
          indiaData[form.availabilityState][form.availabilityDistrict],
        )
      : [];
  // const availabilityVillageOptions =
  //   indiaData &&
  //   form.availabilityState &&
  //   form.availabilityDistrict &&
  //   form.availabilityCity
  //     ? indiaData[form.availabilityState][form.availabilityDistrict][
  //         form.availabilityCity
  //       ]
  //     : [];

  if (!isClient) return null;
  // console.log("CURRENT ERRORS --->", errors);
  const experiences = workType === "experienced" ? experiencesExperienced : [];

  const setExperiences =
    workType === "experienced" ? setExperiencesExperienced : () => {};
  const educationList =
    workType === "experienced" ? educationExperienced : educationFresher;

  const setEducationList =
    workType === "experienced" ? setEducationExperienced : setEducationFresher;
  const skillsList =
    workType === "experienced" ? skillsExperienced : skillsFresher;

  const setSkillsList =
    workType === "experienced" ? setSkillsExperienced : setSkillsFresher;

  const certificationList =
    workType === "experienced"
      ? certificationsExperienced
      : certificationsFresher;

  const setCertificationList =
    workType === "experienced"
      ? setCertificationsExperienced
      : setCertificationsFresher;

  const jobCategoryOptions = INDUSTRY_JOB_MAP[form.availabilityIndustry] || [];
  return (
    <div className="relative min-h-screen w-full flex justify-center px-4 py-10 overflow-x-hidden">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
            <div className="text-white">Loading...</div>
          </div>
        </div>
      )}
      <Popup
        open={showPopup}
        onClose={() => setShowPopup(false)}
        // onClose={() => {
        //   if (popupStep === "email" && !form.email?.trim()) {
        //     return;
        //   }
        //   setShowPopup(false);
        // }}
      >
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

      <div className="w-full max-w-5xl p-8 overflow-x-hidden bg-white rounded-2xl shadow-md">
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
              PERSONAL INFORMATION
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
                label="Last Name"
                name="surName"
                value={form.surName}
                onChange={handleChange}
                error={errors.surName}
                required
              />
              <label
                className={`w-full h-[45px] sm:h-auto bg-white/10 border ${errors.photo ? "border-red-500" : "border-gray-300"} rounded-xl flex items-center justify-center cursor-pointer text-gray-400 overflow-hidden row-span-1 md:row-span-3 relative`}
              >
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Photo preview"
                    width={128}
                    height={160}
                    className="w-auto h-auto object-cover"
                  />
                ) : (
                  <span
                    className={`text-m opacity-80 sm:text-left ${errors.photo ? "text-red-500" : ""}`}
                  >
                    {errors.photo ? "Photo Required" : "Upload Photo"}
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handlePhoto(e);
                    if (e.target.files?.[0]) {
                      setErrors((prev) => {
                        const newErr = { ...prev };
                        delete newErr.photo;
                        return newErr;
                      });
                    }
                  }}
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
              {/* NEW PERSONAL FIELDS */}
              <InputBox
                label="Alternate Mobile"
                name="alternateMobile"
                value={form.alternateMobile || ""}
                onChange={handleChange}
                error={errors.alternateMobile}
              />
              <DatePicker
                label="Date of Birth"
                name="dob"
                value={form.dob || ""}
                onChange={handleChange}
                error={errors.dob}
                required
              />
              <SearchableSelectBox
                label="Gender"
                name="gender"
                value={form.gender || ""}
                options={["Male", "Female", "Other"]}
                onChange={handleChange}
                error={errors.gender}
                required
              />
              <SearchableSelectBox
                label="Marital Status"
                name="maritalStatus"
                value={form.maritalStatus || ""}
                options={["Single", "Married", "Divorced", "Widowed"]}
                onChange={handleChange}
                error={errors.maritalStatus}
                required
              />
              <SearchableSelectBox
                label="State"
                name="state"
                value={form.state}
                options={stateOptions}
                onChange={handleChange}
                error={errors.state}
                required
              />
              <SearchableSelectBox
                label="District"
                name="district"
                value={form.district}
                options={districtOptions}
                onChange={handleChange}
                error={errors.district}
                required
              />
              <SearchableSelectBox
                label="City"
                name="city"
                value={form.city}
                options={cityOptions}
                onChange={handleChange}
                error={errors.city}
                required
              />
              <SearchableSelectBox
                label="Village"
                name="village"
                value={form.village}
                options={[...villageOptions, "Other"]}
                onChange={handleChange}
                error={errors.village}
                required
              />
              {form.village === "Other" && (
                <InputBox
                  label="Enter Village Name"
                  name="otherVillage"
                  value={form.otherVillage || ""}
                  onChange={handleChange}
                  error={errors.otherVillage}
                  required
                />
              )}
              <InputBox
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                error={errors.address}
                required
              />
              <InputBox
                label="Pin Code"
                name="pincode"
                value={form.pincode}
                onChange={(e) => {
                  e.target.value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);
                  handleChange(e);
                }}
                error={errors.pincode}
                required
              />
              <MultiSelectBox
                label="Languages Known"
                name="languagesKnown"
                value={form.languagesKnown}
                options={INDIAN_LANGUAGES}
                onChange={handleChange}
                error={errors.languagesKnown}
              />
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
                          industry: "",
                          position: "",
                          company: "",
                          noticePeriod: "",
                          startDate: "",
                          endDate: "",
                          currentWages: "",
                          currentCity: "",
                          currentVillage: "",
                          currentVillageOther: "",
                        },
                      ]
                    : prev,
                );

                // Education is now required for both
                if (educationList.length === 0) {
                  setEducationList([
                    { degree: "", university: "", passingYear: "", grade: "" },
                  ]);
                }
              }}
              className={`
      w-full h-12 rounded-lg transition cursor-pointer
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
                if (educationList.length === 0) {
                  setEducationList([
                    { degree: "", university: "", passingYear: "", grade: "" },
                  ]);
                }

                // Clear experiences for fresher logic
                setExperiences([]);
                // Remove any experience-related validation errors
                setErrors((prev) => {
                  const copy = { ...prev };
                  Object.keys(copy).forEach((k) => {
                    if (
                      k.startsWith("position-") ||
                      k.startsWith("company-") ||
                      k.startsWith("noticePeriod-") ||
                      k.startsWith("startDate-") ||
                      k.startsWith("endDate-")
                    ) {
                      delete copy[k];
                    }
                  });
                  return copy;
                });
              }}
              className={`
      w-full h-12 rounded-lg transition cursor-pointer
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

          {/* Experience */}
          {workType === "experienced" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Work Experience
              </h3>

              {/* Summary moved to bottom */}

              {experiences.map((exp, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-5 bg-white/70 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SearchableSelectBox
                      label="Industry"
                      name={`industry-${index}`}
                      value={exp.industry}
                      options={INDUSTRY_OPTIONS}
                      onChange={handleChange}
                      error={errors[`industry-${index}`]}
                      required
                    />
                    {exp.industry === "Other" && (
                      <InputBox
                        label="Enter Your Industry"
                        name={`customIndustry-${index}`}
                        value={exp.customIndustry || ""}
                        onChange={handleChange}
                      />
                    )}
                    <InputBox
                      label="Position"
                      name={`position-${index}`}
                      value={exp.position}
                      onChange={handleChange}
                      error={errors[`position-${index}`]}
                      required
                    />
                    <InputBox
                      label="Company Name"
                      name={`company-${index}`}
                      value={exp.company}
                      onChange={handleChange}
                      error={errors[`company-${index}`]}
                      required
                    />
                    {index === 0 && (
                      <InputBox
                        label="Notice Period (Days)"
                        name={`noticePeriod-${index}`}
                        value={exp.noticePeriod}
                        onChange={handleChange}
                        error={errors[`noticePeriod-${index}`]}
                      />
                    )}

                    <SearchableSelectBox
                      label="City"
                      name={`currentCity-${index}`}
                      value={exp.currentCity || ""}
                      options={cityOptions}
                      onChange={handleChange}
                      error={errors[`currentCity-${index}`]}
                      required
                    />
                    <SearchableSelectBox
                      label=" Village"
                      name={`currentVillage-${index}`}
                      value={exp.currentVillage || ""}
                      options={[...villageOptions, "Other"]}
                      onChange={handleChange}
                      error={errors[`currentVillage-${index}`]}
                      required
                    />

                    {exp.currentVillage === "Other" && (
                      <div className="md:col-span-3">
                        <InputBox
                          label="Enter Village Name"
                          name={`currentVillageOther-${index}`}
                          value={exp.currentVillageOther || ""}
                          onChange={handleChange}
                          error={errors[`currentVillageOther-${index}`]}
                          required
                        />
                      </div>
                    )}

                    <DatePicker
                      label="Start Date"
                      name={`startDate-${index}`}
                      value={exp.startDate}
                      onChange={handleChange}
                      error={errors[`startDate-${index}`]}
                    />
                    <DatePicker
                      label="End Date"
                      name={`endDate-${index}`}
                      value={exp.endDate}
                      onChange={handleChange}
                      error={errors[`endDate-${index}`]}
                    />

                    {index === 0 && (
                      <>
                        <InputBox
                          label="Current Salary (₹)"
                          name={`currentWages-${index}`}
                          value={exp.currentWages || ""}
                          onChange={handleChange}
                          error={errors[`currentWages-${index}`]}
                          required
                        />
                        <InputBox
                          label="Expected Salary (₹)"
                          name="expectedSalary"
                          value={form.expectedSalary || ""}
                          onChange={handleChange}
                          error={errors.expectedSalary}
                          required
                        />
                        <InputBox
                          label="Experience (in Years)"
                          name="totalExperience"
                          value={form.totalExperience}
                          onChange={handleChange}
                          error={errors.totalExperience}
                          required
                        />
                      </>
                    )}
                  </div>

                  {index === experiences.length - 1 && (
                    <div className="space-y-4">
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
                            peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:-translate-y-1/2 peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:text-[#72B76A]
                            ${form.summary ? "top-1 -translate-y-1/2 text-sm text-[#72B76A]" : ""}
                            `}
                        >
                          Summary
                        </label>
                        {errors.summary && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.summary}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExperiences((p) => [
                              ...p,
                              {
                                industry: "",
                                position: "",
                                company: "",
                                noticePeriod: "",
                                startDate: "",
                                endDate: "",
                                currentWages: "",
                                currentCity: "",
                                currentVillage: "",
                                currentVillageOther: "",
                              },
                            ])
                          }
                          className="w-7 h-7 text-xl font-bold rounded-md text-[#72B76A] border border-[#72B76A] flex items-center justify-center transition-colors hover:bg-[#72B76A] hover:text-white"
                        >
                          +
                        </button>

                        <button
                          type="button"
                          disabled={experiences.length === 1}
                          onClick={() =>
                            setExperiences((p) =>
                              p.filter((_, i) => i !== p.length - 1),
                            )
                          }
                          className={`w-7 h-7 text-xl font-bold rounded-md border transition-colors ${
                            experiences.length === 1
                              ? "text-[#A6D8A3] border-[#A6D8A3] cursor-not-allowed"
                              : "text-[#72B76A] border-[#72B76A] hover:bg-[#72B76A] hover:text-white"
                          }`}
                        >
                          –
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Education Details -   */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Education Details
            </h3>

            {educationList.map((edu, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-5 bg-white/70 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Row 1 */}
                  <InputBox
                    label="Degree"
                    name={`degree-${index}`}
                    value={edu.degree}
                    onChange={handleChange}
                    error={errors[`degree-${index}`]}
                    required
                  />

                  <InputBox
                    label="Grade / Percentage"
                    name={`grade-${index}`}
                    value={edu.grade}
                    onChange={handleChange}
                    error={errors[`grade-${index}`]}
                  />

                  {/* Row 2 */}
                  <InputBox
                    label="University"
                    name={`university-${index}`}
                    value={edu.university}
                    onChange={handleChange}
                    error={errors[`university-${index}`]}
                    required
                  />

                  <InputBox
                    label="Passing Year"
                    name={`passingYear-${index}`}
                    value={edu.passingYear}
                    onChange={handleChange}
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
                          grade: "",
                          university: "",
                          passingYear: "",
                        },
                      ])
                    }
                    className="w-7 h-7 text-xl font-bold rounded-md text-[#72B76A] border border-[#72B76A] hover:bg-[#72B76A]  hover:text-white"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    disabled={educationList.length === 1}
                    onClick={() =>
                      setEducationList(
                        educationList.filter((_, i) => i !== index),
                      )
                    }
                    className={`w-7 h-7 text-xl font-bold rounded-md border transition-colors ${
                      educationList.length === 1
                        ? "text-[#A6D8A3] border-[#A6D8A3] cursor-not-allowed"
                        : "text-[#72B76A] border-[#72B76A] hover:bg-[#72B76A] hover:text-white"
                    }`}
                  >
                    –
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Certifications - Optional, Common for both */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Certifications (Optional)
            </h3>

            {certificationList.map((cert, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-5 bg-white/70 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputBox
                    label="Certificate Name"
                    name={`cert-name-${index}`}
                    value={cert.name}
                    onChange={handleChange}
                    error={errors[`cert-name-${index}`]}
                  />

                  <InputBox
                    label="Year"
                    name={`cert-year-${index}`}
                    value={cert.year}
                    onChange={handleChange}
                    error={errors[`cert-year-${index}`]}
                  />

                  <InputBox
                    label="Achievement/Position"
                    name={`cert-achievement-${index}`}
                    value={cert.achievement}
                    onChange={handleChange}
                    error={errors[`cert-achievement-${index}`]}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCertificationList((p) => [
                        ...p,
                        { name: "", year: "", achievement: "" },
                      ])
                    }
                    className="w-7 h-7 text-xl font-bold rounded-md text-[#72B76A] border border-[#72B76A] hover:bg-[#72B76A]  hover:text-white"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    disabled={certificationList.length === 1}
                    onClick={() =>
                      setCertificationList((p) =>
                        p.filter((_, i) => i !== index),
                      )
                    }
                    className={`w-7 h-7 text-xl font-bold rounded-md border transition-colors ${
                      certificationList.length === 1
                        ? "text-[#A6D8A3] border-[#A6D8A3] cursor-not-allowed"
                        : "text-[#72B76A] border-[#72B76A] hover:bg-[#72B76A] hover:text-white"
                    }`}
                  >
                    –
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Your Skills</h3>

            <div className="border border-gray-200 rounded-xl p-5 bg-white/70 space-y-4">
              {/* Inputs Row */}
              <div className="flex flex-wrap gap-4">
                {skillsList.map((skill, index) => (
                  <div key={index} className="w-70">
                    <InputBox
                      label="Skill Name"
                      name={`skill-name-${index}`}
                      value={skill.name}
                      onChange={handleChange}
                      error={errors[`skill-name-${index}`]}
                      required
                    />
                  </div>
                ))}
              </div>

              {/* Buttons Below */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSkillsList((prev) => [...prev, { name: "" }])
                  }
                  className="w-7 h-7 text-xl font-bold rounded-md text-[#72B76A] border border-[#72B76A] hover:bg-[#72B76A] hover:text-white"
                >
                  +
                </button>

                <button
                  type="button"
                  disabled={skillsList.length === 1}
                  onClick={() => setSkillsList((prev) => prev.slice(0, -1))}
                  className={`w-7 h-7 text-xl font-bold rounded-md border transition-colors ${
                    skillsList.length === 1
                      ? "text-[#A6D8A3] border-[#A6D8A3] cursor-not-allowed"
                      : "text-[#72B76A] border-[#72B76A] hover:bg-[#72B76A] hover:text-white"
                  }`}
                >
                  –
                </button>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Availability & Preferred Location
            </h3>

            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SearchableSelectBox
                label="Employment Type"
                name="availabilityCategory"
                value={form.availabilityCategory}
                options={["Full-Time", "Part-Time", "Contract", "Internship"]}
                onChange={handleChange}
                error={errors.availabilityCategory}
                required
              />

              <SearchableSelectBox
                label="Industry"
                name="availabilityIndustry"
                value={form.availabilityIndustry}
                options={INDUSTRY_OPTIONS}
                onChange={handleChange}
                error={errors.availabilityIndustry}
                required
              />

              {form.availabilityIndustry === "Other" && (
                <InputBox
                  label="Enter Your Industry"
                  name="availabilityCustomIndustry"
                  value={form.availabilityCustomIndustry || ""}
                  onChange={handleChange}
                />
              )}

              <SearchableSelectBox
                label="Job Category"
                name="availabilityJobCategory"
                value={form.availabilityJobCategory}
                options={jobCategoryOptions}
                onChange={handleChange}
                error={errors.availabilityJobCategory}
                required
              />
              {/* </div> */}

              {/* Row 2 */}
              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> */}
              <SearchableSelectBox
                label="State"
                name="availabilityState"
                value={form.availabilityState}
                options={availabilityStateOptions}
                onChange={handleChange}
                error={errors.availabilityState}
                required
              />

              <SearchableSelectBox
                label="District"
                name="availabilityDistrict"
                value={form.availabilityDistrict}
                options={availabilityDistrictOptions}
                onChange={handleChange}
                error={errors.availabilityDistrict}
                required
              />

              <MultiSelectBox
                label="City"
                name="availabilityCity"
                value={form.availabilityCity || []}
                options={availabilityCityOptions}
                onChange={handleChange}
                error={errors.availabilityCity}
                required
              />
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 gap-4">
              <InputBox
                label="Additional Info"
                name="additionalInfo"
                value={form.additionalInfo}
                onChange={handleChange}
                error={errors.additionalInfo}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/50 rounded-xl border border-gray-200">
            <input
              type="checkbox"
              id="declarationChecked"
              name="declarationChecked"
              checked={form.declarationChecked || false}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-300 text-[#72B76A] focus:ring-[#72B76A]"
            />
            <label
              htmlFor="declarationChecked"
              className="text-sm text-gray-700 cursor-pointer"
            >
              I hereby declare that all the information provided above is true.
            </label>
            {errors.declarationChecked && (
              <p className="text-red-500 text-xs mt-1">
                {errors.declarationChecked}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !form.declarationChecked}
            className={`submit-btn 
              w-full h-12 cursor-pointer ${
                loading || !form.declarationChecked
                  ? "bg-[#5e9b55] opacity-50 cursor-not-allowed"
                  : "bg-[#72B76A]"
              } text-white rounded-xl 
              font-semibold text-lg transition active:scale-95 flex items-center justify-center gap-2
            `}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResumePage;
