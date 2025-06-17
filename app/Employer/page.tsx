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
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const [employerId, setEmployerId] = useState("");
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    if (!jobs) return;

    const filtered = jobs.filter((job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredJobs(filtered);
  }, [searchTerm, jobs]);

  useEffect(() => {
  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setJobs(data); // make sure data is an array of jobs
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  if (userData) {
    fetchJobs();
  }
}, [userData]);


  const fetchApplicationCount = async (jobId: string): Promise<number> => {
    try {
      const res = await fetch("/api/employer/jobsWithCounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch count");
      return data.count;
    } catch (err) {
      console.error("Error fetching application count:", err);
      return 0;
    }
  };

  useEffect(() => {
    const loadCounts = async () => {
      const newCounts: { [key: string]: number } = {};
      for (const job of jobs) {
        const count = await fetchApplicationCount(job._id);
        newCounts[job._id] = count;
      }
      setCounts(newCounts);
    };

    if (jobs.length > 0) {
      loadCounts();
    }
  }, [jobs]);

  const handleJobStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/jobs/UpdateStatus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId, status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update job status");

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job._id === jobId ? { ...job, status: newStatus } : job
        )
      );
    } catch (err) {
      console.error("Error updating job status:", err);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "q") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const userName = userData?.name || session?.user?.name || "Employer";
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
      <main className="flex-1 p-4 bg-[url('/dashboard.png')] bg-cover md:p-8">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-6 relative">
          <input
            type="text"
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search (Ctrl + Q)"
            className="w-full md:w-1/2 px-4 py-2 bg-white/50 backdrop-blur-lg text-primary shadow-lg rounded-lg"
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
                  href="/settings"
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

        {/* Welcome Message */}
        <div className="bg-white/30 backdrop-blur-lg px-4 py-3 rounded-xl shadow-xl flex items-center">
          <Image src="/mascot.png" height={100} width={100} alt="mascot" />
          <div className="font-semibold text-xl md:text-2xl text-primary ml-4">
            Welcome back, {userName}!
          </div>
        </div>

        {/* Jobs Posted Section */}
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
                    onClick={() => router.push("/Empschedule")}
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
      </main>
    </div>
  );
}
