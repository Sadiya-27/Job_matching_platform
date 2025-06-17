'use client';

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
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const endpoint = token ? "/api/user/manual" : "/api/user/me";
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
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
      if (dropdownRef.current && !(dropdownRef.current as any).contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleRevokeApplication = async (applicationId: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to revoke this application?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/application/${applicationId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to revoke application.");
      }

      // Remove it from state
      setApplications((prev) =>
        prev.filter((app) => app._id !== applicationId)
      );
    } catch (err) {
      console.error(err);
      alert("Error while revoking the application.");
    }
  };

  useEffect(() => {
    if (!userData || !userData._id) return;

    const fetchApplications = async () => {
      try {
        const res = await fetch(`/api/jobseeker/applications/${userData._id}`);
        const data = await res.json();
        setApplications(data);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      }
    };

    fetchApplications();
  }, [userData]); // Run only when user is loaded

  const userName = userData?.name || session?.user?.name || "User";
  const userImage = userData?.userImage || session?.user?.image || "/user-avatar.png";

  if (loading) {
    return (
      <div className="h-screen w-screen bg-muted text-2xl flex items-center justify-center text-primary font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-col md:flex-row min-h-screen bg-muted  text-gray-800">
      {/* Mobile Header */}
      <div className="md:hidden flex shadow-lg items-center justify-between p-4 border-b bg-muted">
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Image src="/logo.png" alt="Logo" width={30} height={30} className="" />
          <span className="text-xl font-semibold text-secondary">JobLinker</span>
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
              <a href="../profile" className="block px-4 py-2 text-primary hover:bg-cyan-300">My Profile</a>
              <a href="/settings" className="block px-4 py-2 text-primary hover:bg-cyan-300">Settings</a>
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
      <aside className={`w-full md:w-64 bg-white/30 shadow-xl border-r rounded-xl p-4 md:p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "block" : "hidden"} md:block`}>
        <div>
          <div className="hidden md:flex items-center mb-8">
            <Image src="/logo.png" alt="Logo" width={50} height={50} className="mr-2" />
            <h1 className="text-2xl font-semibold text-secondary">JobLinker</h1>
          </div>
          <nav className="space-y-4 text-primary">
            <a href="../Jobdashboard" className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium">Dashboard</a>
            <a href="../Jobseeker" className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium">Job Board</a>
            <a href="../Jobschedule" className="block px-3 py-2 rounded-lg font-medium  hover:bg-accent hover:shadow-xl">Schedule</a>
            <a href="../Jobmessenger" className="block px-3 py-2 rounded-lg font-medium  hover:bg-accent hover:shadow-xl">Messenger</a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 bg-[url('/dashboard.png')] bg-cover md:p-8">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-6 relative">
          <input
            type="text"
            placeholder="Quick Search (Ctrl + Q)"
            className="w-1/2 px-4 py-2 bg-white/50 backdrop-blur-lg text-primary shadow-lg rounded-lg"
          />
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
              <span className="font-semibold text-primary mr-2">{userName}</span>
              <img src={userImage} alt="User" className="w-8 h-8 rounded-full border-2 cursor-pointer" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 px-4 py-3 font-semibold w-48 bg-white rounded-md shadow-lg z-50">
                <a href="../profile" className="block px-4 py-2 text-primary hover:bg-accent hover:rounded-lg hover:shadow-lg">My Profile</a>
                <a href="/settings" className="block px-4 py-2 text-primary hover:rounded-lg hover:bg-accent hover:shadow-lg">Settings</a>
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

        {/* Greeting */}
        <div className="bg-white/30 backdrop-blur-lg px-2 md:px-4 py-2 rounded-xl shadow-xl md:mr-5 flex">
            <Image 
                src='/mascot.png'
                height={150}
                width={150}
                alt="mascot"
            />
            <div className="font-semibold flex justify-center text-lg md:text-2xl items-center text-primary mr-2">
                Welcome {userName}!
            </div>
        </div>

        {/* Jobs applied */}
        <div className="backdrop-blur-lg bg-white/20 p-4 rounded-xl mt-8">

          {applications.length === 0 ? (
            <p>No applications yet.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-all"
                >
                  <h3 className="text-lg font-semibold">
                    {app.jobId?.title || "Job Title"} at{" "}
                    {app.jobId?.employer?.companyName || "Unknown Company"}
                  </h3>

                  <p className="text-sm text-gray-600">
                    Applied on: {new Date(app.appliedAt).toDateString()}
                  </p>

                  <p className="text-sm text-gray-600">
                    Resume:{" "}
                    <a
                      href={app.resumeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Resume
                    </a>
                  </p>

                  {/* Interview Details */}
                  {app.interviewDate && (
                    <p className="text-sm text-gray-600">
                      Interview on: {new Date(app.interviewDate).toDateString()}
                      {app.interviewTime && ` at ${app.interviewTime}`}
                      {app.interviewLocation && ` (${app.interviewLocation})`}
                    </p>
                  )}

                  {/* Joining Details */}
                  {app.joiningDate && (
                    <p className="text-sm text-gray-600">
                      Joining Date: {new Date(app.joiningDate).toDateString()}
                    </p>
                  )}

                  {/* Status Badge */}
                  <span className="inline-block mt-2 px-3 py-1 bg-accent text-white rounded-full text-xs capitalize">
                    {app.status}
                  </span>

                  {/* Revoke Button */}
                  <Button
                    onClick={() => handleRevokeApplication(app._id)}
                    className="ml-4 mt-2 text-sm bg-red-200 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    Revoke Application
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
      
    </div>
    
    </>
  );
}
