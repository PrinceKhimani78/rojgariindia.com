export type SelectOption = {
    label: string;
    value: string;
};

export const INDUSTRY_OPTIONS: SelectOption[] = [
    // PRIMARY SECTOR
    { label: "Agriculture & Farming", value: "Agriculture & Farming" },
    { label: "Animal & Livestock", value: "Animal & Livestock" },
    { label: "Forestry & Logging", value: "Forestry & Logging" },
    { label: "Mining & Extraction", value: "Mining & Extraction" },

    // MANUFACTURING
    { label: "Automobile & Auto Components", value: "Automobile & Auto Components" },
    { label: "Aerospace & Aviation", value: "Aerospace & Aviation" },
    { label: "Shipbuilding", value: "Shipbuilding" },
    { label: "Railways & Locomotives", value: "Railways & Locomotives" },
    { label: "Industrial Machinery & Tools", value: "Industrial Machinery & Tools" },
    { label: "Heavy Engineering", value: "Heavy Engineering" },
    { label: "Chemical & Petrochemical", value: "Chemical & Petrochemical" },
    { label: "Pharmaceuticals", value: "Pharmaceuticals" },
    { label: "Medical Devices & Equipment", value: "Medical Devices & Equipment" },
    { label: "Biotechnology", value: "Biotechnology" },
    { label: "Ayurvedic / Herbal Manufacturing", value: "Ayurvedic / Herbal Manufacturing" },
    { label: "Food & Beverage Manufacturing", value: "Food & Beverage Manufacturing" },
    { label: "Dairy Products", value: "Dairy Products" },
    { label: "Packaged Food", value: "Packaged Food" },
    { label: "Edible Oils", value: "Edible Oils" },
    { label: "Textiles & Apparel", value: "Textiles & Apparel" },
    { label: "Leather & Footwear", value: "Leather & Footwear" },
    { label: "Electronics & Electricals", value: "Electronics & Electricals" },
    { label: "Semiconductors", value: "Semiconductors" },
    { label: "Cables & Wires", value: "Cables & Wires" },
    { label: "Steel & Metals", value: "Steel & Metals" },
    { label: "Foundry & Casting", value: "Foundry & Casting" },
    { label: "Plastics, Rubber & Polymers", value: "Plastics, Rubber & Polymers" },
    { label: "Glass & Ceramics", value: "Glass & Ceramics" },
    { label: "Construction Materials", value: "Construction Materials" },
    { label: "Packaging & Printing", value: "Packaging & Printing" },
    { label: "Furniture & Woodwork", value: "Furniture & Woodwork" },
    { label: "Paints & Coatings", value: "Paints & Coatings" },

    // CONSTRUCTION & REAL ESTATE
    { label: "Real Estate & Infrastructure", value: "Real Estate & Infrastructure" },
    { label: "Roads & Highways", value: "Roads & Highways" },
    { label: "Architecture & Interior Design", value: "Architecture & Interior Design" },
    { label: "Smart City & Urban Development", value: "Smart City & Urban Development" },

    // IT & TECHNOLOGY
    { label: "Information Technology (IT)", value: "Information Technology (IT)" },
    { label: "Software Development", value: "Software Development" },
    { label: "Cloud Computing", value: "Cloud Computing" },
    { label: "Cybersecurity", value: "Cybersecurity" },
    { label: "Data Analytics & AI", value: "Data Analytics & AI" },
    { label: "Web & App Development", value: "Web & App Development" },
    { label: "BPO / KPO / Call Center", value: "BPO / KPO / Call Center" },
    { label: "Telecom & Internet", value: "Telecom & Internet" },

    // BANKING & FINANCE
    { label: "Banking", value: "Banking" },
    { label: "NBFC & Microfinance", value: "NBFC & Microfinance" },
    { label: "Insurance (Life / General / Health)", value: "Insurance (Life / General / Health)" },
    { label: "Investment & Wealth Management", value: "Investment & Wealth Management" },
    { label: "Fintech & Payment Solutions", value: "Fintech & Payment Solutions" },
    { label: "Stockbroking & Mutual Funds", value: "Stockbroking & Mutual Funds" },

    // RETAIL & FMCG
    { label: "FMCG", value: "FMCG" },
    { label: "Retail", value: "Retail" },
    { label: "E-commerce", value: "E-commerce" },
    { label: "Consumer Durables", value: "Consumer Durables" },
    { label: "Fashion Retail", value: "Fashion Retail" },
    { label: "Beauty & Personal Care", value: "Beauty & Personal Care" },
    { label: "Jewellery", value: "Jewellery" },

    // LOGISTICS
    { label: "Logistics & Supply Chain", value: "Logistics & Supply Chain" },
    { label: "Transport & Fleet", value: "Transport & Fleet" },
    { label: "Warehousing & Distribution", value: "Warehousing & Distribution" },
    { label: "Freight & Cargo", value: "Freight & Cargo" },
    { label: "Import–Export", value: "Import–Export" },
    { label: "Cold Chain Logistics", value: "Cold Chain Logistics" },

    // HOSPITALITY
    { label: "Hotels & Resorts", value: "Hotels & Resorts" },
    { label: "Restaurants & QSR", value: "Restaurants & QSR" },
    { label: "Travel & Tourism", value: "Travel & Tourism" },
    { label: "Airlines & Cruises", value: "Airlines & Cruises" },
    { label: "Facility & Event Management", value: "Facility & Event Management" },

    // HEALTHCARE
    { label: "Hospitals & Clinics", value: "Hospitals & Clinics" },
    { label: "Diagnostics & Pathology", value: "Diagnostics & Pathology" },
    { label: "Wellness, Spa & Fitness", value: "Wellness, Spa & Fitness" },
    { label: "Mental Health", value: "Mental Health" },

    // EDUCATION
    { label: "Schools & Colleges", value: "Schools & Colleges" },
    { label: "EdTech", value: "EdTech" },
    { label: "Coaching & Skill Development", value: "Coaching & Skill Development" },

    // MEDIA & CREATIVE
    { label: "Advertising & Digital Marketing", value: "Advertising & Digital Marketing" },
    { label: "Media & Broadcasting", value: "Media & Broadcasting" },
    { label: "Film, OTT & Production", value: "Film, OTT & Production" },
    { label: "Animation & Graphic Design", value: "Animation & Graphic Design" },
    { label: "Gaming & Esports", value: "Gaming & Esports" },

    // PROFESSIONAL SERVICES
    { label: "Legal Services", value: "Legal Services" },
    { label: "CA & Accounting", value: "CA & Accounting" },
    { label: "Business Consulting", value: "Business Consulting" },
    { label: "HR & Recruitment", value: "HR & Recruitment" },
    { label: "Market Research", value: "Market Research" },

    // ENERGY
    { label: "Oil & Gas", value: "Oil & Gas" },
    { label: "Power & Electricity", value: "Power & Electricity" },
    { label: "Renewable Energy (Solar, Wind, Hydro)", value: "Renewable Energy (Solar, Wind, Hydro)" },

    // EMERGING
    { label: "Electric Vehicles (EV)", value: "Electric Vehicles (EV)" },
    { label: "IoT & Smart Devices", value: "IoT & Smart Devices" },
    { label: "Blockchain & Crypto", value: "Blockchain & Crypto" },
    { label: "R&D & Scientific Research", value: "R&D & Scientific Research" },
    { label: "Robotics & Automation", value: "Robotics & Automation" },
    { label: "Green Technology & Waste Management", value: "Green Technology & Waste Management" },

    // GOVERNMENT & OTHERS
    { label: "Government & Public Sector", value: "Government & Public Sector" },
    { label: "Security Services", value: "Security Services" },
    { label: "NGO & Social Sector", value: "NGO & Social Sector" },
    { label: "Freelancer / Self-Employed", value: "Freelancer / Self-Employed" },
    { label: "Other", value: "Other" },
];

