'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkManualLogin = async () => {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");

      if (token && email) {
        try {
          const res = await fetch("/api/get-role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          const data = await res.json();

          if (res.ok) {
            if (data.role === "jobseeker") router.push("/Jobseeker");
            else if (data.role === "employer") router.push("/Employer");
            else {
              console.warn("Unknown role:", data.role);
              router.push("/sign_up_login");
            }
          } else {
            console.error("Role fetch error:", data.message);
            router.push("/sign_up_login");
          }
        } catch (err) {
          console.error("Manual login error:", err);
          router.push("/sign_up_login");
        }
      } else {
        // No token or email stored => not logged in
        router.push("/sign_up_login");
      }
    };

    const checkSocialLogin = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch("/api/get-role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          });

          const data = await res.json();

          if (res.ok) {
            if (data.role === "jobseeker") router.push("/Jobdashboard");
            else if (data.role === "employer") router.push("/employer");
            else {
              console.warn("Unknown role:", data.role);
              router.push("/sign_up_login");
            }
          } else {
            console.error("Role fetch error:", data.message);
            router.push("/sign_up_login");
          }
        } catch (err) {
          console.error("Social login error:", err);
          router.push("/sign_up_login");
        }
      } else {
        // No session available
        checkManualLogin();
      }
    };

    if (status === "authenticated") {
      checkSocialLogin();
    } else if (status === "unauthenticated") {
      checkManualLogin();
    }
  }, [session, status, router]);

  if (status === "loading" || loading)
    return (
      <div className="bg-muted text-primary font-semibold flex justify-center text-2xl items-center h-screen w-screen">
        Loading...
      </div>
    );

  return (
    <div className="bg-muted h-screen w-screen flex justify-center items-center font-semibold text-primary text-2xl">
      Loading....
    </div>
  );
}
