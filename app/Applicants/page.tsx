'use client';

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !(dropdownRef.current as any).contains(e.target)) {
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

  const userName = userData?.name || session?.user?.name || "Employer";
  const userImage = userData?.image || session?.user?.image || "/user-avatar.png";

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
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Image src="/logo.png" alt="Logo" width={30} height={30} />
          <span className="text-xl font-semibold text-secondary">JobLinker</span>
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
              <a href="../Empprofile" className="block px-4 py-2 text-primary hover:bg-cyan-300">My Profile</a>
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
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
            <h1 className="text-2xl font-semibold ml-2 text-secondary">JobLinker</h1>
          </div>
          <nav className="space-y-4 text-primary">
            <a href="../Employer" className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium">Dashboard</a>
            <a href="../Postjob" className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium">Post Jobs</a>
            <a href="../Applicants" className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium">Applicants</a>
            <a href="../Empschedule" className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium">Schedule</a>
            <a href="../Empmessenger" className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium">Messenger</a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 bg-[url('/applicants.png')] bg-no-repeat bg-center bg-contain  md:p-8">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-6 relative">
          <input
            type="text"
            placeholder="Search (Ctrl + Q)"
            className="w-1/2 px-4 py-2 bg-white/50 backdrop-blur-lg text-primary shadow-lg rounded-lg"
          />
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
              <span className="font-semibold text-primary mr-2">{userName}</span>
              <img src={userImage} alt="User" className="w-8 h-8 rounded-full border-2 cursor-pointer" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 font-semibold px-4 py-3 w-48 bg-white rounded-md shadow-lg z-50">
                <a href="/Empprofile" className="block px-4 py-2 text-primary hover:bg-accent hover:rounded-lg hover:shadow-lg">My Profile</a>
                <a href="/settings" className="block px-4 py-2 text-primary hover:bg-accent hover:rounded-lg hover:shadow-lg">Settings</a>
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

        {/* filters */}
        {/* Filters */}
<div className="mb-6 space-x-3 flex flex-wrap">
  {["All", "Frontend", "Backend", "Design", "Remote", "Mumbai"].map((filter, index) => (
    <button
      key={index}
      className="px-4 py-2 bg-accent text-sm rounded-full shadow-sm font-semibold text-primary hover:bg-accent hover:shadow-lg transition"
    >
      {filter}
    </button>
  ))}
</div>

{/* Applicants */}
<section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
  {[
    {
      name: "Aarav Shah",
      role: "Frontend Developer",
      location: "Remote",
      resume: "#",
      appliedAt: "2025-05-14"
    },
    {
      name: "Isha Kapoor",
      role: "UI/UX Designer",
      location: "Bangalore",
      resume: "#",
      appliedAt: "2025-05-13"
    },
    {
      name: "Rohan Mehta",
      role: "Backend Developer",
      location: "Mumbai",
      resume: "#",
      appliedAt: "2025-05-12"
    }
  ].map((applicant, index) => (
    <div
      key={index}
      className="bg-white/50 backdrop-blur-md p-4 rounded-xl shadow-md hover:shadow-xl transition"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-secondary">{applicant.name}</h3>
        <span className="text-sm text-gray-600">{applicant.appliedAt}</span>
      </div>
      <p className="text-primary font-medium">{applicant.role}</p>
      <p className="text-sm text-gray-700 mb-2">{applicant.location}</p>
      <button
  onClick={() => window.open(applicant.resume, "_blank")}
  className="mt-3 px-4 py-2 bg-secondary text-white rounded-md font-semibold hover:bg-accent transition"
>
  View Resume
</button>
    </div>
  ))}
</section>


        
        
      </main>
    </div>
  );
}
