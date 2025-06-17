"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building,
  Code,
  Edit2,
  MapPin,
  Menu,
  Save,
  Settings,
  Trash,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";

export default function Jobseeker() {
  const router = useRouter();
  const { data: session } = useSession();
  const [userData, setUserData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [jobseekerData, setJobseekerData] = useState(null);
  const dropdownRef = useRef(null);

  const [profileData, setProfileData] = useState({
    userId: "",
    name: "",
    email: "",
    role: "jobseeker",
    phoneNumber: "",
    professionalTitle: "",
    currentJobTitle: "",
    currentCompany: "",
    summary: "",
    skills: [],
    linkedInUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    twitterUrl: "",
    resumeUrl: "",
    education: [],
    experience: [],
    certification: [],
    project: [],
    totalExperienceYears: 0,
    totalExperienceMonths: 0,
    expectedSalaryMin: null,
    expectedSalaryMax: null,
    expectedSalaryCurrency: "INR",
    noticePeriod: "Immediate",
    preferredJobType: "",
    preferredWorkMode: "",
    preferredLocations: [],
    industryPreference: [],
    willingToRelocate: false,
    isActivelyLooking: true,
    availabilityStatus: [],
    profileCompletionPercentage: 0,
  });

  // Fetch user session details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const endpoint = token ? "/api/user/manual" : "/api/user/me";
        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : undefined;
        const res = await fetch(endpoint, { method: "GET", headers });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const user = await res.json();
        setUserData(user);
        setProfileData((prev) => ({
          ...prev,
          userId: user.id,
          name: user.name || "",
          email: user.email || "",
        }));
      } catch (err) {
        console.error(err.message);
      }
    };
    if (session || localStorage.getItem("token")) {
      fetchUser();
    }
  }, [session]);

  // Fetch or Create Jobseeker Profile
  useEffect(() => {
    const fetchJobseekerProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : undefined;
        const res = await fetch("/api/JobseekerUpdate", {
          method: "GET",
          headers,
        });

        if (res.status === 404 || res.status === 500) {
          // Create default profile
          await createJobseekerProfile();
        } else {
          const data = await res.json();
          setJobseekerData(data);
          setProfileData((prev) => ({
            ...prev,
            ...data,
            skills: data.skills || [],
            education: data.education || [],
            experience: data.experience || [],
            certification: data.certification || [],
            project: data.project || [],
          }));
        }
      } catch (err) {
        console.error("Error fetching jobseeker profile:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session || localStorage.getItem("token")) {
      fetchJobseekerProfile();
    } else {
      setLoading(false);
    }
  }, [session]);

  // Create default jobseeker profile
  async function createJobseekerProfile(
    profileOverride?: Partial<typeof profileData>
  ) {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const jobseekerProfileData = {
        userId: session.user.id,
        ...profileData,
        ...profileOverride, // Use override if provided
      };

      const res = await fetch("/api/JobseekerUpdate", {
        method: "POST",
        headers,
        body: JSON.stringify(jobseekerProfileData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || `Failed to create profile: ${res.status}`
        );
      }

      const responseData = await res.json();
      console.log("Profile created successfully:", responseData);
      setJobseekerData(responseData.profile);
      setProfileData(responseData.profile);
    } catch (err) {
      console.error("Error creating jobseeker profile:", err.message);
      alert(`Failed to create profile: ${err.message}`);
    }
  }

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      const res = await fetch("/api/JobseekerUpdate", {
        method: "POST",
        headers,
        body: JSON.stringify(profileData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || `Failed to save profile: ${res.status}`
        );
      }
      const responseData = await res.json();
      setIsEditing(false);
      alert("Profile saved successfully!");
    } catch (err) {
      console.error("Error saving profile:", err.message);
      alert(`Failed to save profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddEducation = () => {
    const newEdu = {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      cgpa: "",
      percentage: "",
      isCurrentlyStudying: false, // ✅ include this
    };
    setProfileData((prevData) => ({
      ...prevData,
      education: [...prevData.education, newEdu],
    }));
  };

  const handleRemoveEducation = (index) => {
    setProfileData((prevData) => ({
      ...prevData,
      education: prevData.education.filter((_, i) => i !== index),
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...profileData.education];
    updatedEducation[index][field] = value;
    setProfileData((prevData) => ({
      ...prevData,
      education: updatedEducation,
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...profileData.experience];
    updatedExperience[index][field] = value;

    // ✅ Fixed: Update experience, not education
    setProfileData((prevData) => ({
      ...prevData,
      experience: updatedExperience, // Was incorrectly setting education
    }));
  };

  const handleAddExperience = () => {
    const newExperience = {
      jobTitle: "",
      companyName: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrentJob: false,
      description: "",
      achievements: [""],
    };
    setProfileData((prevData) => ({
      ...prevData,
      experience: [...prevData.experience, newExperience],
    }));
  };

  const handleRemoveExperience = (index) => {
    setProfileData((prevData) => ({
      ...prevData,
      experience: prevData.experience.filter((_, i) => i !== index),
    }));
  };

  const handleCertificationChange = (index, field, value) => {
    const updatedCertifications = [...profileData.certification];
    updatedCertifications[index][field] = value;

    // Clear expiration date if "does not expire" is checked
    if (field === "doesNotExpire" && value === true) {
      updatedCertifications[index].expirationDate = "";
    }

    setProfileData((prevData) => ({
      ...prevData,
      certification: updatedCertifications,
    }));
  };

  const handleAddCertification = () => {
    const newCertification = {
      name: "",
      issuingOrganization: "",
      issueDate: "",
      expirationDate: "",
      credentialId: "",
      credentialUrl: "",
      doesNotExpire: false, // Added this helper field
    };
    setProfileData((prevData) => ({
      ...prevData,
      certification: [...prevData.certification, newCertification],
    }));
  };

  const handleRemoveCertification = (index) => {
    setProfileData((prevData) => ({
      ...prevData,
      certification: prevData.certification.filter((_, i) => i !== index),
    }));
  };

  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...profileData.project];
    updatedProjects[index][field] = value;

    // Clear end date if project is marked as ongoing
    if (field === "isOngoing" && value === true) {
      updatedProjects[index].endDate = "";
    }

    setProfileData((prevData) => ({
      ...prevData,
      project: updatedProjects,
    }));
  };

  const handleAddProject = () => {
    const newProject = {
      title: "",
      description: "",
      technologies: [""],
      projectUrl: "",
      githubUrl: "",
      startDate: "",
      endDate: "",
      isOngoing: false,
    };
    setProfileData((prevData) => ({
      ...prevData,
      project: [...prevData.project, newProject],
    }));
  };

  const handleRemoveProject = (index) => {
    setProfileData((prevData) => ({
      ...prevData,
      project: prevData.project.filter((_, i) => i !== index),
    }));
  };

  // Technology-specific handlers
  const handleTechnologyChange = (projectIndex, techIndex, value) => {
    const updatedProjects = [...profileData.project];
    updatedProjects[projectIndex].technologies[techIndex] = value;

    setProfileData((prevData) => ({
      ...prevData,
      project: updatedProjects,
    }));
  };

  const handleAddTechnology = (projectIndex) => {
    const updatedProjects = [...profileData.project];
    updatedProjects[projectIndex].technologies.push("");

    setProfileData((prevData) => ({
      ...prevData,
      project: updatedProjects,
    }));
  };

  const handleRemoveTechnology = (projectIndex, techIndex) => {
    const updatedProjects = [...profileData.project];
    updatedProjects[projectIndex].technologies = updatedProjects[
      projectIndex
    ].technologies.filter((_, i) => i !== techIndex);

    setProfileData((prevData) => ({
      ...prevData,
      project: updatedProjects,
    }));
  };

  const handlePreferredLocationChange = (index, value) => {
    const updatedLocations = [...(profileData.preferredLocations || [])];
    updatedLocations[index] = value;
    setProfileData((prev) => ({
      ...prev,
      preferredLocations: updatedLocations,
    }));
  };

  const handleAddPreferredLocation = () => {
    setProfileData((prev) => ({
      ...prev,
      preferredLocations: [...(prev.preferredLocations || []), ""],
    }));
  };

  const handleRemovePreferredLocation = (index) => {
    setProfileData((prev) => ({
      ...prev,
      preferredLocations: (prev.preferredLocations || []).filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleIndustryPreferenceChange = (index, value) => {
    const updatedIndustries = [...(profileData.industryPreference || [])];
    updatedIndustries[index] = value;
    setProfileData((prev) => ({
      ...prev,
      industryPreference: updatedIndustries,
    }));
  };

  const handleAddIndustryPreference = () => {
    setProfileData((prev) => ({
      ...prev,
      industryPreference: [...(prev.industryPreference || []), ""],
    }));
  };

  const handleRemoveIndustryPreference = (index) => {
    setProfileData((prev) => ({
      ...prev,
      industryPreference: (prev.industryPreference || []).filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleAvailabilityStatusChange = (index, value) => {
    const updatedStatuses = [...(profileData.availabilityStatus || [])];
    updatedStatuses[index] = value;
    setProfileData((prev) => ({
      ...prev,
      availabilityStatus: updatedStatuses,
    }));
  };

  const handleAddAvailabilityStatus = () => {
    setProfileData((prev) => ({
      ...prev,
      availabilityStatus: [...(prev.availabilityStatus || []), ""],
    }));
  };

  const handleRemoveAvailabilityStatus = (index) => {
    setProfileData((prev) => ({
      ...prev,
      availabilityStatus: (prev.availabilityStatus || []).filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    signOut({ callbackUrl: "/sign_up_login" });
  };

  const userName = userData?.name || session?.user?.name || "Jobseeker";
  const userImage =
    userData?.userImage || session?.user?.image || "/user-avatar.png";

  if (loading) {
    return (
      <div className="h-screen w-screen bg-muted text-2xl flex items-center justify-center text-primary font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-muted text-gray-800">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-muted shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <Image src="/logo.png" alt="Logo" width={30} height={30} />
          <span className="text-xl font-semibold text-secondary">
            JobLinker
          </span>
        </div>
        <div className="relative" ref={dropdownRef}>
          <img
            src={userImage}
            alt="User "
            className="w-8 h-8 rounded-full cursor-pointer border border-primary"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
              <a
                href="/profile"
                className="block px-4 py-2 text-primary hover:bg-cyan-300"
              >
                My Profile
              </a>
              <a
                href="/settings"
                className="block px-4 py-2 text-primary hover:bg-cyan-300"
              >
                Settings
              </a>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-primary hover:bg-cyan-300"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`w-full md:w-64 bg-white/30 shadow-xl border-r rounded-xl p-4 md:p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "block" : "hidden"
        } md:block`}
      >
        <div>
          <div className="hidden md:flex items-center mb-8">
            <Image
              src="/logo.png"
              alt="Logo"
              width={50}
              height={50}
              className="mr-2"
            />
            <h1 className="text-2xl font-semibold text-secondary">JobLinker</h1>
          </div>
          <nav className="space-y-4 text-primary">
            <a
              href="../Jobdashboard"
              className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium"
            >
              Dashboard
            </a>
            <a
              href="../Jobseeker"
              className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium"
            >
              Job Board
            </a>
            <a
              href="../Jobschedule"
              className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium"
            >
              Schedule
            </a>
            <a
              href="../Jobmessenger"
              className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium"
            >
              Messenger
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 bg-[url('/profile.png')] bg-center bg-contain bg-no-repeat md:p-8">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-6 relative">
          <input
            type="text"
            placeholder="Quick Search (Ctrl + Q)"
            className="w-1/2 px-4 py-2 bg-white/50 backdrop-blur-lg text-primary shadow-lg rounded-lg"
          />
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <span className="font-semibold text-primary mr-2">
                {userName}
              </span>
              <img
                src={userImage}
                alt="User "
                className="w-8 h-8 rounded-full border-2 cursor-pointer"
              />
            </button>
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 px-4 py-3 font-semibold w-48 bg-white rounded-md shadow-lg z-50"
                role="menu"
                aria-label="User  menu"
              >
                <a
                  href="/profile"
                  className="block px-4 py-2 text-primary hover:bg-accent hover:rounded-lg hover:shadow-lg"
                  role="menuitem"
                >
                  My Profile
                </a>
                <a
                  href="/settings"
                  className="block px-4 py-2 text-primary hover:bg-accent hover:rounded-lg hover:shadow-lg"
                  role="menuitem"
                >
                  Settings
                </a>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 hover:shadow-lg hover:rounded-lg text-primary hover:bg-accent"
                  role="menuitem"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="mx-4 my-4 md:my-10 md:mx-10 bg-white/30 backdrop-blur-2xl rounded-2xl text-primary shadow-xl">
          {/* Profile Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8" />
              <h2 className="text-3xl font-semibold">Profile</h2>
            </div>
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {saving ? (
                "Saving..."
              ) : isEditing ? (
                <>
                  <Save className="w-4 h-4" /> Save
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" /> Edit
                </>
              )}
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg">
                      {profileData.name || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg">
                      {profileData.email || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  {isEditing ? (
                    <select
                      value={profileData.role}
                      onChange={(e) =>
                        handleInputChange("role", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="employer">Employer</option>
                      <option value="jobseeker">Job Seeker</option>
                    </select>
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg capitalize">
                      {profileData.role || "Employer"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg">
                      {profileData.phoneNumber || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Educational Information */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Education
              </h3>

              {profileData.education.map((edu, index) => (
                <div
                  key={index}
                  className="grid md:grid-cols-2 gap-4 mb-6 bg-white/20 p-4 rounded-xl relative"
                >
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                      title="Remove this entry"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}

                  {/* Each field block (Institution, Degree, etc.) remains the same */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Institution
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "institution",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {edu.institution || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Degree
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) =>
                          handleEducationChange(index, "degree", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {edu.degree || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Field Of Study
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "fieldOfStudy",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {edu.fieldOfStudy || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cgpa
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={edu.cgpa}
                        onChange={(e) =>
                          handleEducationChange(index, "cgpa", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {edu.cgpa || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Percentage
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={edu.percentage}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "percentage",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {edu.percentage || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={edu.isCurrentlyStudying}
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "isCurrentlyStudying",
                          e.target.checked
                        )
                      }
                      className="accent-cyan-600 w-4 h-4"
                    />
                    <label className="text-sm font-medium">
                      I am currently studying here
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Start Date
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "startDate",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {edu.startDate || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      End Date
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={edu.endDate}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "endDate",
                            e.target.value
                          )
                        }
                        disabled={edu.isCurrentlyStudying} // ✅ disables if checked
                        className={`w-full px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border focus:outline-none focus:ring-2 ${
                          edu.isCurrentlyStudying
                            ? "opacity-50 cursor-not-allowed"
                            : "focus:ring-primary/50"
                        }`}
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {edu.isCurrentlyStudying
                          ? "Currently Studying"
                          : edu.endDate || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* ... */}
                </div>
              ))}

              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="mt-2 px-4 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-400 text-primary font-semibold transition"
                  >
                    + Add Education
                  </button>
                </div>
              )}
            </section>

            {/* Experience section */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Experience
              </h3>

              {profileData.experience.map((exp, index) => (
                <div
                  key={index}
                  className="grid md:grid-cols-2 gap-4 mb-6 bg-white/20 p-4 rounded-xl relative"
                >
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                      title="Remove this entry"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}

                  {/* Job Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Job Title
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={exp.jobTitle || ""} // ✅ Fixed: Handle null/undefined
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "jobTitle",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {exp.jobTitle || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Company
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={exp.companyName || ""} // ✅ Fixed: Handle null/undefined
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "companyName",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {exp.companyName || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={exp.location || ""} // ✅ Fixed: Handle null/undefined
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "location",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {exp.location || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Start Date
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={exp.startDate || ""} // ✅ Fixed: Handle null/undefined
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "startDate",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {exp.startDate || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      End Date
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={exp.endDate || ""} // ✅ Fixed: Handle null/undefined
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "endDate",
                            e.target.value
                          )
                        }
                        disabled={exp.isCurrentJob}
                        className={`w-full px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border focus:outline-none focus:ring-2 ${
                          exp.isCurrentJob
                            ? "opacity-50 cursor-not-allowed"
                            : "focus:ring-primary/50"
                        }`}
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {exp.isCurrentJob
                          ? "Currently Working" // ✅ Fixed: Changed from "Currently Studying"
                          : exp.endDate || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* Add Current Job Checkbox in Edit Mode */}
                  {isEditing && (
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={exp.isCurrentJob || false} // ✅ Handle undefined
                          onChange={(e) =>
                            handleExperienceChange(
                              index,
                              "isCurrentJob",
                              e.target.checked
                            )
                          }
                          className="accent-cyan-600 w-4 h-4"
                        />
                        <span className="text-sm">This is my current job</span>
                      </label>
                    </div>
                  )}
                </div>
              ))}

              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="mt-2 px-4 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-400 text-primary font-semibold transition"
                  >
                    + Add Experience{" "}
                    {/* ✅ Fixed: Changed from "Add Education" */}
                  </button>
                </div>
              )}
            </section>

            {/* Certification section */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certifications
              </h3>

              {profileData.certification.map((cert, index) => (
                <div
                  key={index}
                  className="grid md:grid-cols-2 gap-4 mb-6 bg-white/20 p-4 rounded-xl relative"
                >
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCertification(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                      title="Remove this certification"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}

                  {/* Certification Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Certification Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={cert.name || ""}
                        onChange={(e) =>
                          handleCertificationChange(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="e.g., AWS Certified Solutions Architect"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {cert.name || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* Issuing Organization */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Issuing Organization
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={cert.issuingOrganization || ""}
                        onChange={(e) =>
                          handleCertificationChange(
                            index,
                            "issuingOrganization",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="e.g., Amazon Web Services"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {cert.issuingOrganization || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* Issue Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Issue Date
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={cert.issueDate || ""}
                        onChange={(e) =>
                          handleCertificationChange(
                            index,
                            "issueDate",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {cert.issueDate || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* Expiration Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Expiration Date
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={cert.expirationDate || ""}
                        onChange={(e) =>
                          handleCertificationChange(
                            index,
                            "expirationDate",
                            e.target.value
                          )
                        }
                        disabled={cert.doesNotExpire}
                        className={`w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 ${
                          cert.doesNotExpire
                            ? "opacity-50 cursor-not-allowed"
                            : "focus:ring-primary/50"
                        }`}
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {cert.doesNotExpire
                          ? "Does not expire"
                          : cert.expirationDate || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* Credential ID */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Credential ID
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={cert.credentialId || ""}
                        onChange={(e) =>
                          handleCertificationChange(
                            index,
                            "credentialId",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="e.g., 12345-ABCDE-67890"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {cert.credentialId || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* Credential URL */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Credential URL
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={cert.credentialUrl || ""}
                        onChange={(e) =>
                          handleCertificationChange(
                            index,
                            "credentialUrl",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="https://www.credly.com/badges/..."
                      />
                    ) : cert.credentialUrl ? (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-blue-500/20 text-blue-700 rounded-lg block hover:bg-blue-500/30 transition-colors"
                      >
                        View Credential
                      </a>
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        Not provided
                      </p>
                    )}
                  </div>

                  {/* Does Not Expire Checkbox */}
                  {isEditing && (
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={cert.doesNotExpire || false}
                          onChange={(e) =>
                            handleCertificationChange(
                              index,
                              "doesNotExpire",
                              e.target.checked
                            )
                          }
                          className="accent-cyan-600 w-4 h-4"
                        />
                        <span className="text-sm">
                          This certification does not expire
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Certification Status Badge */}
                  {!isEditing && (
                    <div className="md:col-span-2 flex gap-2 flex-wrap">
                      {cert.expirationDate && !cert.doesNotExpire && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            new Date(cert.expirationDate) > new Date()
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {new Date(cert.expirationDate) > new Date()
                            ? "Active"
                            : "Expired"}
                        </span>
                      )}
                      {cert.doesNotExpire && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Lifetime Valid
                        </span>
                      )}
                      {cert.credentialUrl && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Verified
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {profileData.certification.length === 0 && !isEditing && (
                <div className="text-center py-8 text-gray-600">
                  <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No certifications added yet</p>
                </div>
              )}

              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddCertification}
                    className="mt-2 px-4 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-400 text-primary font-semibold transition"
                  >
                    + Add Certification
                  </button>
                </div>
              )}
            </section>

            {/* Projects section */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Projects
              </h3>

              {profileData.project.map((proj, index) => (
                <div
                  key={index}
                  className="bg-white/20 p-4 rounded-xl mb-6 relative"
                >
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                      title="Remove this project"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Project Title */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Project Title
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={proj.title || ""}
                          onChange={(e) =>
                            handleProjectChange(index, "title", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="e.g., E-commerce Website"
                        />
                      ) : (
                        <h4 className="px-3 py-2 bg-white/30 rounded-lg font-semibold">
                          {proj.title || "Untitled Project"}
                        </h4>
                      )}
                    </div>

                    {/* Project Status */}
                    <div className="flex items-end">
                      {!isEditing && (
                        <div className="flex gap-2 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              proj.isOngoing
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {proj.isOngoing ? "Ongoing" : "Completed"}
                          </span>
                          {proj.projectUrl && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Live Demo
                            </span>
                          )}
                          {proj.githubUrl && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Open Source
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        value={proj.description || ""}
                        onChange={(e) =>
                          handleProjectChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        rows={3}
                        className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Describe your project, its features, and impact..."
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {proj.description || "No description provided"}
                      </p>
                    )}
                  </div>

                  {/* Technologies */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Technologies Used
                    </label>
                    {isEditing ? (
                      <div className="space-y-2">
                        {proj.technologies.map((tech, techIndex) => (
                          <div key={techIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={tech || ""}
                              onChange={(e) =>
                                handleTechnologyChange(
                                  index,
                                  techIndex,
                                  e.target.value
                                )
                              }
                              className="flex-1 px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                              placeholder="e.g., React, Node.js, MongoDB"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveTechnology(index, techIndex)
                              }
                              className="px-3 py-2 text-red-600 hover:text-red-800"
                              title="Remove technology"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleAddTechnology(index)}
                          className="text-sm text-cyan-600 hover:text-cyan-800 font-medium"
                        >
                          + Add Technology
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {proj.technologies && proj.technologies.length > 0 ? (
                          proj.technologies.map(
                            (tech, techIndex) =>
                              tech && (
                                <span
                                  key={techIndex}
                                  className="px-3 py-1 bg-blue-500/20 text-blue-700 rounded-full text-sm font-medium"
                                >
                                  {tech}
                                </span>
                              )
                          )
                        ) : (
                          <span className="px-3 py-2 bg-white/30 rounded-lg text-sm">
                            No technologies specified
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Start Date
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={proj.startDate || ""}
                          onChange={(e) =>
                            handleProjectChange(
                              index,
                              "startDate",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      ) : (
                        <p className="px-3 py-2 bg-white/30 rounded-lg">
                          {proj.startDate || "Not specified"}
                        </p>
                      )}
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        End Date
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={proj.endDate || ""}
                          onChange={(e) =>
                            handleProjectChange(
                              index,
                              "endDate",
                              e.target.value
                            )
                          }
                          disabled={proj.isOngoing}
                          className={`w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 ${
                            proj.isOngoing
                              ? "opacity-50 cursor-not-allowed"
                              : "focus:ring-primary/50"
                          }`}
                        />
                      ) : (
                        <p className="px-3 py-2 bg-white/30 rounded-lg">
                          {proj.isOngoing
                            ? "Ongoing"
                            : proj.endDate || "Not specified"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Project URL */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Project URL
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={proj.projectUrl || ""}
                          onChange={(e) =>
                            handleProjectChange(
                              index,
                              "projectUrl",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="https://your-project.com"
                        />
                      ) : proj.projectUrl ? (
                        <a
                          href={proj.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-blue-500/20 text-blue-700 rounded-lg block hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Live Project
                        </a>
                      ) : (
                        <p className="px-3 py-2 bg-white/30 rounded-lg">
                          No live demo available
                        </p>
                      )}
                    </div>

                    {/* GitHub URL */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        GitHub URL
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={proj.githubUrl || ""}
                          onChange={(e) =>
                            handleProjectChange(
                              index,
                              "githubUrl",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="https://github.com/username/repo"
                        />
                      ) : proj.githubUrl ? (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-gray-500/20 text-gray-700 rounded-lg block hover:bg-gray-500/30 transition-colors flex items-center gap-2"
                        >
                          <Github className="w-4 h-4" />
                          View Source Code
                        </a>
                      ) : (
                        <p className="px-3 py-2 bg-white/30 rounded-lg">
                          Source code not available
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ongoing Project Checkbox */}
                  {isEditing && (
                    <div className="mb-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={proj.isOngoing || false}
                          onChange={(e) =>
                            handleProjectChange(
                              index,
                              "isOngoing",
                              e.target.checked
                            )
                          }
                          className="accent-cyan-600 w-4 h-4"
                        />
                        <span className="text-sm">This project is ongoing</span>
                      </label>
                    </div>
                  )}
                </div>
              ))}

              {profileData.project.length === 0 && !isEditing && (
                <div className="text-center py-8 text-gray-600">
                  <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No projects added yet</p>
                </div>
              )}

              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="mt-2 px-4 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-400 text-primary font-semibold transition"
                  >
                    + Add Project
                  </button>
                </div>
              )}
            </section>

            {/* Summary */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Summary</h3>
              {isEditing ? (
                <textarea
                  value={profileData.summary}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              ) : (
                <p className="px-3 py-2 bg-white/30 rounded-lg min-h-[100px]">
                  {profileData.summary || "Not provided"}
                </p>
              )}
            </section>

            {/* Skills */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Skills</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.skills.join(", ")}
                  onChange={(e) =>
                    handleInputChange("skills", e.target.value.split(", "))
                  }
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              ) : (
                <p className="px-3 py-2 bg-white/30 rounded-lg">
                  {profileData.skills.join(", ") || "Not provided"}
                </p>
              )}
            </section>

            {/* Professional Details */}
            <section>
              <h3 className="text-xl font-semibold mb-4">
                Professional Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "Professional Title", key: "professionalTitle" },
                  { label: "Current Job Title", key: "currentJobTitle" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-2">
                      {label}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData[key]}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg">
                        {profileData[key] || "Not provided"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Online Profiles */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Online Profiles</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Other profile URLs */}
                {[
                  { label: "LinkedIn URL", key: "linkedInUrl" },
                  { label: "GitHub URL", key: "githubUrl" },
                  { label: "Portfolio URL", key: "portfolioUrl" },
                  { label: "Twitter URL", key: "twitterUrl" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-2">
                      {label}
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profileData[key]}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-white/30 rounded-lg break-all">
                        {profileData[key] || "Not provided"}
                      </p>
                    )}
                  </div>
                ))}

                {/* Resume URL with UploadThing */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Resume URL
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="url"
                        value={profileData.resumeUrl}
                        onChange={(e) =>
                          handleInputChange("resumeUrl", e.target.value)
                        }
                        placeholder="Paste resume link or upload below"
                        className="w-full px-3 py-2 mb-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <UploadButton
                        endpoint="resumeUploader"
                        appearance={{
                          button:
                            "ut-upload-btn bg-secondary hover:bg-accent text-white px-4 py-2 rounded-lg",
                          container: "ut-upload-container mt-2",
                          allowedContent: "text-xs text-gray-500",
                        }}
                        onClientUploadComplete={(res) => {
                          if (res && res[0]?.url) {
                            handleInputChange("resumeUrl", res[0].url);
                            alert("Resume uploaded!");
                          }
                        }}
                        onUploadError={(error) => {
                          console.error(error);
                          alert("Upload failed. Please try again.");
                        }}
                      />
                    </>
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg break-all">
                      {profileData.resumeUrl || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Preferences */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Career Preferences
              </h3>

              <div className="space-y-6">
                {/* Experience & Salary Section */}
                <div className="bg-white/20 p-4 rounded-xl">
                  <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Experience & Salary
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Total Experience */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Total Experience
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max="50"
                              value={profileData.totalExperienceYears || 0}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  totalExperienceYears:
                                    parseInt(e.target.value) || 0,
                                }))
                              }
                              className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                              placeholder="0"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-white/30 rounded-lg">
                              {profileData.totalExperienceYears || 0}
                            </p>
                          )}
                          <label className="text-xs text-gray-600 mt-1 block">
                            Years
                          </label>
                        </div>
                        <div className="flex-1">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max="11"
                              value={profileData.totalExperienceMonths || 0}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  totalExperienceMonths:
                                    parseInt(e.target.value) || 0,
                                }))
                              }
                              className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                              placeholder="0"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-white/30 rounded-lg">
                              {profileData.totalExperienceMonths || 0}
                            </p>
                          )}
                          <label className="text-xs text-gray-600 mt-1 block">
                            Months
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Expected Salary Range */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Expected Salary Range
                      </label>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={profileData.expectedSalaryMin || ""}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  expectedSalaryMin:
                                    parseInt(e.target.value) || "",
                                }))
                              }
                              className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                              placeholder="Minimum"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-white/30 rounded-lg">
                              {profileData.expectedSalaryMin
                                ? `${profileData.expectedSalaryMin.toLocaleString()}`
                                : "Not specified"}
                            </p>
                          )}
                        </div>
                        <span className="text-gray-600">to</span>
                        <div className="flex-1">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={profileData.expectedSalaryMax || ""}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  expectedSalaryMax:
                                    parseInt(e.target.value) || "",
                                }))
                              }
                              className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                              placeholder="Maximum"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-white/30 rounded-lg">
                              {profileData.expectedSalaryMax
                                ? `${profileData.expectedSalaryMax.toLocaleString()}`
                                : "Not specified"}
                            </p>
                          )}
                        </div>
                        <div className="w-20">
                          {isEditing ? (
                            <select
                              value={
                                profileData.expectedSalaryCurrency || "INR"
                              }
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  expectedSalaryCurrency: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                              <option value="INR">INR</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="GBP">GBP</option>
                            </select>
                          ) : (
                            <p className="px-3 py-2 bg-white/30 rounded-lg text-center">
                              {profileData.expectedSalaryCurrency || "INR"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Preferences Section */}
                <div className="bg-white/20 p-4 rounded-xl">
                  <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Job Preferences
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Notice Period */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Notice Period
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.noticePeriod || ""}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              noticePeriod: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="">Select notice period</option>
                          <option value="immediate">Immediate</option>
                          <option value="15 days">15 days</option>
                          <option value="1 month">1 month</option>
                          <option value="2 months">2 months</option>
                          <option value="3 months">3 months</option>
                          <option value="other">Other</option>
                        </select>
                      ) : (
                        <p className="px-3 py-2 bg-white/30 rounded-lg">
                          {profileData.noticePeriod || "Not specified"}
                        </p>
                      )}
                    </div>

                    {/* Preferred Job Type */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Preferred Job Type
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.preferredJobType || ""}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              preferredJobType: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="">Select job type</option>
                          <option value="full-time">Full-time</option>
                          <option value="part-time">Part-time</option>
                          <option value="contract">Contract</option>
                          <option value="freelance">Freelance</option>
                          <option value="internship">Internship</option>
                        </select>
                      ) : (
                        <p className="px-3 py-2 bg-white/30 rounded-lg">
                          {profileData.preferredJobType || "Not specified"}
                        </p>
                      )}
                    </div>

                    {/* Preferred Work Mode */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Preferred Work Mode
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.preferredWorkMode || ""}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              preferredWorkMode: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="">Select work mode</option>
                          <option value="remote">Remote</option>
                          <option value="on-site">On-site</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      ) : (
                        <p className="px-3 py-2 bg-white/30 rounded-lg">
                          {profileData.preferredWorkMode || "Not specified"}
                        </p>
                      )}
                    </div>

                    {/* Job Status */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Job Search Status
                      </label>
                      {isEditing ? (
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={profileData.isActivelyLooking || false}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  isActivelyLooking: e.target.checked,
                                }))
                              }
                              className="rounded"
                            />
                            <span className="text-sm">
                              Actively looking for opportunities
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={profileData.willingToRelocate || false}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  willingToRelocate: e.target.checked,
                                }))
                              }
                              className="rounded"
                            />
                            <span className="text-sm">Willing to relocate</span>
                          </label>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              profileData.isActivelyLooking
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {profileData.isActivelyLooking
                              ? "Actively Looking"
                              : "Not Looking"}
                          </span>
                          {profileData.willingToRelocate && (
                            <span className="inline-block ml-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Open to Relocation
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location & Industry Preferences */}
                <div className="bg-white/20 p-4 rounded-xl">
                  <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location & Industry Preferences
                  </h4>

                  <div className="space-y-4">
                    {/* Preferred Locations */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Preferred Locations
                      </label>
                      {isEditing ? (
                        <div className="space-y-2">
                          {profileData.preferredLocations?.map(
                            (location, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="text"
                                  value={location || ""}
                                  onChange={(e) =>
                                    handlePreferredLocationChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  placeholder="e.g., Mumbai, Bangalore, Remote"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemovePreferredLocation(index)
                                  }
                                  className="px-3 py-2 text-red-600 hover:text-red-800"
                                  title="Remove location"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            )
                          )}
                          <button
                            type="button"
                            onClick={handleAddPreferredLocation}
                            className="text-sm text-cyan-600 hover:text-cyan-800 font-medium"
                          >
                            + Add Location
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profileData.preferredLocations &&
                          profileData.preferredLocations.length > 0 ? (
                            profileData.preferredLocations.map(
                              (location, index) =>
                                location && (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-blue-500/20 text-blue-700 rounded-full text-sm font-medium"
                                  >
                                    {location}
                                  </span>
                                )
                            )
                          ) : (
                            <span className="px-3 py-2 bg-white/30 rounded-lg text-sm">
                              No preferred locations specified
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Industry Preferences */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Industry Preferences
                      </label>
                      {isEditing ? (
                        <div className="space-y-2">
                          {profileData.industryPreference?.map(
                            (industry, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="text"
                                  value={industry || ""}
                                  onChange={(e) =>
                                    handleIndustryPreferenceChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  placeholder="e.g., Technology, Healthcare, Finance"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveIndustryPreference(index)
                                  }
                                  className="px-3 py-2 text-red-600 hover:text-red-800"
                                  title="Remove industry"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            )
                          )}
                          <button
                            type="button"
                            onClick={handleAddIndustryPreference}
                            className="text-sm text-cyan-600 hover:text-cyan-800 font-medium"
                          >
                            + Add Industry
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profileData.industryPreference &&
                          profileData.industryPreference.length > 0 ? (
                            profileData.industryPreference.map(
                              (industry, index) =>
                                industry && (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-purple-500/20 text-purple-700 rounded-full text-sm font-medium"
                                  >
                                    {industry}
                                  </span>
                                )
                            )
                          ) : (
                            <span className="px-3 py-2 bg-white/30 rounded-lg text-sm">
                              No industry preferences specified
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Availability Status */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Availability Status
                      </label>
                      {isEditing ? (
                        <div className="space-y-2">
                          {profileData.availabilityStatus?.map(
                            (status, index) => (
                              <div key={index} className="flex gap-2">
                                <select
                                  value={status || ""}
                                  onChange={(e) =>
                                    handleAvailabilityStatusChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-3 py-2 bg-white/80 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                  <option value="">Select availability</option>
                                  <option value="immediately">
                                    Available Immediately
                                  </option>
                                  <option value="within-2-weeks">
                                    Within 2 weeks
                                  </option>
                                  <option value="within-1-month">
                                    Within 1 month
                                  </option>
                                  <option value="within-3-months">
                                    Within 3 months
                                  </option>
                                  <option value="open-to-offers">
                                    Open to offers
                                  </option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveAvailabilityStatus(index)
                                  }
                                  className="px-3 py-2 text-red-600 hover:text-red-800"
                                  title="Remove status"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            )
                          )}
                          <button
                            type="button"
                            onClick={handleAddAvailabilityStatus}
                            className="text-sm text-cyan-600 hover:text-cyan-800 font-medium"
                          >
                            + Add Availability
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profileData.availabilityStatus &&
                          profileData.availabilityStatus.length > 0 ? (
                            profileData.availabilityStatus.map(
                              (status, index) =>
                                status && (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-green-500/20 text-green-700 rounded-full text-sm font-medium"
                                  >
                                    {status
                                      .replace(/-/g, " ")
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                  </span>
                                )
                            )
                          ) : (
                            <span className="px-3 py-2 bg-white/30 rounded-lg text-sm">
                              No availability status specified
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
