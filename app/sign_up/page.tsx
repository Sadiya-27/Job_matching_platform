'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import '@/app/globals.css';
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignUp() {

    const router = useRouter();
    const [role, setRole] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      try {
        const res = await fetch('/api/user/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role }),
        });

        const data = await res.json();

        if (res.ok) {
          alert('Registration successful! 🎉');
          router.push('/dashboard'); // Redirect to login page
        } else {
          alert(data.message || 'Registration failed.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong.');
      }
    };


  return (
    <div className="min-h-screen bg-accent flex items-center justify-center py-4 px-4">
      <div className="bg-white shadow-2xl rounded-3xl flex flex-col md:flex-row-reverse overflow-hidden max-w-5xl w-full">
        {/* Right Side: Illustration (moved) */}
        <div className="bg-muted w-full md:w-1/2 p-8 flex items-center justify-center">
          <Image src="/sign_up.png" alt="SignUp Illustration" width={500} height={400} />
        </div>

        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome :)</h2>
          <p className="text-sm text-gray-500 mb-6">
            To connect with us please register with your personal information by email address and password 🔐
          </p>

          <form className="space-y-5 " onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* New Role Buttons */}
            <div>
              <label className="text-sm font-medium text-gray-600">Select Role</label>
              <div className="flex mt-2 space-x-4">
                <button
                  type="button"
                  onClick={() => setRole("employer")}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    role === "employer" ? "bg-accent text-primary font-semibold shadow-xl" : "bg-gray-200 text-primary font-semibold"
                  } focus:outline-none hover:bg-cyan-300`}
                >
                  Employer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("jobseeker")}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    role === "jobseeker" ? "bg-accent text-primary font-semibold shadow-xl" : "bg-gray-200 text-primary font-semibold"
                  } focus:outline-none hover:bg-cyan-300`}
                >
                  Jobseeker
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Remember Me
              </label>
              <a href="#" className="text-blue-500 hover:underline">
                Forgot Password?
              </a>
            </div>

            <div className="flex space-x-2">
              <button type="submit" className="bg-accent text-primary font-semibold px-4 md:px-6 py-2 rounded-lg hover:bg-cyan-300">
              Create Account
              </button>
              <button className="bg-gray-200 text-primary font-semibold px-4 md:px-6 py-2 rounded-lg hover:bg-gray-300" type="button"
                onClick={(e) => {
                    e.preventDefault();
                    router.push('/sign_up_login');
                }}>
                Login Now
              </button>
            </div>

            <div className="mt-6 text-sm text-center text-gray-500">
              Or you can login with
            </div>
            </form>
            <div className="flex justify-center space-x-4 mt-3">
              <button onClick={() =>
                  signIn('google', {
                    callbackUrl: '/dashboard'
                  })
                } className="bg-white border p-2 rounded-full hover:shadow-md flex items-center space-x-2 px-4 md:px-8">
                <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
                <span className="text-md md:text-lg font-medium text-gray-700">Google</span>
              </button>
            </div>
          
        </div>
      </div>
    </div>
  );
}
