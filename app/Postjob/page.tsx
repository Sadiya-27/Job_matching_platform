"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

export default function Employer() {
  const router = useRouter();
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [employerData, setEmployerData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const dropdownRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    type: "Full-time",
    salaryRange: "",
    deadline: "",
    requirements: "",
    responsibilities: "",
    isRemote: false,
  });

  // Fetch user data
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
        const data = await res.json();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user:", err.message);
      }
    };

    fetchUser();
  }, [session]);

  // Fetch employer profile
  useEffect(() => {
    const fetchEmployerProfile = async () => {
      if (!userData?._id) return;

      try {
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
        };

        // Add authorization header if token exists
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(`/api/EmployerUpdate`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ userid: userData._id }),
        });

        if (res.ok) {
          const employer = await res.json();

          setEmployerData(employer.profile);
        } else {
          console.error("Failed to fetch employer profile:", res.status);
        }
      } catch (err) {
        console.error("Error fetching employer profile:", err);
      }
    };

    fetchEmployerProfile();
  }, [userData]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  const isFraudulent = async (jobData) => {
  const res = await fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: jobData.title,
      description: jobData.description,
    }),
  });

  if (!res.ok) {
    console.error("Fraud detection API failed:", res.status);
    return false;
  }

  const result = await res.json();
  return result.isFraud; // true or false
};



