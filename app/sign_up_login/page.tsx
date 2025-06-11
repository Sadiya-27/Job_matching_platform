'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import '@/app/globals.css';
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Login () {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    const res = await fetch('/api/user/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log('Response from backend:', data); // log the response

    if (res.ok) {
      // ✅ Save token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.user.email); // ✅ required for get-user-role API
      alert('Login successful!');
      router.push('/dashboard');
    }
    else {
      alert(data.message || 'Invalid credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Something went wrong');
  } 
};


      
    return (
        <div className="min-h-screen bg-accent flex items-center justify-center py-4 px-4">
      <div className="bg-white shadow-2xl rounded-3xl flex flex-col md:flex-row overflow-hidden max-w-5xl w-full">
        {/* Left Side: Illustration */}
        <div className="bg-muted w-full md:w-1/2 p-8 flex items-center justify-center">
          <Image src="/login.png" alt="Login Illustration" width={500} height={400} />
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome Back :)</h2>
          <p className="text-sm text-gray-500 mb-6">
            To keep connected with us please login with your personal information by email address and password 🔐
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
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
                Login Now
              </button>
              <button className="bg-gray-200 text-primary font-semibold px-4 md:px-6 py-2 rounded-lg hover:bg-gray-300" type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/sign_up');
                }}
              >
                Create Account
              </button>
            </div>

            <div className="mt-6 text-sm text-center text-gray-500">
              Or you can login with
            </div>

            </form>
            <div className="flex justify-center space-x-4 mt-3">
              <button onClick={() => signIn("google", { callbackUrl: "/sign_up_login" })} className="bg-white border p-2 rounded-full hover:shadow-md flex items-center space-x-2 px-4 md:px-8">
                <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
                <span className="text-md md:text-lg font-medium text-gray-700">Google</span>
              </button>
              
            </div>
          
        </div>
      </div>
    </div>
    );
}
