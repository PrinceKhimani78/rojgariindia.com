"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Particles from "react-tsparticles";
import { FiMail } from "react-icons/fi";
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

  const [form, setForm] = useState({
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
    photoUrl: "",
  });

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

    await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });

    setEmailVerificationLoading(false);
    setPopupStep("otp");
  };

  const handleChange = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLTextAreaElement>
        | React.ChangeEvent<HTMLSelectElement>
    ) => {
      const { name, value } = e.target;

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
          validateField(name, value);
          return;
        }

        // EDUCATION FIELDS
        if (educationSchema.shape[fieldName]) {
          setEducationList((prev) =>
            prev.map((item, i) =>
              i === index ? { ...item, [fieldName]: value } : item
            )
          );
          validateField(name, value);
          return;
        }

        // SKILL FIELDS
        if (skillSchema.shape[fieldName]) {
          setSkillsList((prev) =>
            prev.map((item, i) =>
              i === index ? { ...item, [fieldName]: value } : item
            )
          );
          validateField(name, value);
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
        validateField("state", value);
        return;
      }

      if (name === "district") {
        setForm((f) => ({
          ...f,
          district: value,
          city: "",
          village: "",
        }));
        validateField("district", value);
        return;
      }

      if (name === "city") {
        setForm((f) => ({
          ...f,
          city: value,
          village: "",
        }));
        validateField("city", value);
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
        validateField("availabilityState", value);
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
        validateField("availabilityDistrict", value);
        return;
      }

      if (name === "availabilityCity") {
        setForm((f) => ({
          ...f,
          availabilityCity: value,
          availabilityVillage:
            value === f.availabilityCity ? f.availabilityVillage : "",
        }));
        validateField("availabilityCity", value);
        return;
      }

      if (name === "phone") {
        const formatted = normalizeIndianPhone(value);

        setForm((prev) => ({
          ...prev,
          phone: formatted,
        }));

        validateField("phone", formatted);
        return;
      }

      // ------------------------------
      // DEFAULT NORMAL FIELD UPDATE
      // ------------------------------
      setForm((prev) => ({ ...prev, [name]: value }));

      // ------------------------------
      // REAL-TIME VALIDATION
      // ------------------------------
      validateField(name, value);
    },
    []
  );

  const handleOtpVerify = async () => {
    const res = await fetch("/api/verify-otp", {
      method: "POST",
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

      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("photo", file);

      const upload = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      });

      const data = await upload.json();
      if (data.success) {
        setForm((prev) => ({ ...prev, photoUrl: data.url }));
      }
    },
    []
  );
  const validateField = (name: string, value: any) => {
    try {
      // ARRAY FIELDS LIKE: fieldName-0
      if (name.includes("-")) {
        const [field, indexStr] = name.split("-");
        const index = Number(indexStr);

        let fieldSchema =
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

      // NORMAL FIELDS
      const schemaField = resumeSchema.shape[name];
      if (!schemaField) return;

      z.object({ [name]: schemaField }).parse({ [name]: value });

      setErrors((e) => {
        const copy = { ...e };
        delete copy[name];
        return copy;
      });
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message || "Invalid value";

      setErrors((e) => ({
        ...e,
        [name]: msg,
      }));
    }
  };

  const validateForm = (payload: any) => {
    const parsed = resumeSchema.safeParse(payload);

    // DEBUG LOG: shows EXACT failing fields
    if (!parsed.success) {
      console.log(
        "ZOD ERROR:",
        parsed.error.issues.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }))
      );
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

    const payload = {
      ...form,
      phone: normalizeIndianPhone(form.phone),
      workType,
      experiences,
      educationList,
      skillsList,
    };

    const isValid = validateForm(payload);
    if (!isValid) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    console.log("FINAL SUBMIT PAYLOAD:", payload);

    let data; // <-- Declare ONLY ONCE

    const res = await fetch("/api/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    try {
      data = await res.json();
    } catch {
      setDuplicateError("Server error. Please try again.");
      return;
    }

    // Handle duplicate name error
    if (!res.ok) {
      setDuplicateError(data.message || "Something went wrong");
      return;
    }

    // Clear error on success
    setDuplicateError("");
    alert("Submitted successfully!");
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
    <div className="relative min-h-screen w-full flex justify-center px-4 py-10 overflow-x-hidden">
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

      <div className="w-full max-w-5xl p-2 overflow-x-hidden">
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
        <form onSubmit={handleSubmit} className="space-y-10 text-gray-400">
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
              />
              <InputBox
                label="Surname"
                name="surName"
                value={form.surName}
                onChange={handleChange}
                error={errors.surName}
              />

              <label
                className="
                  w-full h-[45px] sm:h-auto bg-white/10
                  border border-gray-300 rounded-xl 
                  flex items-center justify-center cursor-pointer text-gray-400 
                  overflow-hidden row-span-1 md:row-span-3
                "
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
              />
              <InputBox
                label="Mobile Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
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

              <div className="lg:col-span-3 h-28 relative">
                <textarea
                  name="summary"
                  value={form.summary}
                  onChange={handleChange}
                  placeholder=" "
                  className={`
      peer w-full h-full bg-white outline-none px-4 pt-6 pb-2 rounded-xl 
      text-base border resize-none
       focus:border-[#72B76A] focus:ring-1 focus:ring-[#72B76A]
      ${errors.summary ? "border-red-500" : "border-gray-300"}
    `}
                ></textarea>

                <label
                  htmlFor="summary"
                  className="
      absolute left-4 bg-white px-2 text-gray-400
      transition-all duration-150 pointer-events-none
      top-1/2 -translate-y-1/2
      peer-focus:top-1 peer-focus:-translate-y-1/2 peer-focus:text-sm peer-focus:text-[#72B76A]
      peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base
      peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:-translate-y-1/2 peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:text-gray-400
    "
                >
                  Summary
                </label>
                {errors.summary && (
                  <p className="text-red-500 text-xs mt-1">{errors.summary}</p>
                )}
              </div>
            </div>
            {/* INLINE DUPLICATE ERROR SHOWING HERE */}
            {duplicateError && (
              <p className="text-red-500 text-sm mt-1">{duplicateError}</p>
            )}
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
                    />
                    <InputBox
                      label="Company"
                      name={`company-${index}`}
                      value={exp.company}
                      onChange={(e) =>
                        setExperiences((p) =>
                          p.map((v, i) =>
                            i === index ? { ...v, company: e.target.value } : v
                          )
                        )
                      }
                      error={errors[`company-${index}`]}
                    />
                    <InputBox
                      label="Notice Period"
                      name={`noticePeriod-${index}`}
                      value={exp.noticePeriod}
                      onChange={(e) =>
                        setExperiences((p) =>
                          p.map((v, i) =>
                            i === index
                              ? { ...v, noticePeriod: e.target.value }
                              : v
                          )
                        )
                      }
                      error={errors[`noticePeriod-${index}`]}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DatePicker
                      label="Start Date"
                      name={`startDate-${index}`}
                      value={exp.startDate}
                      onChange={(e) =>
                        setExperiences((p) =>
                          p.map((v, i) =>
                            i === index
                              ? { ...v, startDate: e.target.value }
                              : v
                          )
                        )
                      }
                      error={errors[`startDate-${index}`]}
                    />

                    <DatePicker
                      label="End Date"
                      name={`endDate-${index}`}
                      value={exp.endDate}
                      onChange={(e) =>
                        setExperiences((prev) =>
                          prev.map((v, i) =>
                            i === index ? { ...v, endDate: e.target.value } : v
                          )
                        )
                      }
                      error={errors[`endDate-${index}`]}
                    />

                    <DatePicker
                      label="Still Working From"
                      name={`stillWorkingDate-${index}`}
                      value={exp.stillWorkingDate}
                      onChange={(e) =>
                        setExperiences((prev) =>
                          prev.map((v, i) =>
                            i === index
                              ? { ...v, stillWorkingDate: e.target.value }
                              : v
                          )
                        )
                      }
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
                      const updated = [...skillsList];
                      updated[index].name = e.target.value;
                      setSkillsList(updated);
                    }}
                    error={errors[`name-${index}`]}
                  />

                  <SelectBox
                    label="Level"
                    name={`level-${index}`}
                    value={skill.level}
                    options={["Beginner", "Intermediate", "Expert"]}
                    onChange={(e) => {
                      const updated = [...skillsList];
                      updated[index].level = e.target.value;
                      setSkillsList(updated);
                    }}
                    error={errors[`level-${index}`]}
                  />

                  <InputBox
                    label="Years of Experience"
                    name={`years-${index}`}
                    value={skill.years}
                    onChange={(e) => {
                      const updated = [...skillsList];
                      updated[index].years = e.target.value;
                      setSkillsList(updated);
                    }}
                    error={errors[`years-${index}`]}
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