const checkStrikeLimit = async (userId) => {
  const res = await fetch(`/api/employer/strike/${userId}`);
  const data = await res.json();
  return data.strikes;
};


  // Fetch jobs posted by this employer
  useEffect(() => {
    const fetchJobs = async () => {
      if (!userData?._id) return;

      try {
        // Create /api/jobs/route.js file with the code I provided earlier

        const res = await fetch(`/api/jobs`, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (res.ok) {
          const jobsData = await res.json();
          setJobs(Array.isArray(jobsData) ? jobsData : []);
        } else {
          const errorData = await res.json();
          console.error("Failed to fetch jobs:", errorData.error || res.status);
          setJobs([]);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [userData]);

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

  const handleJobSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    if (!userData) {
      alert("Please log in to post jobs.");
      router.push("/sign_up_login");
      return;
    }

    if (!employerData) {
      alert("Please complete your employer profile.");
      router.push("/Empprofile");
      return;
    }

    const processedFormData = {
  ...formData,
  requirements: formData.requirements.split("\n").filter(Boolean),
  responsibilities: formData.responsibilities.split("\n").filter(Boolean),
  postedBy: userData._id,
  employer: employerData._id,
};


    const fraud = await isFraudulent({
  title: processedFormData.title,
  description: processedFormData.description,
  requirements: processedFormData.requirements.join(" "),
  responsibilities: processedFormData.responsibilities.join(" "),
  benefits: formData.benefits || "",
});



    if (fraud) {
      // 1. Increment employer strike count
      await fetch(`/api/employer/strike/${userData._id}`, {
        method: "POST",
      });

      const res = await fetch(`/api/employer/strike/${userData._id}`);
      const { strikes } = await res.json();

      if (strikes >= 3) {
        alert(
          "This job post appears fraudulent. You have exceeded the maximum number of attempts. Contact support to continue posting."
        );
        return;
      } else {
        alert(
          `This job appears suspicious. Attempt ${strikes}/3. Please revise your post.`
        );
        return;
      }
    }

    // Proceed to post the job (if not fraudulent)
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(processedFormData),
    });

    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || "Failed to post job");

    setJobs((prev) => [responseData, ...prev]);
    setShowModal(false);
    setFormData({
      title: "",
      description: "",
      location: "",
      salaryRange: "",
      type: "Full-time",
      deadline: "",
      requirements: "",
      responsibilities: "",
      isRemote: false,
    });

    alert("Job posted successfully!");
  } catch (err) {
    console.error(err);
    alert(`Error: ${err.message}`);
  } finally {
    setSubmitting(false);
  }
};


  useEffect(() => {
    const checkExpiredJobs = () => {
      const now = new Date();
      const expiredJobs = jobs.filter((job) => {
        if (!job.deadline) return false;
        return new Date(job.deadline) < now;
      });

      if (expiredJobs.length > 0) {
        // Option 1: Just filter them out from the UI
        setJobs(
          jobs.filter((job) => {
            if (!job.deadline) return true;
            return new Date(job.deadline) >= now;
          })
        );

        // Option 2: Actually delete them from the database
        expiredJobs.forEach((job) => {
          fetch(`/api/jobs/${job._id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }).catch((err) => console.error("Error deleting expired job:", err));
        });
      }
    };

    // Check every hour
    const interval = setInterval(checkExpiredJobs, 3600000);
    // Initial check
    checkExpiredJobs();

    return () => clearInterval(interval);
  }, [jobs]);

  const handleEditJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const processedFormData = {
        ...formData,
        requirements: formData.requirements
          ? formData.requirements.split("\n").filter((req) => req.trim() !== "")
          : [],
        responsibilities: formData.responsibilities
          ? formData.responsibilities
              .split("\n")
              .filter((resp) => resp.trim() !== "")
          : [],
      };

      const res = await fetch(`/api/jobs/${editingJob._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(processedFormData),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Failed to update job");
      }

      // Update the job in the jobs list
      setJobs(
        jobs.map((job) => (job._id === editingJob._id ? responseData : job))
      );

      setShowModal(false);
      setEditingJob(null);
      alert("Job updated successfully!");
    } catch (err) {
      console.error("Error updating job:", err);
      alert(`Failed to update job: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete job");
      }

      // Remove the job from the jobs list
      setJobs(jobs.filter((job) => job._id !== jobId));
      alert("Job deleted successfully!");
    } catch (err) {
      console.error("Error deleting job:", err);
      alert(`Failed to delete job: ${err.message}`);
    }
  };

  const userName = userData?.name || session?.user?.name || "Employer";
  const userImage =
    userData?.userImage || session?.user?.image || "/user-avatar.png";
  const companyName = employerData?.companyName || "Your Company";
  const websiteUrl = employerData?.websiteUrl || "Your Company website Url";

  if (loading && !userData) {
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
                href="/Empprofile"
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
            {/* <a
              href="../Empmessenger"
              className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium"
            >
              Messenger
            </a> */}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 bg-[url('/dashboard.png')] bg-cover md:p-8">
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

        {/* Profile Status Alert */}
        {!employerData && userData && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <p className="font-bold">Complete Your Profile</p>
            <p>
              You need to complete your employer profile before posting jobs.
            </p>
            <button
              onClick={() => router.push("/Empprofile")}
              className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Complete Profile
            </button>
          </div>
        )}

        {/* Job Listings & Post Job Button */}
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-primary">Your Job Posts</h2>
            <button
              onClick={() => setShowModal(true)}
              disabled={!employerData}
              className={`px-4 py-2 rounded-lg transition ${
                employerData
                  ? "bg-cyan-800 text-white hover:bg-secondary"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
            >
              Post New Job
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-primary">Loading jobs...</p>
            </div>
          ) : jobs.length > 0 ? (
            <ul className="space-y-4">
              {jobs.map((job, index) => (
                <li
                  key={job._id || index}
                  className="bg-white/30 backdrop-blur-lg p-4 rounded-lg shadow border hover:shadow-xl transition cursor-pointer"
                  onClick={() =>
                    setSelectedJob(selectedJob?._id === job._id ? null : job)
                  }
                >
                  <div className="flex bg-white/10 justify-between items-start">
                    <div className="">
                      <h3 className="text-xl font-semibold text-secondary">
                        {job.title}
                      </h3>
                      <p className="text-md text-primary justify-between mt-2 line-clamp-2">
                        Location: {job.location}
                        <br />
                        Company: {companyName}
                      </p>
                      <p className="text-md text-primary mt-2 line-clamp-2">
                        Salary: {job.salaryRange || "Not Provided"}
                      </p>
                      <p className="text-sm text-primary mt-2 line-clamp-2">
                        {job.description}
                      </p>
                    </div>

                    {selectedJob?._id === job._id && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingJob(job);
                            setFormData({
                              title: job.title,
                              description: job.description,
                              location: job.location,
                              salaryRange: job.salaryRange,
                              type: job.type,
                              deadline: job.deadline,
                              requirements: job.requirements?.join("\n") || "",
                              responsibilities:
                                job.responsibilities?.join("\n") || "",
                              isRemote: job.isRemote || false,
                            });
                            setShowModal(true);
                          }}
                          className="text-md px-4 text-white bg-cyan-700 hover:bg-cyan-600 py-1 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJob(job._id);
                          }}
                          className="text-sm bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {selectedJob?._id === job._id && (
                    <div className="mt-3 space-y-3">
                      <div className="text-sm text-primary">
                        <h4 className="font-medium">Full Description:</h4>
                        <p className="mt-1">{job.description}</p>
                        <p className="mt-1 font-medium">
                          Website:{" "}
                          <a
                            href={websiteUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {websiteUrl || "website Url"}
                          </a>
                        </p>
                      </div>

                      {job.requirements?.length > 0 && (
                        <div>
                          <h4 className="font-medium">Requirements:</h4>
                          <ul className="list-disc pl-5 mt-1">
                            {job.requirements.map((req, i) => (
                              <li key={i}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {job.responsibilities?.length > 0 && (
                        <div>
                          <h4 className="font-medium">Responsibilities:</h4>
                          <ul className="list-disc pl-5 mt-1">
                            {job.responsibilities.map((resp, i) => (
                              <li key={i}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                You haven't posted any jobs yet.
              </p>
              {employerData && (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-cyan-800 text-white px-6 py-2 rounded-lg hover:bg-secondary transition"
                >
                  Post Your First Job
                </button>
              )}
            </div>
          )}
        </div>

        {/* Job Posting Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-xl max-h-[90vh] relative flex flex-col">
              <div className="p-6 pb-4 border-b flex-shrink-0">
                <button
                  onClick={() => {
                    setShowModal(false),
                      setEditingJob(null),
                      setFormData({
                        title: "",
                        description: "",
                        location: "",
                        salaryRange: "",
                        type: "Full-time",
                        deadline: "",
                        requirements: "",
                        responsibilities: "",
                        isRemote: false,
                      });
                  }}
                  className="absolute top-3 right-3 text-gray-600 hover:text-red-600 z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-primary pr-8">
                  Post a New Job
                </h2>

                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    Posting as:{" "}
                    <span className="font-semibold text-gray-800">
                      {userName}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Company:{" "}
                    <span className="font-semibold text-gray-800">
                      {companyName}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6">
                <form
                  id="job-form"
                  onSubmit={handleJobSubmit}
                  className="space-y-4 py-4"
                >
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />

                  <textarea
                    placeholder="Job Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                    rows={4}
                    required
                  />

                  <input
                    type="text"
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Salary Range (optional)"
                    value={formData.salaryRange}
                    onChange={(e) =>
                      setFormData({ ...formData, salaryRange: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />

                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requirements (optional)
                    </label>
                    <textarea
                      placeholder="Enter each requirement on a new line"
                      value={formData.requirements}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requirements: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate each requirement with a new line
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsibilities (optional)
                    </label>
                    <textarea
                      placeholder="Enter each responsibility on a new line"
                      value={formData.responsibilities}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          responsibilities: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate each responsibility with a new line
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Application Deadline (optional)
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isRemote}
                      onChange={(e) =>
                        setFormData({ ...formData, isRemote: e.target.checked })
                      }
                      className="rounded-sm bg-cyan-700 mt-1 h-4"
                    />
                    <span className="text-sm text-primary">
                      Remote work available
                    </span>
                  </label>
                </form>
              </div>

              <div className="p-6 pt-4 border-t flex-shrink-0">
                <button
                  type="submit"
                  form="job-form"
                  disabled={submitting}
                  className={`w-full py-3 rounded-md font-medium transition-colors ${
                    submitting
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-cyan-700 text-white hover:bg-cyan-600"
                  }`}
                >
                  {submitting
                    ? editingJob
                      ? "Updating Job..."
                      : "Posting Job..."
                    : editingJob
                    ? "Update Job"
                    : "Submit Job"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
