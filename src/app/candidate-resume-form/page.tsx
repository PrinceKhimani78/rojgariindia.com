"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Particles from "react-tsparticles";
import { FiMail } from "react-icons/fi";
// =========================
// TYPES
// =========================

// JSON shape: state → district → city → [villages]
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
  // =========================
  // HOOKS
  // =========================
  const [isClient, setIsClient] = useState(false);
  const [workType, setWorkType] = useState<WorkType>("experienced");
  const [indiaData, setIndiaData] = useState<IndiaJson | null>(null);
  // =========================
  // POPUP STATES
  // =========================

  const [showPopup, setShowPopup] = useState(true);
  const [popupStep, setPopupStep] = useState<"email" | "otp">("email");
  const [anim, setAnim] = useState("");
  const [emailVerificationLoading, setEmailVerificationLoading] =
    useState(false);
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
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
        if (!res.ok) {
          console.error(
            "Failed to load india_state_district_city_village.json"
          );
          return;
        }
        const json = (await res.json()) as IndiaJson;
        setIndiaData(json);
      } catch (err) {
        console.error("Error loading India JSON", err);
      }
    };

    loadIndiaData();
  }, []);

  // =========================
  // DERIVED DROPDOWN OPTIONS
  // =========================

  // Personal address
  const stateOptions = indiaData ? Object.keys(indiaData) : [];

  const districtOptions =
    indiaData && form.state && indiaData[form.state]
      ? Object.keys(indiaData[form.state])
      : [];

  const cityOptions =
    indiaData &&
    form.state &&
    form.district &&
    indiaData[form.state] &&
    indiaData[form.state][form.district]
      ? Object.keys(indiaData[form.state][form.district])
      : [];

  const villageOptions =
    indiaData &&
    form.state &&
    form.district &&
    form.city &&
    indiaData[form.state] &&
    indiaData[form.state][form.district] &&
    indiaData[form.state][form.district][form.city]
      ? indiaData[form.state][form.district][form.city]
      : [];

  // Availability address
  const availabilityStateOptions = stateOptions;

  const availabilityDistrictOptions =
    indiaData && form.availabilityState && indiaData[form.availabilityState]
      ? Object.keys(indiaData[form.availabilityState])
      : [];

  const availabilityCityOptions =
    indiaData &&
    form.availabilityState &&
    form.availabilityDistrict &&
    indiaData[form.availabilityState] &&
    indiaData[form.availabilityState][form.availabilityDistrict]
      ? Object.keys(
          indiaData[form.availabilityState][form.availabilityDistrict]
        )
      : [];

  const availabilityVillageOptions =
    indiaData &&
    form.availabilityState &&
    form.availabilityDistrict &&
    form.availabilityCity &&
    indiaData[form.availabilityState] &&
    indiaData[form.availabilityState][form.availabilityDistrict] &&
    indiaData[form.availabilityState][form.availabilityDistrict][
      form.availabilityCity
    ]
      ? indiaData[form.availabilityState][form.availabilityDistrict][
          form.availabilityCity
        ]
      : [];

  // =========================
  // HANDLERS
  // =========================
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Personal location cascading
    if (name === "state") {
      setForm((prev) => ({
        ...prev,
        state: value,
        district: "",
        city: "",
        village: "",
      }));
      return;
    }

    if (name === "district") {
      setForm((prev) => ({
        ...prev,
        district: value,
        city: "",
        village: "",
      }));
      return;
    }

    if (name === "city") {
      setForm((prev) => ({
        ...prev,
        city: value,
        village: "",
      }));
      return;
    }

    // Availability location cascading
    if (name === "availabilityState") {
      setForm((prev) => ({
        ...prev,
        availabilityState: value,
        availabilityDistrict: "",
        availabilityCity: "",
        availabilityVillage: "",
      }));
      return;
    }

    if (name === "availabilityDistrict") {
      setForm((prev) => ({
        ...prev,
        availabilityDistrict: value,
        availabilityCity: "",
        availabilityVillage: "",
      }));
      return;
    }

    if (name === "availabilityCity") {
      setForm((prev) => ({
        ...prev,
        availabilityCity: value,
        availabilityVillage: "",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to Cloudinary
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
  };

  const handleExperienceChange = (
    index: number,
    field: keyof ExperienceEntry,
    value: string
  ) => {
    const updated = experiences.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    );
    setExperiences(updated);
  };

  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        position: "",
        company: "",
        noticePeriod: "",
        startDate: "",
        endDate: "",
        stillWorkingDate: "",
      },
    ]);
  };

  const removeExperience = (index: number) => {
    if (experiences.length === 1) return;
    setExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log({
  //     form,
  //     experiences,
  //     educationList,
  //     skillsList,
  //     workType,
  //   });
  //   alert("Form submitted (check console for data)");
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        form,
        experiences,
        educationList,
        skillsList,
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert("Resume submitted successfully!");
    } else {
      alert("Something went wrong!");
    }
  };

  // =========================
  // REUSABLE INPUT COMPONENTS
  // =========================

  type InputBoxProps = {
    label: string;
    name: string;
    value: string;
    type?: string;
    onChange?: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
  };
  const InputBox = ({
    label,
    name,
    value,
    type = "text",
    onChange,
  }: InputBoxProps) => (
    <div className="w-full h-12 relative flex rounded-xl">
      <input
        required
        name={name}
        type={type}
        value={value}
        onChange={onChange || handleChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        className="peer w-full bg-white/10 text-gray-700 backdrop-blur-md px-4 rounded-xl border border-[#72B76A] outline-none"
      />

      <label
        className="
        absolute left-4 top-1/2 -translate-y-1/2 bg-white px-1 rounded 
        text-gray-500 text-sm pointer-events-none transition-all
        peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-[#72B76A]
        peer-valid:top-0 peer-valid:-translate-y-1/2 peer-valid:text-xs peer-valid:text-[#72B76A]
      "
      >
        {label}
      </label>
    </div>
  );

  type SelectBoxProps = {
    label: string;
    name: string;
    value: string;
    options: string[];
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  };

  const SelectBox = ({
    label,
    name,
    value,
    options,
    onChange,
  }: SelectBoxProps) => (
    <div className="w-full h-12 relative flex rounded-xl">
      <select
        name={name}
        value={value}
        onChange={onChange || handleChange}
        className="peer w-full bg-white/10 text-gray-700 backdrop-blur-md px-4 rounded-xl border border-[#72B76A] outline-none appearance-none"
      >
        <option value="" className="text-black"></option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-black">
            {opt}
          </option>
        ))}
      </select>

      <label
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-1 rounded text-gray-700 text-sm
        peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-[#72B76A]
        peer-valid:top-0 peer-valid:-translate-y-1/2 peer-valid:text-xs peer-valid:text-[#72B76A]
        transition-all"
      >
        {label}
      </label>

      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none">
        ▼
      </span>
    </div>
  );

  // =========================
  // SECTION COMPONENTS
  // =========================

  const PersonalInfoSection = () => (
    <>
      <h3 className="text-lg font-semibold text-gray-800">PERSONAL INFO</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {/* Row 1 */}
        <InputBox label="First Name" name="firstName" value={form.firstName} />
        <InputBox label="Surname" name="surName" value={form.surName} />

        {/* Photo */}
        <label
          className="
            w-full bg-white/10
            border border-[#72B76A] rounded-xl 
            flex items-center justify-center 
            cursor-pointer text-gray-600 
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
            <span className="text-xs opacity-80">Upload Photo</span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="hidden"
          />
        </label>

        {/* Row 2 */}
        <InputBox label="Email" name="email" value={form.email} />
        <InputBox label="Mobile Number" name="phone" value={form.phone} />

        {/* Row 3 */}
        <SelectBox
          label="State"
          name="state"
          value={form.state}
          options={stateOptions}
        />
        <SelectBox
          label="District"
          name="district"
          value={form.district}
          options={districtOptions}
        />

        {/* Row 4 */}
        <SelectBox
          label="City"
          name="city"
          value={form.city}
          options={cityOptions}
        />
        <SelectBox
          label="Village (Dropdown)"
          name="village"
          value={form.village}
          options={villageOptions}
        />
        <InputBox label="Address" name="address" value={form.address} />

        {/* Row 5 — Summary */}
        <div className="lg:col-span-3 md:col-span-2 col-span-1 h-28 relative">
          <textarea
            name="summary"
            value={form.summary}
            onChange={handleChange}
            className="
              peer w-full h-full bg-white/10 text-gray-700 
              backdrop-blur-md px-4 pt-6 pb-2 rounded-xl 
              border border-[#72B76A] outline-none resize-none
            "
          />
          <label
            className="
              absolute left-4 top-1/6 -translate-y-1/2 bg-white px-1 rounded 
              text-gray-600 text-sm pointer-events-none transition-all
              peer-focus:top-1 peer-focus:-translate-y-0 peer-focus:text-xs 
              peer-focus:text-[#72B76A]
              peer-valid:top-1 peer-valid:-translate-y-0 peer-valid:text-xs 
              peer-valid:text-[#72B76A]
            "
          >
            Summary
          </label>
        </div>
      </div>
    </>
  );

  const WorkTypeToggle = () => (
    <div className="grid grid-cols-2 gap-4 w-full">
      <button
        type="button"
        onClick={() => setWorkType("experienced")}
        className={`
          relative w-full h-12 overflow-hidden group rounded-lg 
          transition-all ease-out duration-700 active:scale-95
          ${
            workType === "experienced"
              ? "bg-[#72B76A] text-white border border-[#72B76A]"
              : "bg-transparent text-[#72B76A] border border-[#72B76A] hover:bg-[#72B76A] hover:text-white"
          }
        `}
      >
        <span className="absolute right-0 w-12 h-full top-0 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 -skew-x-12 group-hover:-translate-x-28 ease" />
        <span className="relative text-sm font-semibold">Experienced</span>
      </button>

      <button
        type="button"
        onClick={() => setWorkType("fresher")}
        className={`
          relative w-full h-12 overflow-hidden group rounded-lg 
          transition-all ease-out duration-700 active:scale-95
          ${
            workType === "fresher"
              ? "bg-[#72B76A] text-white border border-[#72B76A]"
              : "bg-transparent text-[#72B76A] border border-[#72B76A] hover:bg-[#72B76A] hover:text-white"
          }
        `}
      >
        <span className="absolute right-0 w-12 h-full top-0 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 -skew-x-12 group-hover:-translate-x-28 ease" />
        <span className="relative text-sm font-semibold">Fresher</span>
      </button>
    </div>
  );

  const ExperienceSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Work Experience</h3>
      </div>

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
              onChange={(e) =>
                handleExperienceChange(index, "position", e.target.value)
              }
            />
            <InputBox
              label="Company"
              name={`company-${index}`}
              value={exp.company}
              onChange={(e) =>
                handleExperienceChange(index, "company", e.target.value)
              }
            />
            <InputBox
              label="Notice Period"
              name={`noticePeriod-${index}`}
              value={exp.noticePeriod}
              onChange={(e) =>
                handleExperienceChange(index, "noticePeriod", e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputBox
              label="Start Date"
              name={`startDate-${index}`}
              value={exp.startDate}
              type="date"
              onChange={(e) =>
                handleExperienceChange(index, "startDate", e.target.value)
              }
            />

            <InputBox
              label="End Date"
              name={`endDate-${index}`}
              value={exp.endDate}
              type="date"
              onChange={(e) =>
                handleExperienceChange(index, "endDate", e.target.value)
              }
            />

            <InputBox
              label="Still Working From"
              name={`stillWorkingDate-${index}`}
              value={exp.stillWorkingDate}
              type="date"
              onChange={(e) =>
                handleExperienceChange(
                  index,
                  "stillWorkingDate",
                  e.target.value
                )
              }
            />
          </div>

          <div className="flex gap-2 justify-start">
            <button
              type="button"
              onClick={addExperience}
              className="w-7 h-7 flex items-center justify-center text-xl font-bold rounded-md bg-[#72B76A] text-white"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => removeExperience(index)}
              disabled={experiences.length === 1}
              className={`w-7 h-7 flex items-center justify-center text-xl font-bold rounded-md ${
                experiences.length === 1
                  ? "bg-[#A6D8A3] text-white cursor-not-allowed"
                  : "bg-[#72B76A] text-white"
              }`}
            >
              –
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const EducationSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Education Details</h3>

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
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setEducationList([
                  ...educationList,
                  { degree: "", university: "", passingYear: "" },
                ])
              }
              className="w-7 h-7 flex items-center justify-center bg-[#72B76A] text-white text-xl font-bold rounded-md"
            >
              +
            </button>

            <button
              type="button"
              disabled={educationList.length === 1}
              onClick={() =>
                setEducationList(educationList.filter((_, i) => i !== index))
              }
              className={`w-7 h-7 flex items-center justify-center text-xl font-bold rounded-md ${
                educationList.length === 1
                  ? "bg-[#A6D8A3] text-white cursor-not-allowed"
                  : "bg-[#72B76A] text-white"
              }`}
            >
              –
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const SkillsSection = () => (
    <div className="space-y-4 col-span-3">
      <h3 className="text-lg font-semibold text-gray-800">Skills</h3>

      {skillsList.map((skill, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-xl p-5 bg-white/70 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputBox
              label="Skill Name"
              name={`skillName-${index}`}
              value={skill.name}
              onChange={(e) => {
                const updated = [...skillsList];
                updated[index].name = e.target.value;
                setSkillsList(updated);
              }}
            />

            <SelectBox
              label="Level"
              name={`skillLevel-${index}`}
              value={skill.level}
              options={["Beginner", "Intermediate", "Expert"]}
              onChange={(e) => {
                const updated = [...skillsList];
                updated[index].level = e.target.value;
                setSkillsList(updated);
              }}
            />

            <InputBox
              label="Years of Experience"
              name={`skillYears-${index}`}
              type="number"
              value={skill.years}
              onChange={(e) => {
                const updated = [...skillsList];
                updated[index].years = e.target.value;
                setSkillsList(updated);
              }}
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
              className="w-7 h-7 flex items-center justify-center bg-[#72B76A] text-white text-xl font-bold rounded-md"
            >
              +
            </button>

            <button
              type="button"
              disabled={skillsList.length === 1}
              onClick={() =>
                setSkillsList(skillsList.filter((_, i) => i !== index))
              }
              className={`w-7 h-7 flex items-center justify-center text-xl font-bold rounded-md ${
                skillsList.length === 1
                  ? "bg-[#A6D8A3] text-white cursor-not-allowed"
                  : "bg-[#72B76A] text-white"
              }`}
            >
              –
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const AvailabilitySection = () => (
    <div className="col-span-3 space-y-4 mt-6">
      <h3 className="text-lg font-semibold text-gray-800">Availability</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectBox
          label="Category"
          name="availabilityCategory"
          value={form.availabilityCategory || ""}
          options={["Part-Time", "Full-Time", "Contract", "Internship"]}
        />

        <SelectBox
          label="State"
          name="availabilityState"
          value={form.availabilityState || ""}
          options={availabilityStateOptions}
        />

        <SelectBox
          label="District"
          name="availabilityDistrict"
          value={form.availabilityDistrict || ""}
          options={availabilityDistrictOptions}
        />

        <SelectBox
          label="City"
          name="availabilityCity"
          value={form.availabilityCity || ""}
          options={availabilityCityOptions}
        />

        <SelectBox
          label="Village (Dropdown)"
          name="availabilityVillage"
          value={form.availabilityVillage || ""}
          options={availabilityVillageOptions}
        />
        <InputBox
          label="Additional Info"
          name="additionalInfo"
          value={form.additionalInfo || ""}
        />

        <InputBox
          label="Joining Date (dd/mm/yyyy)"
          name="joiningDate"
          value={form.joiningDate || ""}
          type="date"
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
        />
      </div>
    </div>
  );

  // =========================
  // RENDER
  // =========================

  // Avoid hydration mismatch completely
  if (!isClient) {
    return null;
  }
  // =========================
  // POPUP COMPONENT
  // =========================

  const Popup = ({ open, onClose, children }: any) => {
    if (!open) return null;

    return (
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="
          bg-white rounded-2xl shadow-lg 
          p-10 w-full max-w-md relative 
          animate-popup-slide
        "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 text-2xl hover:text-black"
          >
            ×
          </button>

          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full flex justify-center px-4 py-10 overflow-x-hidden">
      {/* EMAIL POPUP */}
      <Popup open={showPopup} onClose={() => setShowPopup(false)}>
        <div>
          {/* LOGO */}
          <div className="flex justify-center mb-6">
            <Image src="/images/logo.svg" alt="logo" width={180} height={150} />
          </div>

          {/* EMAIL STEP */}
          {popupStep === "email" && (
            <div className={anim}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-700 text-sm font-medium">
                  Email Address
                </span>
                <FiMail size={18} className="text-[#72B76A]" />
              </div>

              <input
                type="email"
                placeholder="Enter your email"
                className="
            w-full border px-4 py-2 text-sm rounded-lg mb-6
            focus:border-[#72B76A] outline-none
          "
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />

              <div className="flex justify-center">
                <button
                  onClick={async () => {
                    if (!form.email) return alert("Enter email first.");

                    setEmailVerificationLoading(true);

                    await fetch("/api/send-otp", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: form.email }),
                    });

                    setEmailVerificationLoading(false);

                    // animate email → otp
                    setAnim("slide-out-left");

                    setTimeout(() => {
                      setPopupStep("otp");
                      setAnim("slide-in-right");
                    }, 350);
                  }}
                  className="
              relative h-12 px-12 flex items-center justify-center
              overflow-hidden rounded-lg
              bg-[#72B76A] text-white border border-[#72B76A]
              transition-all ease-out duration-700 active:scale-95
              font-semibold group
            "
                >
                  <span
                    className="
                absolute right-0 w-12 h-full top-0
                transition-all duration-1000 transform translate-x-12
                bg-white opacity-10 -skew-x-12
                group-hover:-translate-x-28 ease
              "
                  />
                  <span className="relative">
                    {emailVerificationLoading ? "Sending..." : "Next"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* OTP STEP */}
          {popupStep === "otp" && (
            <div className={anim}>
              <span className="text-gray-700 text-sm font-medium mb-2 block">
                Enter OTP
              </span>

              <input
                type="text"
                placeholder="Enter OTP"
                className="
            w-full border px-4 py-2 text-sm rounded-lg mb-6
            focus:border-[#72B76A] outline-none
          "
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <div className="flex justify-center">
                <button
                  onClick={async () => {
                    const res = await fetch("/api/verify-otp", {
                      method: "POST",
                      body: JSON.stringify({ email: form.email, otp }),
                    });

                    const data = await res.json();
                    if (!data.success) return alert("Incorrect OTP!");

                    setIsVerified(true);

                    setTimeout(() => {
                      setShowPopup(false);
                    }, 2000);
                  }}
                  className="
              relative h-12 px-12 flex items-center justify-center
              overflow-hidden rounded-lg
              bg-[#72B76A] text-white border border-[#72B76A]
              transition-all ease-out duration-700 active:scale-95
              font-semibold group
            "
                >
                  <span
                    className="
                absolute right-0 w-12 h-full top-0
                transition-all duration-1000 transform translate-x-12
                bg-white opacity-10 -skew-x-12
                group-hover:-translate-x-28 ease
              "
                  />
                  <span className="relative">Verify</span>
                </button>
              </div>

              {isVerified && (
                <p className="text-green-600 text-center mt-4">
                  Verified! Closing…
                </p>
              )}
            </div>
          )}
        </div>
      </Popup>

      {/* Background Video */}
      <div className="absolute inset-0 -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Particles */}
      <Particles className="absolute inset-0 -z-10" />

      {/* FORM CONTAINER */}
      <div className="w-full max-w-5xl p-2 overflow-x-hidden">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/images/logo.svg" alt="logo" width={200} height={70} />
        </div>

        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Create Your Rojgari Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-10 text-gray-700">
          <PersonalInfoSection />
          <WorkTypeToggle />
          {workType === "experienced" && <ExperienceSection />}
          {workType === "fresher" && <EducationSection />}
          <SkillsSection />
          <AvailabilitySection />

          <button
            type="submit"
            className="w-full relative h-12 overflow-hidden group bg-[#72B76A] text-white border border-[#72B76A] rounded-xl transition-all duration-700 active:scale-95"
          >
            <span className="absolute right-0 w-12 h-full top-0 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 -skew-x-12 group-hover:-translate-x-28 ease" />
            <span className="relative text-lg font-semibold">Submit</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResumePage;
