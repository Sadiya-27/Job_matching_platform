"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Jobseeker() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [jobsToDisplay, setJobsToDisplay] = useState([]);
  const [recommendationCalled, setRecommendationCalled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [showRecommended, setShowRecommended] = useState(false);

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

  const handleSignOut = () => {
    localStorage.removeItem("token");
    signOut({ callbackUrl: "/sign_up_login" });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as any).contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/JobsPosted");
        const data = await res.json();
        setJobs(data);
        setJobsToDisplay(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };

    fetchJobs();
  }, []);

  const getMatchedSkills = (job, profile) => {
    const profileSkills = (profile?.skills || []).map((s) =>
      s.toLowerCase().trim()
    );
    return (job?.requirements || []).filter((req) =>
      profileSkills.includes(req.toLowerCase().trim())
    );
  };

  const getRecommendedJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ml/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: userData, jobs }),
      });

      const data = await res.json();
      const sorted = (data.jobs || []).sort((a, b) => b.score - a.score);
      setRecommendedJobs(sorted); // save separately
      setShowRecommended(true); // flag to show
    } catch (error) {
      console.error("Failed to get recommendations", error);
    } finally {
      setLoading(false);
    }
  };

  const userName = userData?.name || session?.user?.name || "User";
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
    <div className="flex flex-col md:flex-row min-h-screen bg-muted  text-gray-800">
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
          <Image
            src="/logo.png"
            alt="Logo"
            width={30}
            height={30}
            className=""
          />
          <span className="text-xl font-semibold text-secondary">
            JobLinker
          </span>
        </div>
        <div className="relative" ref={dropdownRef}>
          <img
            src={userImage}
            alt="User"
            className="w-8 h-8 rounded-full border-2 text-primary font-semibold cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
              <a
                href="../profile"
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
        className={`w-full md:w-64 bg-white/30 shadow-xl border-r rounded-xl p-4 md:p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "block" : "hidden"} md:block`}
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
              className="block px-3 py-2 rounded-lg font-medium  hover:bg-accent hover:shadow-xl"
            >
              Schedule
            </a>
            <a
              href="../Jobmessenger"
              className="block px-3 py-2 rounded-lg font-medium  hover:bg-accent hover:shadow-xl"
            >
              Messenger
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 bg-[url('/banner.png')] bg-cover md:p-8">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-6 relative">
          <input
            type="text"
            placeholder="Search by Job Title (Ctrl + Q)"
            className="w-1/2 px-4 py-2 bg-white/50 backdrop-blur-lg text-primary shadow-lg rounded-lg"
            value={searchQuery}
            onChange={(e) => {
              const query = e.target.value.toLowerCase();
              setSearchQuery(query);

              // Filter jobs by title
              const filtered = jobs.filter((job) =>
                job.title?.toLowerCase().includes(query)
              );
              setJobsToDisplay(filtered);
              setRecommendationCalled(false); // reset if a new search is made
            }}
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
              <div className="absolute right-0 mt-2 px-4 py-3 font-semibold w-48 bg-white rounded-md shadow-lg z-50">
                <a
                  href="../profile"
                  className="block px-4 py-2 text-primary hover:bg-accent hover:rounded-lg hover:shadow-lg"
                >
                  My Profile
                </a>
                <a
                  href="../settings"
                  className="block px-4 py-2 text-primary hover:rounded-lg hover:bg-accent hover:shadow-lg"
                >
                  Settings
                </a>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 hover:shadow-lg hover:rounded-lg text-primary hover:bg-accent"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5 space-x-2">
          <Button onClick={getRecommendedJobs}>Show Recommended Jobs</Button>
          {showRecommended && recommendedJobs.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => {
                setShowRecommended(false);
                setRecommendedJobs([]);
              }}
            >
              Hide Recommendations
            </Button>
          )}

          {recommendationCalled && (
            <Button
              variant="secondary"
              onClick={() => {
                setJobsToDisplay(jobs);
                setRecommendationCalled(false);
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>

          {showRecommended && recommendedJobs.length > 0 && (
          <div className="mt-10 border-t mb-10 pt-6">
            <h2 className="text-xl font-bold text-primary mb-4">
              🎯 Recommended Jobs for You
            </h2>
            <div className="space-y-4">
              {recommendedJobs.map((job, index) => {
                const matchedSkills = getMatchedSkills(job, userData);
                return (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-white/70 backdrop-blur-lg shadow-sm hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-2">
                      <div>
                        <h3 className="font-bold text-lg">{job.title}</h3>
                        <p className="text-sm text-gray-500">
                          {job?.employer?.companyName || "Unknown"} •{" "}
                          {job.location}
                        </p>
                        {typeof job.score === "number" && (
                          <p className="text-sm mt-1 text-green-600 font-medium">
                            Match Score: {(job.score * 100).toFixed(2)}%
                            {job.score > 0.7 && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Top Match
                              </span>
                            )}
                          </p>
                        )}
                        {matchedSkills.length > 0 && (
                          <p className="text-sm mt-1 text-blue-600">
                            Matched Skills: {matchedSkills.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="text-left md:text-right">
                        <p className="font-semibold">
                          {job.salaryRange || "N/A"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                        <Button
                          className="mt-2"
                          onClick={() => {
                            setSelectedJob(job);
                            setShowModal(true);
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Job Cards */}
        
          <div className="space-y-4">
            {jobsToDisplay.length > 0 ? (
              jobsToDisplay.map((job, index) => {
                const matchedSkills = getMatchedSkills(job, userData);
                return (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-white/50 backdrop-blur-lg shadow-sm hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-2">
                      <div>
                        <h3 className="font-bold text-lg">{job.title}</h3>
                        <p className="text-sm text-gray-500">
                          {job?.employer?.companyName || "Unknown"} •{" "}
                          {job.location}
                        </p>
                        {typeof job.score === "number" && (
                          <p className="text-sm mt-1 text-green-600 font-medium">
                            Match Score: {(job.score * 100).toFixed(2)}%
                            {job.score > 0.7 && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Top Match
                              </span>
                            )}
                          </p>
                        )}
                        {matchedSkills.length > 0 && (
                          <p className="text-sm mt-1 text-blue-600">
                            Matched Skills: {matchedSkills.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="text-left md:text-right">
                        <p className="font-semibold">
                          {job.salaryRange || "N/A"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                        <Button
                          className="mt-2"
                          onClick={() => {
                            setSelectedJob(job);
                            setShowModal(true);
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-lg text-primary font-medium">No jobs found.</p>
            )}
          </div>

        

        

        {showModal && selectedJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center text-primary justify-center px-4">
            <div className="bg-white/80 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-xl relative">
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Job Details */}
              <h2 className="text-2xl font-bold mb-2">{selectedJob.title}</h2>

              <div className="flex justify-between items-center mb-1 text-sm text-gray-600">
                <p>
                  • {selectedJob?.employer?.companyName || "Unknown"} •{" "}
                  {selectedJob.location}
                </p>
                <p>
                  {selectedJob.createdAt
                    ? new Date(selectedJob.createdAt).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>

              <p className="text-sm text-gray-600 mb-1">
                • {selectedJob.salaryRange || "Unknown"}
              </p>
              <p className="text-sm text-gray-600 mb-1">• {selectedJob.type}</p>
              <p className="mb-4 text-sm">
                {selectedJob.description || "No description provided."}
              </p>

              {/* Responsibilities */}
              {selectedJob.responsibilities && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-1">Responsibilities</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {selectedJob.responsibilities.map(
                      (item: string, i: number) => (
                        <li key={i}>{item}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {selectedJob.requirements && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-1">Requirements</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {selectedJob.requirements.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="mb-4 text-sm">
                <strong>Last Date to Apply:</strong>{" "}
                {selectedJob.deadline
                  ? new Date(selectedJob.deadline).toLocaleDateString()
                  : "Not given"}
              </p>

              {/* Apply Now Button */}
              <div className="text-right mt-4">
                <Button
                  onClick={() => {
                    router.push(`/apply/${selectedJob._id}`);
                    setShowModal(false);
                  }}
                >
                  Apply Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
