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
  const userImage = userData?.userImage || session?.user?.image || "/user-avatar.png";

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
              <a href="/empSettings" className="block px-4 py-2 text-primary hover:bg-cyan-300">Settings</a>
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
      <main className="flex-1 p-4 bg-[url('/dashboard.png')] bg-cover md:p-8">
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
                <a href="/empSettings" className="block px-4 py-2 text-primary hover:bg-accent hover:rounded-lg hover:shadow-lg">Settings</a>
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

        {/* Applicants chating with*/}
        {/* Messenger Section */}
<div className="bg-white/50 backdrop-blur-lg rounded-xl shadow-2xl h-[80vh] overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Left Panel: Applicant List */}
  <div className="col-span-1 bg-white/50 p-4 overflow-y-auto">
    <h3 className="text-lg font-semibold mb-4 text-primary">Chat with Applicants</h3>
    <ul className="space-y-3">
      {/* Replace with dynamic applicant list */}
      {["Alice Johnson", "Ravi Kumar", "Emily Zhang"].map((applicant, idx) => (
        <li
          key={idx}
          className="cursor-pointer flex items-center gap-3 p-2 rounded-lg hover:bg-accent hover:text-primary transition"
        >
          <img
            src={`/avatars/user${idx + 1}.png`}
            alt={applicant}
            className="w-10 h-10 rounded-full border-2"
          />
          <span className="font-medium">{applicant}</span>
        </li>
      ))}
    </ul>
  </div>

  {/* Right Panel: Chat Window */}
  <div className="col-span-2 flex flex-col bg-white/50 p-4 rounded-lg shadow-inner">
    <div className="border-b pb-2 mb-4">
      <h4 className="text-lg font-semibold text-primary">Chat with Alice Johnson</h4>
    </div>

    {/* Chat messages */}
    <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-2">
      <div className="flex flex-col items-start">
        <div className="bg-gray-200 text-sm px-4 py-2 rounded-xl max-w-xs">
          Hello, I’m interested in the Frontend Developer role.
        </div>
        <span className="text-xs text-primary mt-1">May 15, 10:12 AM</span>
      </div>
      <div className="flex flex-col items-end">
        <div className="bg-accent text-white text-sm px-4 py-2 rounded-xl max-w-xs">
          Thanks for applying! Can you share your portfolio?
        </div>
        <span className="text-xs text-primary mt-1">May 15, 10:15 AM</span>
      </div>
    </div>

    {/* Input box */}
    <div className="flex items-center border-t pt-2">
      <input
        type="text"
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 rounded-lg border bg-white mr-2 shadow"
      />
      <button className="bg-accent text-white px-4 py-2 rounded-lg shadow hover:bg-primary transition">
        Send
      </button>
    </div>
  </div>
</div>


        {/* chat */}
        
      </main>
    </div>
  );
}
