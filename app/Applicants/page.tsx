"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Employer() {
  const router = useRouter();
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
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

  const [applications, setApplications] = useState([]);
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch("/api/candidates");
        const data = await res.json();
        setApplications(data);
      } catch (err) {
        console.error("Failed to load candidates:", err);
      }
    };

    fetchCandidates();
  }, []);

  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewProfile = (applicant) => {
    setSelectedApplicant(applicant);
    setShowModal(true);
  };

  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      const res = await fetch("/api/candidates");
      const data = await res.json();
      setCandidates(data);
    };
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter((applicant) =>
  applicant.professionalTitle?.toLowerCase().includes(searchTerm.toLowerCase())
);


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
      <main className="flex-1 p-4 bg-[url('/applicants.png')] bg-no-repeat bg-center bg-contain  md:p-8">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-6 relative">
          <input
            type="text"
            placeholder="Search by Professional Title (Ctrl + Q)"
            className="w-1/2 px-4 py-2 bg-white/50 backdrop-blur-lg text-primary shadow-lg rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                  href="/empSettings"
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

        {/* Applicants */}

        <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCandidates.map((applicant, index) => (
            <div
              key={index}
              className="bg-white/20 text-primary backdrop-blur-md p-4 rounded-xl shadow-md hover:shadow-xl transition"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-secondary">
                  {applicant.name}
                </h3>
                <span className="text-sm ">
                  {new Date(applicant.appliedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-primary font-medium">
                {applicant.professionalTitle || "N/A"}
              </p>
              <p className="text-sm  mb-2">{applicant.location}</p>
              <Button
                onClick={() => setSelected(applicant)}
                className="mt-3 px-4 py-2 text-white rounded-md font-semibold transition"
              >
                View Resume
              </Button>
            </div>
          ))}
        </section>

        {selected && (
          <div className="fixed inset-0 text-primary bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white bg-opacity-90 p-6 rounded-xl shadow-lg max-w-2xl w-full relative overflow-y-auto max-h-[90vh]">
              <button
                className="absolute top-2 right-2 p-3 text-gray-500 hover:text-gray-800"
                onClick={() => setSelected(null)}
              >
                ✕
              </button>
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={selected.userImage}
                  alt="avatar"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold">{selected.name}</h2>
                  <p className="">{selected.email}</p>
                  <p className="text-sm  mt-1">{selected.professionalTitle}</p>
                </div>
              </div>

              <p className="text-sm  mb-2">
                <strong>Current Job:</strong> {selected.currentJobTitle} at{" "}
                {selected.currentCompany}
              </p>
              <p className="text-sm  mb-2">
                <strong>Summary:</strong> {selected.summary}
              </p>
              <p className="text-sm  mb-2">
                <strong>Skills:</strong> {selected.skills?.join(", ")}
              </p>

              {selected.education?.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-lg font-semibold mb-2">Education</h3>
                  <ul className="space-y-2 text-sm text-primary">
                    {selected.education.map((edu, index) => (
                      <li key={index}>
                        <p>
                          <strong>{edu.degree}</strong> in {edu.fieldOfStudy} @{" "}
                          {edu.institution}
                        </p>
                        <p>
                          {new Date(edu.startDate).toLocaleDateString()} -{" "}
                          {edu.isCurrentlyStudying
                            ? "Present"
                            : new Date(edu.endDate).toLocaleDateString()}
                        </p>
                        {edu.cgpa && <p>CGPA: {edu.cgpa}</p>}
                        {edu.percentage && <p>Percentage: {edu.percentage}%</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.experience?.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-lg font-semibold mb-2">Experience</h3>
                  <ul className="space-y-3 text-sm ">
                    {selected.experience.map((exp, index) => (
                      <li key={index}>
                        <p>
                          <strong>{exp.jobTitle}</strong> @ {exp.companyName} (
                          {exp.location})
                        </p>
                        <p>
                          {new Date(exp.startDate).toLocaleDateString()} -{" "}
                          {exp.isCurrentJob
                            ? "Present"
                            : new Date(exp.endDate).toLocaleDateString()}
                        </p>
                        <p>{exp.description}</p>
                        {exp.achievements?.length > 0 && (
                          <ul className="list-disc list-inside ">
                            {exp.achievements.map((ach, i) => (
                              <li key={i}>{ach}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.certification?.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-lg font-semibold mb-2">Certifications</h3>
                  <ul className="space-y-2 text-sm ">
                    {selected.certification.map((cert, index) => (
                      <li key={index}>
                        <p>
                          <strong>{cert.name}</strong> by{" "}
                          {cert.issuingOrganization}
                        </p>
                        <p>
                          {new Date(cert.issueDate).toLocaleDateString()} -{" "}
                          {cert.doesNotExpire
                            ? "No Expiry"
                            : new Date(
                                cert.expirationDate
                              ).toLocaleDateString()}
                        </p>
                        {cert.credentialUrl && (
                          <p>
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              className="text-blue-600 underline"
                            >
                              View Credential
                            </a>
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.project?.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-lg font-semibold mb-2">Projects</h3>
                  <ul className="space-y-3 text-sm ">
                    {selected.project.map((proj, index) => (
                      <li key={index}>
                        <p>
                          <strong>{proj.title}</strong>
                        </p>
                        <p>{proj.description}</p>
                        <p>
                          <strong>Technologies:</strong>{" "}
                          {proj.technologies?.join(", ")}
                        </p>
                        {proj.projectUrl && (
                          <p>
                            <a
                              href={proj.projectUrl}
                              target="_blank"
                              className="text-blue-600 underline"
                            >
                              Live Demo
                            </a>
                          </p>
                        )}
                        {proj.githubUrl && (
                          <p>
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              className="text-blue-600 underline"
                            >
                              GitHub
                            </a>
                          </p>
                        )}
                        <p>
                          {new Date(proj.startDate).toLocaleDateString()} -{" "}
                          {proj.isOngoing
                            ? "Present"
                            : new Date(proj.endDate).toLocaleDateString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-4 text-sm  mb-2">
                <p>
                  <strong>Preferred Locations:</strong>{" "}
                  {selected.preferredLocations?.join(", ")}
                </p>
                <p>
                  <strong>Preferred Job Type:</strong>{" "}
                  {selected.preferredJobType}
                </p>
                <p>
                  <strong>Work Mode:</strong> {selected.preferredWorkMode}
                </p>
                <p>
                  <strong>Expected Salary:</strong> {selected.expectedSalaryMin}{" "}
                  - {selected.expectedSalaryMax}{" "}
                  {selected.expectedSalaryCurrency}
                </p>
                <p>
                  <strong>Experience:</strong> {selected.totalExperienceYears}{" "}
                  yrs {selected.totalExperienceMonths} months
                </p>
                <p>
                  <strong>Notice Period:</strong> {selected.noticePeriod}
                </p>
              </div>

              <div className="mt-3 space-y-2 text-sm ">
                <p>
                  <strong>Availability:</strong>{" "}
                  {selected.availabilityStatus?.join(", ")}
                </p>
                <p>
                  <strong>Actively Looking:</strong>{" "}
                  {selected.isActivelyLooking ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Willing to Relocate:</strong>{" "}
                  {selected.willingToRelocate ? "Yes" : "No"}
                </p>
              </div>

              <div className="mt-4 text-sm  space-y-1">
                {selected.linkedInUrl && (
                  <p>
                    <strong>LinkedIn:</strong>{" "}
                    <a
                      href={selected.linkedInUrl}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      Profile
                    </a>
                  </p>
                )}
                {selected.githubUrl && (
                  <p>
                    <strong>GitHub:</strong>{" "}
                    <a
                      href={selected.githubUrl}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      Repository
                    </a>
                  </p>
                )}
                {selected.portfolioUrl && (
                  <p>
                    <strong>Portfolio:</strong>{" "}
                    <a
                      href={selected.portfolioUrl}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      Website
                    </a>
                  </p>
                )}
                {selected.twitterUrl && (
                  <p>
                    <strong>Twitter:</strong>{" "}
                    <a
                      href={selected.twitterUrl}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      @Profile
                    </a>
                  </p>
                )}
              </div>

              <div className="mt-4">
                <a
                  href={selected.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-primary text-white rounded hover:bg-secondary"
                >
                  View Resume
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
