'use client';

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import '@/app/styles/custom-callender.css'; // Create this file if not already


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
      <main className="flex-1 p-4 bg-[url('/calendar.png')] bg-contain bg-no-repeat bg-center md:p-8">
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

        {/* Calendar */}
        {/* Calendar Section */}
<div className="mb-10 bg-white/50 backdrop-blur-lg py-4 px-4 rounded-xl shadow-xl max-w-lg">
  <h2 className="text-xl font-semibold text-primary mb-4">Your Schedule</h2>
  <div className="flex justify-center items-center">
    <Calendar
      tileContent={({ date }) => {
        // Mock events — replace this with dynamic data later
        const events: Record<string, { icon: string; label: string }> = {
          "2025-05-20": {
            icon: "📅",
            label: "Interview at Google HQ — 10:00 AM",
          },
          "2025-05-25": {
            icon: "🎯",
            label: "National Hackathon — Team ShadowCoders",
          },
          "2025-06-01": {
            icon: "💼",
            label: "Final Interview with Adobe — Zoom",
          },
        };

        const key = date.toISOString().split("T")[0];
        const event = events[key];

        return event ? (
          <div className="relative group w-full h-full flex items-center justify-center">
            <span className="text-lg">{event.icon}</span>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white text-primary text-sm px-4 py-2 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[100] w-max max-w-[250px] text-center pointer-events-none">
              {event.label}
            </div>
          </div>
        ) : null;
      }}
    />
  </div>
</div>


        

        {/* events */}
        {/* Jobs Posted Section */}
<section className="mt-6 bg-white/40 backdrop-blur-lg p-4 md:p-6 rounded-xl shadow-xl text-primary">
  <h2 className="text-xl md:text-2xl font-bold mb-4">Jobs You Posted</h2>

  {/* Replace this array with dynamic job post data from your backend */}
  <div className="space-y-4">
    <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-all">
      <h3 className="text-lg font-semibold">Frontend Developer at TechSpark</h3>
      <p className="text-sm text-gray-600">Posted on: May 12, 2025</p>
      <p className="text-sm text-gray-600">Applicants: <span className="font-semibold">12</span></p>
      <span className="inline-block mt-2 px-3 py-1 bg-green-500 text-white rounded-full text-xs">Open</span>
    </div>

    <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-all">
      <h3 className="text-lg font-semibold">UI/UX Designer at Creatix</h3>
      <p className="text-sm text-gray-600">Posted on: May 5, 2025</p>
      <p className="text-sm text-gray-600">Applicants: <span className="font-semibold">8</span></p>
      <span className="inline-block mt-2 px-3 py-1 bg-yellow-500 text-white rounded-full text-xs">Interviewing</span>
    </div>

    <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-all">
      <h3 className="text-lg font-semibold">Backend Engineer at AlphaByte</h3>
      <p className="text-sm text-gray-600">Posted on: April 22, 2025</p>
      <p className="text-sm text-gray-600">Applicants: <span className="font-semibold">5</span></p>
      <span className="inline-block mt-2 px-3 py-1 bg-red-500 text-white rounded-full text-xs">Closed</span>
    </div>
  </div>
</section>

        
      </main>
    </div>
  );
}