export const INDUSTRY_JOB_MAP: Record<string, string[]> = {
    "Agriculture & Farming": ["Farm Manager", "Agronomist", "Field Supervisor", "Agricultural Technician", "Soil Scientist", "Irrigation Engineer"],
    "Animal & Livestock": ["Dairy Farm Manager", "Poultry Supervisor", "Veterinary Assistant", "Animal Feed Technician", "Fisheries Officer"],
    "Forestry & Logging": ["Forest Officer", "Timber Inspector", "Environmental Scientist"],
    "Mining & Extraction": ["Mining Engineer", "Geologist", "Safety Officer", "Drill Operator", "Mine Supervisor"],

    "Automobile & Auto Components": ["Production Engineer", "Quality Control Inspector", "Automotive Technician", "Dealer Sales Executive", "Service Advisor", "CNC Operator"],
    "Aerospace & Aviation": ["Aerospace Engineer", "Pilot", "Aircraft Technician", "Quality Inspector", "Logistics Coordinator"],
    "Shipbuilding": ["Marine Engineer", "Naval Architect", "Welder", "Production Supervisor"],
    "Railways & Locomotives": ["Locomotive Technician", "Track Engineer", "Station Manager", "Signal Technician"],
    "Industrial Machinery & Tools": ["Mechanical Engineer", "CNC Operator", "Maintenance Technician", "Design Engineer", "Production Supervisor"],
    "Heavy Engineering": ["Project Engineer", "Site Engineer", "Welder", "Fabrication Supervisor", "QA Engineer"],
    "Chemical & Petrochemical": ["Chemical Engineer", "Process Engineer", "Safety Officer", "Lab Chemist", "Production Supervisor", "EHS Manager"],
    "Pharmaceuticals": ["Medical Representative", "Regulatory Affairs Executive", "QA/QC Analyst", "Production Chemist", "R&D Scientist", "Sales Manager"],
    "Medical Devices & Equipment": ["Biomedical Engineer", "Service Engineer", "Sales Executive", "Quality Inspector", "R&D Engineer"],
    "Biotechnology": ["Biotechnologist", "Research Scientist", "Lab Analyst", "Regulatory Executive", "Production Executive"],
    "Ayurvedic / Herbal Manufacturing": ["Production Executive", "QA Analyst", "Regulatory Officer", "Sales Executive"],
    "Food & Beverage Manufacturing": ["Food Technologist", "Quality Controller", "Production Supervisor", "Plant Manager", "Packaging Engineer"],
    "Dairy Products": ["Dairy Technologist", "Quality Inspector", "Plant Operator", "Sales Executive"],
    "Packaged Food": ["Production Manager", "Food Safety Officer", "Sales Representative", "Quality Analyst"],
    "Edible Oils": ["Production Technician", "Chemical Analyst", "Quality Manager", "Sales Executive"],
    "Textiles & Apparel": ["Textile Engineer", "Garment Designer", "Merchandiser", "Quality Inspector", "Production Manager", "Cutting Master"],
    "Leather & Footwear": ["Leather Technician", "Product Designer", "Quality Inspector", "Production Supervisor"],
    "Electronics & Electricals": ["Electronics Engineer", "Hardware Engineer", "Production Supervisor", "Quality Inspector", "Service Engineer"],
    "Semiconductors": ["Process Engineer", "Design Engineer", "Quality Analyst", "R&D Engineer"],
    "Cables & Wires": ["Production Engineer", "Quality Inspector", "Sales Executive", "Plant Operator"],
    "Steel & Metals": ["Metallurgist", "Production Engineer", "Quality Inspector", "Safety Officer", "Plant Manager"],
    "Foundry & Casting": ["Foundry Engineer", "Production Incharge", "Quality Inspector", "Maintenance Technician"],
    "Plastics, Rubber & Polymers": ["Polymer Technologist", "Production Supervisor", "Quality Inspector", "Mould Operator"],
    "Glass & Ceramics": ["Production Engineer", "Quality Inspector", "Design Engineer", "Plant Manager"],
    "Construction Materials": ["Sales Executive", "Technical Executive", "Logistics Coordinator", "Plant Manager", "Quality Inspector"],
    "Packaging & Printing": ["Production Manager", "Design Executive", "Quality Inspector", "Sales Executive"],
    "Furniture & Woodwork": ["Furniture Designer", "Production Supervisor", "Sales Executive", "Carpenter", "Quality Inspector"],
    "Paints & Coatings": ["Chemical Engineer", "Sales Executive", "R&D Scientist", "Application Technician"],

    "Real Estate & Infrastructure": ["Real Estate Agent", "Site Engineer", "Project Manager", "Business Development Executive", "CRM Executive", "Sales Manager"],
    "Roads & Highways": ["Civil Engineer", "Project Manager", "Survey Engineer", "Site Supervisor"],
    "Architecture & Interior Design": ["Architect", "Interior Designer", "3D Visualizer", "CAD Designer", "Project Coordinator"],
    "Smart City & Urban Development": ["Urban Planner", "Civil Engineer", "Project Manager", "IoT Engineer"],

    "Information Technology (IT)": ["Software Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer", "System Analyst", "IT Consultant"],
    "Software Development": ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile App Developer", "QA Engineer"],
    "Cloud Computing": ["Cloud Architect", "Cloud Engineer", "DevOps Engineer", "Solutions Architect"],
    "Cybersecurity": ["Security Analyst", "Ethical Hacker", "Security Engineer", "CISO", "SOC Analyst"],
    "Data Analytics & AI": ["Data Analyst", "Data Scientist", "ML Engineer", "Business Intelligence Analyst", "AI Researcher"],
    "Web & App Development": ["Web Developer", "Mobile App Developer", "UI/UX Designer", "Frontend Developer"],
    "BPO / KPO / Call Center": ["Customer Support Executive", "Team Leader", "Quality Analyst", "Operations Manager", "Process Executive"],
    "Telecom & Internet": ["Network Engineer", "Telecom Engineer", "RF Engineer", "Sales Executive", "Field Technician"],

    "Banking": ["Relationship Manager", "Branch Manager", "Credit Analyst", "Loan Officer", "Teller", "Sales Executive (CASA/HL/LAP/BL/SME)"],
    "NBFC & Microfinance": ["Loan Officer", "Credit Manager", "Field Executive", "Recovery Executive", "Branch Manager"],
    "Insurance (Life / General / Health)": ["Insurance Advisor", "Claims Manager", "Underwriter", "Sales Manager", "Branch Manager", "Actuarial Analyst"],
    "Investment & Wealth Management": ["Wealth Manager", "Investment Advisor", "Portfolio Manager", "Financial Analyst"],
    "Fintech & Payment Solutions": ["Product Manager", "Software Developer", "Business Analyst", "Sales Executive", "Compliance Officer"],
    "Stockbroking & Mutual Funds": ["Research Analyst", "Dealer", "Relationship Manager", "Compliance Officer"],

    "FMCG": ["Sales Executive", "Area Sales Manager", "Brand Manager", "Trade Marketing Executive", "Supply Chain Executive", "Key Account Manager"],
    "Retail": ["Store Manager", "Sales Associate", "Visual Merchandiser", "Customer Service Executive", "Inventory Manager"],
    "E-commerce": ["Category Manager", "Digital Marketing Executive", "Warehouse Supervisor", "Customer Support", "Operations Manager"],
    "Consumer Durables": ["Sales Executive", "Service Engineer", "Area Manager", "Product Manager"],
    "Fashion Retail": ["Store Manager", "Fashion Designer", "Merchandiser", "Visual Merchandiser", "Sales Associate"],
    "Beauty & Personal Care": ["Sales Executive", "Brand Executive", "Beauty Advisor", "Distribution Manager"],
    "Jewellery": ["Jewellery Designer", "Sales Executive", "Store Manager", "Quality Inspector"],

    "Logistics & Supply Chain": ["Logistics Coordinator", "Supply Chain Manager", "Warehouse Manager", "Fleet Manager", "Operations Executive"],
    "Transport & Fleet": ["Fleet Manager", "Transport Coordinator", "Driver", "Operations Manager", "Logistics Executive"],
    "Warehousing & Distribution": ["Warehouse Manager", "Inventory Manager", "Warehouse Supervisor", "Packing Supervisor"],
    "Freight & Cargo": ["Freight Executive", "Cargo Supervisor", "Operations Manager", "Documentation Executive"],
    "Import–Export": ["Export Manager", "Import Coordinator", "Customs Executive", "Documentation Officer"],
    "Cold Chain Logistics": ["Cold Chain Manager", "Refrigeration Technician", "Logistics Executive"],

    "Hotels & Resorts": ["Hotel Manager", "Front Desk Executive", "F&B Manager", "Executive Chef", "Housekeeping Supervisor", "Sales Manager"],
    "Restaurants & QSR": ["Restaurant Manager", "Chef", "Kitchen Supervisor", "Outlet Manager", "Cashier"],
    "Travel & Tourism": ["Travel Agent", "Tour Manager", "Operations Executive", "Sales Executive"],
    "Airlines & Cruises": ["Cabin Crew", "Ground Staff", "Operations Manager", "Sales Executive"],
    "Facility & Event Management": ["Facility Manager", "Event Coordinator", "Housekeeping Supervisor", "Security Manager"],

    "Hospitals & Clinics": ["Doctor", "Nurse", "Hospital Administrator", "Medical Receptionist", "Physiotherapist", "Lab Technician"],
    "Diagnostics & Pathology": ["Lab Technician", "Pathologist", "Radiologist", "Collection Center Manager"],
    "Wellness, Spa & Fitness": ["Fitness Trainer", "Yoga Instructor", "Spa Therapist", "Nutritionist", "Center Manager"],
    "Mental Health": ["Psychiatrist", "Psychologist", "Counselor", "Therapist"],

    "Schools & Colleges": ["Teacher", "Principal", "Vice Principal", "Professor", "Academic Coordinator"],
    "EdTech": ["Content Creator", "Instructional Designer", "Sales Executive", "Product Manager", "Tech Developer"],
    "Coaching & Skill Development": ["Trainer", "Coordinator", "Business Development Executive", "Center Head"],

    "Advertising & Digital Marketing": ["Digital Marketing Executive", "Social Media Manager", "SEO Specialist", "Content Writer", "Brand Manager", "Creative Designer"],
    "Media & Broadcasting": ["Journalist", "Content Producer", "Video Editor", "News Anchor", "Reporter"],
    "Film, OTT & Production": ["Director", "Producer", "Assistant Director", "Cinematographer", "Editor", "Production Assistant"],
    "Animation & Graphic Design": ["Graphic Designer", "Animator", "3D Artist", "Motion Designer", "UI/UX Designer"],
    "Gaming & Esports": ["Game Developer", "Game Designer", "QA Tester", "Community Manager", "Esports Manager"],

    "Legal Services": ["Lawyer", "Legal Advisor", "Legal Executive", "Compliance Officer", "Paralegal"],
    "CA & Accounting": ["Chartered Accountant", "Accountant", "Auditor", "Tax Consultant", "Finance Executive"],
    "Business Consulting": ["Management Consultant", "Strategy Analyst", "Business Analyst", "Operations Consultant"],
    "HR & Recruitment": ["HR Executive", "Recruiter", "HR Manager", "Payroll Executive", "Talent Acquisition"],
    "Market Research": ["Research Analyst", "Data Analyst", "Field Investigator", "Research Manager"],

    "Oil & Gas": ["Petroleum Engineer", "Geologist", "Drilling Engineer", "Operations Manager", "Safety Officer"],
    "Power & Electricity": ["Electrical Engineer", "Power Plant Operator", "Substation Engineer", "Maintenance Technician"],
    "Renewable Energy (Solar, Wind, Hydro)": ["Solar Engineer", "Wind Turbine Technician", "Project Manager", "Sales Executive", "Site Engineer"],

    "Electric Vehicles (EV)": ["EV Engineer", "Battery Technologist", "Sales Executive", "Software Developer", "R&D Engineer"],
    "IoT & Smart Devices": ["IoT Engineer", "Embedded Systems Engineer", "Product Manager", "Hardware Engineer"],
    "Blockchain & Crypto": ["Blockchain Developer", "Smart Contract Engineer", "Crypto Analyst", "Compliance Officer"],
    "R&D & Scientific Research": ["Research Scientist", "Lab Analyst", "R&D Manager", "Technical Writer"],
    "Robotics & Automation": ["Robotics Engineer", "Automation Engineer", "PLC Programmer", "Systems Integrator"],
    "Green Technology & Waste Management": ["Environmental Engineer", "Sustainability Manager", "Waste Management Executive"],

    "Government & Public Sector": ["Clerk", "Officer", "Administrative Executive", "IAS/IPS Aspirant", "PSU Engineer"],
    "Security Services": ["Security Guard", "Security Supervisor", "Security Manager", "Trainer"],
    "NGO & Social Sector": ["Program Manager", "Field Coordinator", "Social Worker", "Fundraising Executive"],
    "Freelancer / Self-Employed": ["Freelancer", "Consultant", "Self-Employed Professional"],
    "Other": ["Other"],
};
