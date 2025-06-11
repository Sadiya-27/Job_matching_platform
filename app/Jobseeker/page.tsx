'use client';

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Jobseeker() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

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

  const userName = userData?.name || session?.user?.name || "User";
  const userImage = userData?.image || session?.user?.image || "/user-avatar.png";

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
      <main className="flex-1 p-4 bg-[url('/banner.png')] bg-cover md:p-8">
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

        {/* Filters */}
        <div className="mb-4">
          <div className="flex text-primary flex-wrap gap-2 text-sm">
            <span className="px-3 py-1 shadow-lg  bg-accent rounded-full">Design</span>
            <span className="px-3 py-1 bg-accent shadow-lg rounded-full">Regular</span>
            <span className="px-3 py-1 bg-accent shadow-lg rounded-full">Full time</span>
            <span className="px-3 py-1 bg-accent shadow-lg rounded-full">8-12k</span>
          </div>
        </div>

        {/* Job Cards */}
        <div className="space-y-4">
          {[
            { title: "UX Designer", company: "Dropbox", location: "Martwzawa", salary: "8.8 – 13.7k PLN", days: "2 days ago" },
            { title: "Product Designer", company: "Twitch", location: "Wroclaw", salary: "8.2 – 12.5k PLN", days: "2 days ago" },
            { title: "UX/UI Designer", company: "Google", location: "Martwzawa", salary: "7.5 – 12.5k PLN", days: "2 days ago" }
          ].map((job, index) => (
            <div key={index} className="p-4 border rounded-lg bg-white/50 backdrop-blur-lg shadow-sm hover:shadow-lg transition">
              <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-2">
                <div>
                  <h3 className="font-bold text-lg">{job.title}</h3>
                  <p className="text-sm text-gray-500">{job.company} • {job.location}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="font-semibold">{job.salary}</p>
                  <p className="text-sm text-gray-400">{job.days}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
