'use client';

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadButton } from "@/app/utils/uploadthing";

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

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSignOut = () => {
    localStorage.removeItem("token");
    signOut({ callbackUrl: "/sign_up_login" });
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const oldPassword = (
      form.elements.namedItem("oldPassword") as HTMLInputElement
    ).value;
    const newPassword = (
      form.elements.namedItem("newPassword") as HTMLInputElement
    ).value;

    if (newPassword.length < 6) {
      setStatus("error");
      setMessage("New password must be at least 6 characters.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/user/updatePassword", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: userData?._id, // ✅ add userId from fetched user data
          oldPassword,
          newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update password");
      }

      setStatus("success");
      setMessage("Password updated successfully.");
      form.reset();
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Something went wrong.");
    }
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
            {/* <a href="../Empmessenger" className="block px-3 py-2 rounded-lg hover:bg-accent hover:shadow-xl font-medium">Messenger</a> */}
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

        {/* Upload profile pic */}
          <div className="mt-6 bg-white/50 p-4 rounded-lg shadow-lg m-auto w-full md:w-2/3 text-center backdrop-blur-lg">
            <h2 className="text-lg font-semibold mb-4 text-primary">
              Upload Profile Picture
            </h2>

            {/* Display circular user image if available */}
            {userData?.userImage && (
              <div className="flex justify-center mb-4">
                <img
                  src={userData.userImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-primary object-cover shadow-md"
                />
              </div>
            )}

            {/* Upload Button with better visibility */}
            <UploadButton
              endpoint="imageUploader"
              appearance={{
                button:
                  "bg-primary hover:bg-cyan-600 text-white px-4 py-2  rounded ",
                container: "mt-4 sm:mx-4",
                label: "text-sm",
              }}
              onClientUploadComplete={async (res) => {
                const uploadedUrl = res?.[0]?.url;
                if (!uploadedUrl) return;

                const token = localStorage.getItem("token");

                try {
                  const response = await fetch("/api/user/updateProfile", {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ userImage: uploadedUrl }),
                  });

                  if (!response.ok) throw new Error("Failed to update image");

                  console.log("✅ Profile image saved to DB");
                } catch (err) {
                  console.error("❌ Image save failed", err);
                }
              }}
              onUploadError={(err) => console.error("❌ Upload error", err)}
            />
          </div>

          {/* update password */}
          <div className="mt-6 bg-white/50 p-4 rounded-lg m-auto shadow-lg w-full backdrop-blur-lg md:w-2/3">
            <h2 className="text-lg font-semibold mb-4 text-primary">
              Update Password
            </h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-primary">
                  Current Password
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  required
                  className="w-full px-3 py-2 rounded-md border shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-primary">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  className="w-full px-3 py-2 rounded-md border shadow"
                />
              </div>
              <Button
                type="submit"
                
              >
                Update Password
              </Button>
              {status !== "idle" && (
                <p
                  className={`text-sm mt-2 font-medium ${
                    status === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}
            </form>
          </div>
      </main>
    </div>
  );
}
