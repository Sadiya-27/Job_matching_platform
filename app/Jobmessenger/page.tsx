'use client';

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '@/app/styles/custom-callender.css'; // Create this file if not already


export default function Jobseeker() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
const [employerResults, setEmployerResults] = useState([]);
const [selectedConversation, setSelectedConversation] = useState(null);


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

  const handleEmployerClick = (employer) => {
  setSelectedConversation({
    id: employer.id, // was employer._id
    name: employer.name,
    email: employer.email,
    photoUrl: employer.photoUrl || "/default-avatar.png",
    role: "employer",
  });
};

useEffect(() => {
  const fetchEmployers = async () => {
    if (searchQuery.length < 2) return;

    try {
      const res = await fetch(`/api/employers/search?email=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Failed to fetch employers");
      const data = await res.json();
      setEmployerResults(data);
    } catch (error) {
      console.error("Employer search error:", error);
      setEmployerResults([]);
    }
  };

  const debounce = setTimeout(fetchEmployers, 400); // debounce

  return () => clearTimeout(debounce);
}, [searchQuery]);



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
              <a href="/profile" className="block px-4 py-2 text-primary hover:bg-cyan-300">My Profile</a>
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
            {/* <a href="../Jobmessenger" className="block px-3 py-2 rounded-lg font-medium  hover:bg-accent hover:shadow-xl">Messenger</a> */}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 bg-[url('/calendar.png')] bg-cover md:p-8">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-6 relative">
          <input
            type="text"
            placeholder="Search employer by email"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/2 px-4 py-2 bg-white/50 backdrop-blur-lg text-primary shadow-lg rounded-lg"
          />
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
              <span className="font-semibold text-primary mr-2">{userName}</span>
              <img src={userImage} alt="User" className="w-8 h-8 rounded-full border-2 cursor-pointer" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 px-4 py-3 font-semibold w-48 bg-white rounded-md shadow-lg z-50">
                <a href="/profile" className="block px-4 py-2 text-primary hover:bg-accent hover:rounded-lg hover:shadow-lg">My Profile</a>
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

        {searchQuery.length >= 2 && employerResults.length > 0 && (
  <div className="absolute mt-2 bg-white border rounded shadow-md w-96 z-50">
    {employerResults.map((employer) => (
      <div
        key={employer.id}
        className="flex items-center gap-3 p-2 hover:bg-accent cursor-pointer"
        onClick={() => {
          setSelectedConversation(employer);
          setEmployerResults([]);
          setSearchQuery("");
        }}
      >
        <img
          src={employer.photoUrl || "/default-avatar.png"}
          alt={employer.name}
          className="w-8 h-8 rounded-full"
        />
        <div className="text-primary font-medium">{employer.name}</div>
        <div className="text-gray-500 text-sm ml-auto">{employer.email}</div>
      </div>
    ))}
  </div>
)}


        {/* Message chat based on text */}
        {/* Job Seeker Messenger */}
<div className="bg-white/50 backdrop-blur-lg rounded-xl shadow-2xl h-[80vh] overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Left Panel: Employer/Job List */}
  <div className="col-span-1 bg-white/50 p-4 overflow-y-auto">
    <h3 className="text-lg font-semibold mb-4 text-primary">Chats with Employers</h3>
    <ul className="space-y-3 text-primary">
      {/* Replace with dynamic job/employer list */}
      {[
        { job: "Frontend Developer", company: "TechSpark", avatar: "/company1.png" },
        { job: "UI/UX Designer", company: "Creatix", avatar: "/company2.png" }
      ].map((chat, idx) => (
        <li
          key={idx}
          className="cursor-pointer flex items-center gap-3 p-2 text-primary rounded-lg hover:bg-accent hover:text-primary transition"
        >
          <img
            src={chat.avatar}
            alt={chat.company}
            className="w-10 h-10 rounded-full border-2"
          />
          <div>
            <div className="font-medium">{chat.company}</div>
            <div className="text-sm text-primary -mt-1">{chat.job}</div>
          </div>
        </li>
      ))}
    </ul>
  </div>

  {/* Right Panel: Chat Window */}
  <div className="col-span-2 flex flex-col bg-white/50 p-4 rounded-lg shadow-inner">
    <div className="border-b pb-2 mb-4">
      <h4 className="text-lg font-semibold text-primary">Chat with TechSpark (Frontend Developer)</h4>
    </div>

    {/* Chat messages */}
    <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-2">
      <div className="flex flex-col items-start">
        <div className="bg-gray-200 text-sm px-4 py-2 rounded-xl max-w-xs">
          Hi, your application looks good. Can you share your GitHub?
        </div>
        <span className="text-xs text-primary mt-1">May 15, 2:30 PM</span>
      </div>
      <div className="flex flex-col items-end">
        <div className="bg-accent text-white text-sm px-4 py-2 rounded-xl max-w-xs">
          Sure! Here's the link: github.com/myportfolio
        </div>
        <span className="text-xs text-primary mt-1">May 15, 2:32 PM</span>
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




        
        


      </main>
    </div>
  );
}
