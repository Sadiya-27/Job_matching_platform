"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@/app/styles/custom-callender.css"; // Create this file if not already
import { Button } from "@/components/ui/button";

export default function Employer() {
  const router = useRouter();
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [appLoading, setAppLoading] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);

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
      } catch (err: any) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as any).contains(e.target)
      ) {
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

  const [employerId, setEmployerId] = useState("");

  useEffect(() => {
    const fetchEmployer = async () => {
      if (userData?._id) {
        try {
          const res = await fetch(`/api/employer/${userData._id}`);
          const data = await res.json();
          setEmployerId(data.employer._id);
        } catch (err) {
          console.error("Failed to fetch employer:", err);
        }
      }
    };

    fetchEmployer();
  }, [userData]);

  const fetchApplicationsForJob = async (jobId: string) => {
    setAppLoading(true);
    try {
      console.log("Sending request to fetch applications for:", jobId);

      const res = await fetch(`/api/employer/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employerId, jobId }),
      });

      const data = await res.json();
      console.log("Response status:", res.status);
      console.log("Applications response data:", data);

      if (res.status === 403) {
        alert(
          data.error || "You are not authorized to view these applications."
        );
        setApplications([]);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch applications");
      }

      setApplications(data.applications);
      console.log(data.applications);
      setSelectedJob(jobId);
    } catch (err) {
      console.error("Failed to fetch applications", err);
      alert("Something went wrong while fetching applications.");
    } finally {
      setAppLoading(false);
    }
  };

  const userName = userData?.name || session?.user?.name || "Employer";
  const userImage =
    userData?.userImage || session?.user?.image || "/user-avatar.png";

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch jobs");

        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };

    if (userData) {
      fetchJobs();
    }
  }, [userData]);

  const fetchApplicationCount = async (jobId: string) => {
    try {
      const res = await fetch("/api/employer/jobsWithCounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch application count");
      }

      return data.count; // this is the number of applications for the job
    } catch (err) {
      console.error("Error fetching application count:", err);
      return 0;
    }
  };

  const [counts, setCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    jobs.forEach(async (job: any) => {
      const count = await fetchApplicationCount(job._id);
      setCounts((prev) => ({ ...prev, [job._id]: count }));
    });
  }, [jobs]);

  const [formState, setFormState] = useState<{ [key: string]: any }>({});

  const handleSubmitChanges = async (appId: string) => {
    const data = formState[appId];
    if (!data) return;

    try {
      if (data.status) {
        await handleStatusChange(appId, data.status);
      }
      if (data.interviewDate) {
        await handleDateUpdate(appId, "interviewDate", data.interviewDate);
      }
      if (data.interviewTime) {
        await handleTimeUpdate(appId, "interviewTime", data.interviewTime);
      }
      if (data.interviewLocation) {
        await handleLocationUpdate(
          appId,
          "interviewLocation",
          data.interviewLocation
        );
      }
      if (data.joiningDate) {
        await handleDateUpdate(appId, "joiningDate", data.joiningDate);
      }

      // Refresh UI and clear temp state
      setFormState((prev) => {
        const newState = { ...prev };
        delete newState[appId];
        return newState;
      });
    } catch (err) {
      console.error("Error submitting changes", err);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/application/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updatedApp = await res.json();
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? updatedApp : a))
        );
      }
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  const handleDateUpdate = async (
    appId: string,
    field: "interviewDate" | "joiningDate",
    value: string
  ) => {
    try {
      const res = await fetch(`/api/application/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        const updatedApp = await res.json();
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? updatedApp : a))
        );
      }
    } catch (err) {
      console.error("Error updating date", err);
    }
  };

  const handleTimeUpdate = async (
    appId: string,
    field: "interviewTime",
    value: string
  ) => {
    try {
      const res = await fetch(`/api/application/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (res.ok) {
        const updatedApp = await res.json();
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? updatedApp : a))
        );
      }
    } catch (err) {
      console.error("Error updating interview time", err);
    }
  };

  const handleLocationUpdate = async (
  appId: string,
  field: "interviewLocation",
  value: string
) => {
  try {
    const res = await fetch(`/api/application/${appId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      const updatedApp = await res.json();
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? updatedApp : a))
      );
    }
  } catch (err) {
    console.error("Error updating location", err);
  }
};


  const handleJobStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/jobs/UpdateStatus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId, status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      // Optional: Refresh the job list or update state locally
      setJobs((prevJobs: any[]) =>
        prevJobs.map((job) =>
          job._id === jobId ? { ...job, status: newStatus } : job
        )
      );
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch("/api/employer/schedule", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ employerId }),
        });
        const data = await res.json();
        setSchedule(data.schedule || []);
      } catch (err) {
        console.error("Failed to fetch schedule", err);
      }
    };

    if (employerId) fetchSchedule();
  }, [employerId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "q") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered jobs
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                href="../empSettings"
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
      <main className="flex-1 p-4 bg-[url('/calendar.png')] bg-contain bg-no-repeat bg-center md:p-8">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-6 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by job title (Ctrl + Q)"
            className="w-1/2 px-4 py-2 bg-white/50 backdrop-blur-lg text-primary shadow-lg rounded-lg mb-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Calendar */}
        {/* Calendar Section */}
        <div className="mb-10 bg-white/50 backdrop-blur-lg py-4 px-4 rounded-xl shadow-xl max-w-lg">
  <h2 className="text-xl font-semibold text-primary mb-4">
    Your Schedule
  </h2>

  {schedule.length > 0 ? (
    <ul className="space-y-3 text-sm text-primary">
      {schedule.map((event, idx) => (
        <li key={idx}>
          <strong>
            {new Date(event.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            :
          </strong>{" "}
          {event.title}
          {event.time && (
            <>
              <br />
              <span>
                <strong>Time:</strong> {event.time}
              </span>
            </>
          )}
          {event.location && (
            <>
              <br />
              <span>
                <strong>Location:</strong> {event.location}
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-600">No upcoming events.</p>
  )}
</div>


        {/* events */}
        {/* Jobs Posted Section */}
        <section className="mt-6 bg-white/40 backdrop-blur-lg p-4 md:p-6 rounded-xl shadow-xl text-primary">
          <h2 className="text-xl md:text-2xl font-bold mb-4">
            Jobs You Posted
          </h2>

          {filteredJobs.length === 0 ? (
            <p>No matching jobs found.</p>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map((job: any) => (
                <div
                  key={job._id}
                  className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-all"
                >
                  <div
                    onClick={() => fetchApplicationsForJob(job._id)}
                    className="cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <p className="text-sm text-gray-600">
                      Posted on: {new Date(job.createdAt).toDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Applicants:{" "}
                      <span className="font-semibold">
                        {counts[job._id] || 0}
                      </span>
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs text-white ${
                        job.status === "Open"
                          ? "bg-green-500"
                          : job.status === "Interviewing"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    >
                      {job.status || "Closed"}
                    </span>

                    {/* Status Update Dropdown */}
                    <select
                      className="ml-auto border text-sm rounded px-2 py-1 bg-white"
                      value={job.status}
                      onChange={(e) =>
                        handleJobStatusChange(job._id, e.target.value)
                      }
                    >
                      <option value="Open">Open</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Applications Section */}
        {selectedJob && (
          <section className="mt-8 bg-white/50 backdrop-blur-lg p-4 md:p-6 rounded-xl shadow-xl text-primary">
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              Applications for Selected Job
            </h2>

            {appLoading ? (
              <p>Loading applications...</p>
            ) : Array.isArray(applications) && applications.length > 0 ? (
              <ul className="space-y-4">
                {applications.map((app: any) => {
                  const isSelected = selectedApplicantId === app._id;
                  return (
                    <li
                      key={app._id}
                      onClick={() => setSelectedApplicantId(app._id)}
                      className={`p-4 bg-white text-primary backdrop-blur-lg rounded-lg shadow cursor-pointer transition-all ${
                        isSelected ? "ring-2 ring-primary" : "hover:bg-white/80"
                      }`}
                    >
                      <p>
                        <strong>Name:</strong>{" "}
                        {app.name || app.jobseekerProfile?.name || "N/A"}
                      </p>
                      <p className="mb-2">
                        <strong>Email:</strong>{" "}
                        {app.email || app.jobseekerProfile?.email || "N/A"}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span
                          className={`font-semibold px-2 py-1 rounded ${
                            app.status === "joined"
                              ? "bg-green-100 text-green-700"
                              : app.status === "accepted"
                              ? "bg-blue-100 text-blue-700"
                              : app.status === "called for interview"
                              ? "bg-yellow-100 text-yellow-800"
                              : app.status === "under review"
                              ? "bg-gray-100 text-gray-700"
                              : app.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-50 text-gray-500"
                          }`}
                        >
                          {app.status || "N/A"}
                        </span>
                      </p>
                      {["joined", "accepted"].includes(app.status) &&
                        app.joiningDate && (
                          <p className="mt-2">
                            <strong>Joining Date:</strong>{" "}
                            {new Date(app.joiningDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        )}

                      {app.status === "called for interview" &&
                        app.interviewDate && (
                          <div className="mt-2 text-primary space-y-1">
                            <p>
                              <strong>Interview Date:</strong>{" "}
                              {new Date(app.interviewDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>
                            {app.interviewTime && (
                              <p>
                                <strong>Interview Time:</strong>{" "}
                                {app.interviewTime}
                              </p>
                            )}
                            {app.interviewLocation && (
                              <p>
                                <strong>Location:</strong>{" "}
                                {app.interviewLocation}
                              </p>
                            )}
                          </div>
                        )}

                      {app.appliedAt && (
                        <p className="mt-2">
                          <strong>Applied At:</strong>{" "}
                          {new Date(app.appliedAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      )}

                      {/* Conditionally show full details */}
                      {isSelected && (
                        <>
                          <p>
                            <strong>Title:</strong>{" "}
                            {app.jobseekerProfile?.currentJobTitle ||
                              "Not provided"}
                          </p>
                          <p>
                            <strong>Skills:</strong>{" "}
                            {Array.isArray(app.jobseekerProfile?.skills)
                              ? app.jobseekerProfile.skills.join(", ")
                              : "Not specified"}
                          </p>

                          {/* Experience */}
                          <div>
                            <strong>Experience:</strong>
                            {Array.isArray(app.jobseekerProfile?.experience) ? (
                              app.jobseekerProfile.experience.map(
                                (exp: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="mt-2 border-t border-gray-300 pt-2"
                                  >
                                    <p>
                                      <strong>Job Title:</strong> {exp.jobTitle}
                                    </p>
                                    <p>
                                      <strong>Company:</strong>{" "}
                                      {exp.companyName}
                                    </p>
                                    <p>
                                      <strong>Location:</strong> {exp.location}
                                    </p>
                                    <p>
                                      <strong>From:</strong>{" "}
                                      {exp.startDate
                                        ? new Date(
                                            exp.startDate
                                          ).toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                          })
                                        : "N/A"}
                                    </p>
                                    <p>
                                      <strong>To:</strong>{" "}
                                      {exp.isCurrentJob
                                        ? "Present"
                                        : exp.endDate
                                        ? new Date(
                                            exp.endDate
                                          ).toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                          })
                                        : "N/A"}
                                    </p>
                                    {Array.isArray(exp.achievements) &&
                                      exp.achievements.length > 0 && (
                                        <>
                                          <strong>Achievements:</strong>
                                          <ul className="list-disc list-inside">
                                            {exp.achievements.map(
                                              (ach: string, i: number) => (
                                                <li key={i}>{ach}</li>
                                              )
                                            )}
                                          </ul>
                                        </>
                                      )}
                                    <p>
                                      <strong>Resume:</strong> {app.resumeLink}
                                    </p>
                                  </div>
                                )
                              )
                            ) : (
                              <p>Not mentioned</p>
                            )}
                          </div>

                          {/* Education */}
                          <div>
                            <strong>Education:</strong>
                            {Array.isArray(app.jobseekerProfile?.education) ? (
                              app.jobseekerProfile.education.map(
                                (edu: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="mt-2 border-t border-gray-300 pt-2"
                                  >
                                    <p>
                                      <strong>Degree:</strong> {edu.degree}
                                    </p>
                                    <p>
                                      <strong>Institution:</strong>{" "}
                                      {edu.institution}
                                    </p>
                                    <p>
                                      <strong>Year:</strong>{" "}
                                      {edu.endDate
                                        ? new Date(
                                            edu.endDate
                                          ).toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                          })
                                        : "Currently pursuing"}
                                    </p>
                                  </div>
                                )
                              )
                            ) : (
                              <p>Not mentioned</p>
                            )}
                          </div>

                          {/* Action Section */}
                          <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">
                              Update Status:
                            </label>
                            <select
                              className="w-full p-2 border rounded"
                              value={formState[app._id]?.status || app.status}
                              onChange={(e) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  [app._id]: {
                                    ...prev[app._id],
                                    status: e.target.value,
                                  },
                                }))
                              }
                            >
                              <option value="submitted">Submitted</option>
                              <option value="under review">Under Review</option>
                              <option value="called for interview">
                                Called for Interview
                              </option>
                              <option value="accepted">Accepted</option>
                              <option value="rejected">Rejected</option>
                              <option value="joined">Joined</option>
                            </select>

                            {(formState[app._id]?.status || app.status) ===
                              "called for interview" && (
                              <div className="mt-2 space-y-2">
                                {/* Interview Date */}
                                <div>
                                  <label className="block text-sm font-medium">
                                    Interview Date:
                                  </label>
                                  <input
                                    type="date"
                                    className="w-full p-2 border rounded"
                                    value={
                                      formState[app._id]?.interviewDate ||
                                      (app.interviewDate
                                        ? app.interviewDate.split("T")[0]
                                        : "")
                                    }
                                    onChange={(e) =>
                                      setFormState((prev) => ({
                                        ...prev,
                                        [app._id]: {
                                          ...prev[app._id],
                                          interviewDate: e.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </div>

                                {/* Interview Time */}
                                <div>
                                  <label className="block text-sm font-medium">
                                    Interview Time:
                                  </label>
                                  <input
                                    type="time"
                                    className="w-full p-2 border rounded"
                                    value={
                                      formState[app._id]?.interviewTime ||
                                      app.interviewTime ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      setFormState((prev) => ({
                                        ...prev,
                                        [app._id]: {
                                          ...prev[app._id],
                                          interviewTime: e.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </div>

                                {/* Interview Location */}
                                <div>
                                  <label className="block text-sm font-medium">
                                    Interview Location:
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    placeholder="e.g., Google Meet, TechPark Office..."
                                    value={
                                      formState[app._id]?.interviewLocation ||
                                      app.interviewLocation ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      setFormState((prev) => ({
                                        ...prev,
                                        [app._id]: {
                                          ...prev[app._id],
                                          interviewLocation: e.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                            )}

                            {(formState[app._id]?.status || app.status) ===
                              "accepted" && (
                              <div className="mt-2">
                                <label className="block text-sm font-medium">
                                  Joining Date:
                                </label>
                                <input
                                  type="date"
                                  className="w-full p-2 border rounded"
                                  value={
                                    formState[app._id]?.joiningDate ||
                                    app.joiningDate?.split("T")[0] ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    setFormState((prev) => ({
                                      ...prev,
                                      [app._id]: {
                                        ...prev[app._id],
                                        joiningDate: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </div>
                            )}

                            <Button
                              onClick={() => handleSubmitChanges(app._id)}
                              className="mt-4 px-4 py-2"
                            >
                              Submit Changes
                            </Button>
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No applications received yet.</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
