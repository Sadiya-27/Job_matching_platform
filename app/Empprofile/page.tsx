"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Edit2, Save, User, Building } from "lucide-react";

export default function Employer() {
  const router = useRouter();
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [employerData, setEmployerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef(null);
  const [profData, setProfData] = useState(null);

  // Form state for employer profile
  const [profileData, setProfileData] = useState({
    // Basic user info
    name: "",
    email: "",
    role: "employer",

    // Company info
    companyName: "",
    organizationType: "",
    industry: "",
    companySize: "",
    foundedYear: "",
    websiteUrl: "",
    location: "",
    officeAddress: "",
    officialEmail: "",
    phoneNumber: "",

    // HR info
    hrName: "",
    hrDesignation: "",
    hrEmail: "",
    hrLinkedIn: "",

    // Company details
    companyDescription: "",
    missionVision: "",
    companyCulture: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const endpoint = token ? "/api/user/manual" : "/api/user/me";
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await fetch(endpoint, { method: "GET", headers });

        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setProfData(data);
      } catch (err: any) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [session]);

  useEffect(() => {
    const fetchEmployerProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : undefined;

        // Use the correct API endpoint from your route file
        const res = await fetch("/api/EmployerUpdate", {
          method: "GET",
          headers,
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch employer profile: ${res.status}`);
        }

        const data = await res.json();

        // Set both userData and employerData from the response
        setUserData({
          name: data.name,
          email: data.email,
          role: data.role,
          image: session?.user?.image,
        });

        setEmployerData(data);

        // Update profileData with all the received data
        setProfileData({
          name: data.name || "",
          email: data.email || "",
          role: data.role || "employer",
          companyName: data.companyName || "",
          organizationType: data.organizationType || "",
          industry: data.industry || "",
          companySize: data.companySize || "",
          foundedYear: data.foundedYear || "",
          websiteUrl: data.websiteUrl || "",
          location: data.location || "",
          officeAddress: data.officeAddress || "",
          officialEmail: data.officialEmail || "",
          phoneNumber: data.phoneNumber || "",
          hrName: data.hrName || "",
          hrDesignation: data.hrDesignation || "",
          hrEmail: data.hrEmail || "",
          hrLinkedIn: data.hrLinkedIn || "",
          companyDescription: data.companyDescription || "",
          missionVision: data.missionVision || "",
          companyCulture: data.companyCulture || "",
        });
      } catch (err) {
        console.error("Error fetching employer profile:", err.message);
        // If there's an error, still try to set basic user info from session
        if (session?.user) {
          setUserData({
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          });
          setProfileData((prev) => ({
            ...prev,
            name: session.user.name || "",
            email: session.user.email || "",
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have either a session or a token
    if (session || localStorage.getItem("token")) {
      fetchEmployerProfile();
    } else {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    signOut({ callbackUrl: "/sign_up_login" });
  };

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

      // Use the correct API endpoint from your route file
      const res = await fetch("/api/EmployerUpdate", {
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
      console.log("Profile saved successfully:", responseData);

      setIsEditing(false);
      alert("Profile saved successfully!");

      // Optionally refresh the data
      if (responseData.profile) {
        setEmployerData(responseData.profile);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert(`Failed to save profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const userName = userData?.name || session?.user?.name || "Employer";
  const userImage = profData?.userImage || session?.user?.image || "/user-avatar.png";

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
      <div className="md:hidden flex shadow-lg items-center justify-between p-4 border-b bg-muted">
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
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
            alt="User"
            className="w-8 h-8 rounded-full border-2 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
              <a
                href="../Empprofile"
                className="block px-4 py-2 text-primary hover:bg-cyan-300"
              >
                My Profile
              </a>
              <a
                href="/empSettings"
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
        className={`w-full md:w-64 bg-white/30 shadow-xl border-r rounded-xl p-4 md:p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "block" : "hidden"} md:block`}
      >
        <div>
          <div className="hidden md:flex items-center mb-8">
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
            <h1 className="text-2xl font-semibold ml-2 text-secondary">
              JobLinker
            </h1>
          </div>
          <nav className="space-y-4 text-primary">
            <a
              href="../Employer"
              className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium"
            >
              Dashboard
            </a>
            <a
              href="../Postjob"
              className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium"
            >
              Post Jobs
            </a>
            <a
              href="../Applicants"
              className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium"
            >
              Applicants
            </a>
            <a
              href="../Empschedule"
              className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium"
            >
              Schedule
            </a>
            <a
              href="../Empmessenger"
              className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium"
            >
              Messenger
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 bg-[url('/profile.png')] bg-cover md:p-8">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-6 relative">
          <input
            type="text"
            placeholder="Search (Ctrl + Q)"
            className="w-1/2 px-4 py-2 bg-white/50 backdrop-blur-lg text-primary shadow-lg rounded-lg"
          />
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2"
            >
              <span className="font-semibold text-primary mr-2">
                {userName}
              </span>
              <img
                src={userImage}
                alt="User"
                className="w-8 h-8 rounded-full border-2 cursor-pointer"
              />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 font-semibold px-4 py-3 w-48 bg-white rounded-md shadow-lg z-50">
                <a
                  href="/Empprofile"
                  className="block px-4 py-2 text-primary hover:bg-accent hover:rounded-lg hover:shadow-lg"
                >
                  My Profile
                </a>
                <a
                  href="/empSettings"
                  className="block px-4 py-2 text-primary hover:bg-accent hover:rounded-lg hover:shadow-lg"
                >
                  Settings
                </a>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-primary hover:bg-accent hover:rounded-lg hover:shadow-lg"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Section */}
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
                  <Save className="w-4 h-4" />
                  Save
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Edit
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
              </div>
            </section>

            {/* Company Information */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.companyName}
                      onChange={(e) =>
                        handleInputChange("companyName", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg">
                      {profileData.companyName || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Organization Type
                  </label>
                  {isEditing ? (
                    <select
                      value={profileData.organizationType}
                      onChange={(e) =>
                        handleInputChange("organizationType", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select Type</option>
                      <option value="Private Company">Private Company</option>
                      <option value="Public Company">Public Company</option>
                      <option value="Non-Profit">Non-Profit</option>
                      <option value="Government">Government</option>
                      <option value="Startup">Startup</option>
                    </select>
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg">
                      {profileData.organizationType || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Industry
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.industry}
                      onChange={(e) =>
                        handleInputChange("industry", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg">
                      {profileData.industry || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Size
                  </label>
                  {isEditing ? (
                    <select
                      value={profileData.companySize}
                      onChange={(e) =>
                        handleInputChange("companySize", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select Size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg">
                      {profileData.companySize || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Founded Year
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={profileData.foundedYear}
                      onChange={(e) =>
                        handleInputChange("foundedYear", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg">
                      {profileData.foundedYear || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Website URL
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profileData.websiteUrl}
                      onChange={(e) =>
                        handleInputChange("websiteUrl", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg">
                      {profileData.websiteUrl || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="text-xl font-semibold mb-4">
                Contact Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg">
                      {profileData.location || "Not provided"}
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Office Address
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profileData.officeAddress}
                      onChange={(e) =>
                        handleInputChange("officeAddress", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg">
                      {profileData.officeAddress || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Official Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.officialEmail}
                      onChange={(e) =>
                        handleInputChange("officialEmail", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg">
                      {profileData.officialEmail || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* HR Information */}
            <section>
              <h3 className="text-xl font-semibold mb-4">HR Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    HR Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.hrName}
                      onChange={(e) =>
                        handleInputChange("hrName", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg">
                      {profileData.hrName || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    HR Designation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.hrDesignation}
                      onChange={(e) =>
                        handleInputChange("hrDesignation", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg">
                      {profileData.hrDesignation || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    HR Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.hrEmail}
                      onChange={(e) =>
                        handleInputChange("hrEmail", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg">
                      {profileData.hrEmail || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    HR LinkedIn
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profileData.hrLinkedIn}
                      onChange={(e) =>
                        handleInputChange("hrLinkedIn", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg">
                      {profileData.hrLinkedIn || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Company Details */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Company Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Description
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profileData.companyDescription}
                      onChange={(e) =>
                        handleInputChange("companyDescription", e.target.value)
                      }
                      rows={4}
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg min-h-[100px]">
                      {profileData.companyDescription || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mission & Vision
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profileData.missionVision}
                      onChange={(e) =>
                        handleInputChange("missionVision", e.target.value)
                      }
                      rows={4}
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg min-h-[100px]">
                      {profileData.missionVision || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Culture
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profileData.companyCulture}
                      onChange={(e) =>
                        handleInputChange("companyCulture", e.target.value)
                      }
                      rows={4}
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-white/30 rounded-lg min-h-[100px]">
                      {profileData.companyCulture || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
