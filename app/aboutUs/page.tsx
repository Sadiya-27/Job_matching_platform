'use client';

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import '@/app/globals.css';
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function Employers() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Head>
        <title>JobLinker | For Employers</title>
        <meta name="description" content="Connect with top talent using JobLinker." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-muted bg-cover w-full h-auto md:h-screen pt-4">

        {/* Header */}
        <div className="bg-white/30 backdrop-blur-lg flex items-center justify-between pt-3 pb-3 pl-4 pr-5 ml-4 mr-4 md:ml-8 md:mr-8 rounded-xl shadow-xl mb-4">
            <div className="flex items-center">
            <Image src="/logo.png" alt="Logo" width={70} height={70} className="mr-4" />
            <h1 className="text-2xl sm:text-4xl font-medium text-secondary">
                <Link href="/">JobLinker</Link>
            </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 font-semibold hover:text-primary hover:border-b-2 hover:border-b-cyan-400">For Employers</Link>
            <Link href="/" className="text-gray-700 font-semibold hover:text-primary hover:border-b-2 hover:border-b-cyan-400">For Jobseekers</Link>
            <Link href="/aboutUs" className="text-gray-700 font-semibold hover:text-primary hover:border-b-2 hover:border-b-cyan-400">About Us</Link>
            <Link href="/" className="text-gray-700 font-semibold hover:text-primary hover:border-b-2 hover:border-b-cyan-400">How it Works</Link>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex space-x-4">
            <Button className="bg-accent text-primary hover:bg-cyan-300">Sign up</Button>
            <Button className="bg-accent text-primary hover:bg-cyan-300">Login</Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
            <div className="md:hidden bg-white/30 backdrop-blur-lg p-4 space-y-4 ml-4 mr-4 rounded-xl shadow-xl">
            <Link href="/" className="block text-gray-700">For Employers</Link>
            <Link href="/" className="block text-gray-700">For Jobseekers</Link>
            <Link href="/aboutUs" className="block text-gray-700">About Us</Link>
            <Link href="/" className="block text-gray-700">How it Works</Link>
            <div className="flex flex-col space-y-2">
                <Button className="bg-accent text-primary hover:bg-cyan-300 w-full">Sign up</Button>
                <Button className="bg-accent text-primary hover:bg-cyan-300 w-full">Login</Button>
            </div>
            </div>
        )}

        <main className="bg-[url('/bg.png')] bg-cover w-full text-primary px-4 py-6 md:px-8">
            <section className="flex mx-auto bg-white/30 backdrop-blur-lg rounded-xl p-6 shadow-xl flex-col">
            <h1 className="text-4xl font-bold mb-6 text-primary">About Us</h1>

            <p className="text-lg leading-relaxed mb-8">
                At <span className="font-semibold">JobLinker</span>, we're reimagining the job search experience for both
                employers and job seekers. Born from a desire to simplify and personalize the hiring process, JobLinker connects
                talent with opportunity using smart technology, intuitive design, and a human-first approach.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-primary">Our Mission</h2>
            <p className="text-base mb-6">
                To bridge the gap between ambition and opportunity by helping job seekers find roles that truly fit, and
                empowering employers to discover the best candidates with ease.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-3 text-primary">What We Do</h2>
            <ul className="list-disc pl-5 space-y-2 mb-6">
                <li>Personalized job matching that aligns skills and preferences with the right openings</li>
                <li>Seamless tools for employers to post jobs, review applicants, and make quicker hiring decisions</li>
                <li>A modern platform that makes job search less stressful and more successful</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-3 text-primary">Why JobLinker?</h2>
            <ul className="list-disc pl-5 space-y-2 mb-6">
                <li><strong>For Job Seekers:</strong> We go beyond keywords—our algorithm understands your goals, skills, and work preferences.</li>
                <li><strong>For Employers:</strong> Spend less time filtering and more time interviewing the right people.</li>
                <li><strong>For Everyone:</strong> Clean design, smooth experience, and real results.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-3 text-primary">Our Vision</h2>
            <p className="text-base">
                A world where finding a job—or the right candidate—isn't just about luck or connections, but about real
                compatibility and meaningful opportunity.
            </p>
            </section>
        </main>




        {/* Footer */}
        <div className="bg-muted text-secondary py-10 px-6 sm:px-12">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10 flex-wrap">

            {/* Logo & Branding */}
            <div className="flex items-center gap-4">
                <Image src="/logo.png" alt="Logo" width={60} height={60} className="rounded" />
                <h1 className="text-2xl sm:text-3xl font-semibold">
                <Link href="/">JobLinker</Link>
                </h1>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col sm:flex-row gap-10 text-sm sm:text-base">
                <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-lg mb-1">Company</h3>
                <Link href="/about" className="hover:underline">About Us</Link>
                <Link href="/careers" className="hover:underline">Careers</Link>
                <Link href="/blog" className="hover:underline">Blog</Link>
                </div>

                <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-lg mb-1">Resources</h3>
                <Link href="/help" className="hover:underline">Help Center</Link>
                <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
                </div>

                <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-lg mb-1">Contact</h3>
                <p>Email: support@joblinker.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                </div>
            </div>
            </div>

            {/* Footer Bottom Text */}
            <div className="mt-10 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} JobLinker. All rights reserved.
            </div>
        </div>
      </div>

    </>
  );
}
