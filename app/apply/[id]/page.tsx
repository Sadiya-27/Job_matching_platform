"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, use } from "react";
import { Menu, X } from "lucide-react";
import { UploadButton } from "@/app/utils/uploadthing";

export default function ApplyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const { id } = use(params);
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeLink, setResumeLink] = useState("");

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

    const fetchJobDetails = async () => {
      try {
        const res = await fetch(`/api/application/${id}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch job details");
        const jobData = await res.json();
        setJob(jobData);
      } catch (err: any) {
        console.error(err.message);
      }
    };

    fetchUser();
    fetchJobDetails();
  }, [session, id]);

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

  const userName = userData?.name || session?.user?.name || "User";
  const userImage =
    userData?.userImage || session?.user?.image || "/user-avatar.png";

  if (loading || !job) {
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
        className={`w-full md:w-64 bg-white/30 shadow-xl border-r rounded-xl p-4 md:p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "block" : "hidden"
        } md:block`}
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
              className="block px-3 py-2 rounded-lg font-medium hover:bg-accent hover:shadow-xl"
            >
              Schedule
            </a>
            {/* <a
              href="../Jobmessenger"
              className="block px-3 py-2 rounded-lg font-medium hover:bg-accent hover:shadow-xl"
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
            placeholder="Quick Search (Ctrl + Q)"
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
              <div className="absolute right-0 mt-2 px-4 py-3 font-semibold w-48 bg-white rounded-md shadow-lg z-50">
                <a
                  href="../profile"
                  className="block px-4 py-2 text-primary hover:bg-accent hover:rounded-lg hover:shadow-lg"
                >
                  My Profile
                </a>
                <a
                  href="/settings"
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

        {/* Application Section */}
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
          <h1 className="text-3xl font-bold text-primary mb-4">{job.title}</h1>
          <p className="text-gray-600 mb-1">
            • {job?.employer?.companyName || "Unknown"} • {job.location}
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Posted on: {new Date(job.createdAt).toLocaleDateString()}
          </p>
          <p className="mb-4 text-sm text-gray-700">{job.description}</p>

          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch(`/api/application/${job._id}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name,
                    email,
                    resumeLink,
                    applicantId: userData?._id || session?.user?.id,
                  }),
                });

                if (!res.ok) throw new Error("Application submission failed");
                alert("Application submitted successfully!");
                router.push("/Jobseeker"); // Or wherever you want to redirect
              } catch (error) {
                console.error(error);
                alert("An error occurred while submitting the application.");
              }
            }}
          >
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full mt-1 px-4 py-2 border rounded-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full mt-1 px-4 py-2 border rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Resume</label>

              {/* Option 1: Paste Resume Link */}
              <input
                type="text"
                placeholder="Paste resume link (optional if uploading)"
                className="w-full mt-1 px-4 py-2 border rounded-lg"
                value={resumeLink}
                onChange={(e) => setResumeLink(e.target.value)}
              />

              <div className="text-sm text-gray-500 mt-2 mb-1">
                Or upload PDF:
              </div>

              {/* Option 2: Upload via UploadThing */}
              <UploadButton
                endpoint="resumeUploader"
                appearance={{
                  button:
                    "ut-upload-btn bg-secondary hover:bg-accent text-white px-4 py-2 rounded-lg",
                  container: "ut-upload-container",
                  allowedContent: "text-xs text-gray-500",
                }}
                onClientUploadComplete={(res) => {
                  if (res && res[0]?.url) {
                    setResumeLink(res[0].url);
                    alert("Resume uploaded!");
                  }
                }}
                onUploadError={(error) => {
                  console.error(error);
                  alert("Upload failed. Please try again.");
                }}
              />
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg"
            >
              Submit Application
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
