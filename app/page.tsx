'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import '@/app/globals.css';
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Fullscreen, Menu, X } from 'lucide-react';
import {
  UserPlus,
  SearchCheck,
  Send,
  BarChart,
  Briefcase,
  BadgeCheck,
  MessageCircle,
  Users,
  ArrowRight,
  ArrowDown
} from 'lucide-react';
import { CheckCircle } from "lucide-react";



export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const handleLoginClick = () => {
    router.push("./sign_up_login");
  };

  const handleLoginClick2 = () => {
    router.push("./sign_up");
  };

  return (
    <>
      <div className=" bg-[url('/bg.png')] bg-cover w-full h-auto md:h-screen pt-6 pb-4">
        <div className="bg-white/30 backdrop-blur-lg flex items-center justify-between pt-3 pb-3 pl-4 pr-5 ml-4 mr-4 md:ml-8 md:mr-8 rounded-xl shadow-xl mb-4 md:mb-2">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={70}
              height={2}
              className="mr-4"
            />
            <h1 className="text-2xl sm:text-4xl font-medium text-secondary" ><a href='./'>JobLinker</a></h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="#job" className="text-gray-700 font-semibold hover:text-primary hover:border-b-2 hover:border-b-cyan-400">For Employers</Link>
            <Link href="#job" className="text-gray-700 font-semibold hover:text-primary hover:border-b-2 hover:border-b-cyan-400">For Jobseekers</Link>
            <Link href="./aboutUs" className="text-gray-700 font-semibold hover:text-primary hover:border-b-2 hover:border-b-cyan-400">About Us</Link>
            <Link href="#how-it-works" className="text-gray-700 font-semibold hover:text-primary hover:border-b-2 hover:border-b-cyan-400">How it Works</Link>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex space-x-4">
            <Button className="bg-accent text-primary hover:bg-cyan-300" onClick={handleLoginClick2} >Sign up</Button>
            <Button className="bg-accent text-primary hover:bg-cyan-300" onClick={handleLoginClick}>Login</Button>
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
            <Link href="#job" className="block text-gray-700">For Employers</Link>
            <Link href="#job" className="block text-gray-700">For Jobseekers</Link>
            <Link href="#" className="block text-gray-700">About Us</Link>
            <Link href="#how-it-works" className="block text-gray-700">How it Works</Link>
            <div className="flex flex-col space-y-2">
              <Button onClick={handleLoginClick2} className="bg-accent text-primary hover:bg-cyan-300 w-full">Sign up</Button>
              <Button onClick={handleLoginClick} className="bg-accent text-primary hover:bg-cyan-300 w-full">Login</Button>
            </div>
          </div>
          )}

        {/* Banner */}
        <div className="relative bg-white/30 backdrop-blur-xl rounded-xl shadow-xl mt-6 md:mt-8 ml-4 mr-4 md:ml-8 md:mr-8 overflow-hidden">
          {/* Image Section */}
          <Image 
            src="/banner1.png"
            alt="banner"
            height={500}
            width={700}
            className="w-full h-auto object-cover md:hidden block"
          />
          
          <div className="hidden md:flex flex-wrap items-center p-6 justify-between">
            {/* Text content for desktop */}
            <div className="flex-1 min-w-[250px] pl-2 pr-2 md:pl-4 md:pr-4 mb-4 md:mb-0">
              <h1 className="text-3xl md:text-5xl font-bold text-primary mb-2 md:mb-4">
                Connecting Talent with Opportunity
              </h1>
              <h3 className="text-lg font-semibold md:text-2xl text-gray-800">
                Where Employers Meet the Right Talent
              </h3>
              <Button className="bg-accent text-primary md:text-xl p-6 hover:bg-cyan-300 md:mt-4 mt-2">Get Started</Button>
            </div>

            {/* Image for desktop */}
            <div className="flex justify-center flex-1">
              <Image 
                src="/banner1.png"
                alt="banner"
                height={500}
                width={700}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Mobile overlay text */}
          <div className="absolute bg-white/30 top-0 left-0 w-full h-full flex flex-col justify-center items-start text-center p-4 md:hidden">
            <h1 className="text-2xl font-bold text-primary mb-2 text-left">
              Connecting Talent with Opportunity
            </h1>
            <h3 className="text-base font-medium text-primary mb-4">
              Where Employers Meet the Right Talent
            </h3>
            <Button className="bg-accent text-primary hover:bg-cyan-300">Get Started </Button>
          </div>
        </div>


      </div>
          {/*why joblinker?*/}
          <div className="bg-cyan-100 pt-4 pb-4 md:pt-8 md:pb-8">

          <section className=" backdrop-blur-xl px-6 md:px-16 py-12 bg-white/30 rounded-xl shadow-lg ml-4 mr-4 md:ml-8 md:mr-8">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-10">
                What Makes JobLinker Different?
              </h2>

              <div className="grid gap-8 md:grid-cols-3">
                {/* Card 1: Smart Matching */}
                <div className="hover:bg-cyan-200 bg-white border border-gray-200 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all">
                  <h3 className="text-xl font-semibold text-secondary mb-2">Smart Matching</h3>
                  <p className="text-gray-700">
                    We go beyond keyword search — <span className="font-medium text-primary">JobLinker</span> intelligently connects candidates and jobs based on skills, goals, and fit.
                  </p>
                </div>

                {/* Card 2: Time-Saving */}
                <div className="hover:bg-cyan-200 bg-white border border-gray-200 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all">
                  <h3 className="text-xl font-semibold text-secondary mb-2">Time-Saving</h3>
                  <p className="text-gray-700">
                    Cut down on endless scrolling or resume sorting — let <span className="font-medium text-primary">JobLinker</span> do the heavy lifting.
                  </p>
                </div>

                {/* Card 3: Tailored Experiences */}
                <div className="hover:bg-cyan-200 bg-white border border-gray-200 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all">
                  <h3 className="text-xl font-semibold text-secondary mb-2">Tailored Experiences</h3>
                  <p className="text-gray-700 mb-2">
                    <strong>Employers</strong> get high-quality, pre-filtered candidates.
                  </p>
                  <p className="text-gray-700">
                    <strong>Jobseekers</strong> get opportunities that match who they are, not just what they’ve done.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/*How it works*/}
          <div className="bg-[url('/companies.png')] md:bg-cover w-full h-auto md:h-full pt-6 pb-6">
            <section id="how-it-works" className=" backdrop-blur-xl bg-white/40 md:bg-white/30 px-6 md:px-16 py-8 md:mt-4 rounded-xl shadow-lg ml-4 mr-4 md:ml-8 md:mr-8">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-4 md:mb-8">
                How It Works
              </h2>

              {/* Workflow Container */}
              <div className="flex flex-col md:flex-row gap-10 items-start justify-center flex-wrap">

                {/* Job Seekers Workflow */}
                <div className="flex-1 bg-white/80 rounded-2xl shadow-md p-6 ml-auto mr-auto">
                  <h3 className="text-2xl font-semibold text-secondary text-center mb-10">For Job Seekers</h3>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 text-center">

                    {/* Step 1 */}
                    <div className="flex flex-col items-center max-w-[150px]">
                      <UserPlus color="#088db2" className="w-12 h-12 mb-4" />
                      <p><strong>Create Profile</strong><br />Add skills, goals, and preferences.</p>
                    </div>
                    <ArrowDown className="md:hidden text-[#088db2] w-6 h-6" />
                    <ArrowRight className="hidden md:block text-[#088db2] w-6 h-6" />

                    {/* Step 2 */}
                    <div className="flex flex-col items-center max-w-[150px]">
                      <SearchCheck color="#088db2" className="w-12 h-12 mb-4" />
                      <p><strong>Smart Matches</strong><br />Get tailored job suggestions.</p>
                    </div>
                    <ArrowDown className="md:hidden text-[#088db2] w-6 h-6" />
                    <ArrowRight className="hidden md:block text-[#088db2] w-6 h-6" />

                    {/* Step 3 */}
                    <div className="flex flex-col items-center max-w-[150px]">
                      <Send color="#088db2" className="w-12 h-12 mb-4" />
                      <p><strong>Apply Quickly</strong><br />One-click applications.</p>
                    </div>
                    <ArrowDown className="md:hidden text-[#088db2] w-6 h-6" />
                    <ArrowRight className="hidden md:block text-[#088db2] w-6 h-6" />

                    {/* Step 4 */}
                    <div className="flex flex-col items-center max-w-[150px]">
                      <BarChart color="#088db2" className="w-12 h-12 mb-4" />
                      <p><strong>Track Progress</strong><br />Stay updated on applications.</p>
                    </div>
                  </div>
                </div>

                {/* Employers Workflow */}
                <div className="flex-1 bg-white/80 rounded-2xl shadow-md p-6 ml-auto mr-auto">
                  <h3 className="text-2xl font-semibold text-secondary text-center mb-10">For Employers</h3>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 text-center">

                    {/* Step 1 */}
                    <div className="flex flex-col items-center max-w-[150px]">
                      <Briefcase color="#088db2" className="w-12 h-12 mb-4" />
                      <p><strong>Post Jobs</strong><br />List open roles with ease.</p>
                    </div>
                    <ArrowDown className="md:hidden text-[#088db2] w-6 h-6" />
                    <ArrowRight className="hidden md:block text-[#088db2] w-6 h-6" />

                    {/* Step 2 */}
                    <div className="flex flex-col items-center max-w-[150px]">
                      <BadgeCheck color="#088db2" className="w-12 h-12 mb-4" />
                      <p><strong>Review Matches</strong><br />View top-picked candidates.</p>
                    </div>
                    <ArrowDown className="md:hidden text-[#088db2] w-6 h-6" />
                    <ArrowRight className="hidden md:block text-[#088db2] w-6 h-6" />

                    {/* Step 3 */}
                    <div className="flex flex-col items-center max-w-[150px]">
                      <MessageCircle color="#088db2" className="w-12 h-12 mb-4" />
                      <p><strong>Connect</strong><br />Chat & schedule interviews.</p>
                    </div>
                    <ArrowDown className="md:hidden text-[#088db2] w-6 h-6" />
                    <ArrowRight className="hidden md:block text-[#088db2] w-6 h-6" />

                    {/* Step 4 */}
                    <div className="flex flex-col items-center max-w-[150px]">
                      <Users color="#088db2" className="w-12 h-12 mb-4" />
                      <p><strong>Build Pipeline</strong><br />Save profiles for later.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/*best for both */}
          <div className="bg-[url('/best.png')] bg-cover w-full h-auto  py-6 px-8">
            <div id="job" className="flex flex-col lg:flex-row gap-8 bg-white/30 backdrop-blur-xl mx-auto rounded-xl shadow-xl my-auto px-8 py-12">
              {/* Job Seekers Section */}
              <section className="flex-1 bg-cyan-100 p-8 rounded-xl shadow-xl text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Why JobLinker is Perfect for You</h2>
                <ul className="space-y-4 text-lg text-gray-600 text-left max-w-md mx-auto">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 mt-1" size={22} />
                    <span>Personalized job matches based on your skills and interests.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 mt-1" size={22} />
                    <span>No more generic applications — get connected to jobs that fit <em>you</em>.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 mt-1" size={22} />
                    <span>Simple, user-friendly interface to manage your job hunt.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 mt-1" size={22} />
                    <span>Get notified about the right opportunities, not every opportunity.</span>
                  </li>
                </ul>
              </section>

              {/* Employers Section */}
              <section className="flex-1 bg-cyan-100 p-8 rounded-xl shadow-xl text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Why Employers Trust JobLinker</h2>
                <ul className="space-y-4 text-lg text-gray-600 text-left max-w-md mx-auto">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 mt-1" size={22} />
                    <span>AI-powered matching — see candidates that align with your role, fast.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 mt-1" size={22} />
                    <span>Reduce hiring time and costs by reaching the right people.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 mt-1" size={22} />
                    <span>Seamless job posting and candidate management.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 mt-1" size={22} />
                    <span>Better hires = stronger teams = real results.</span>
                  </li>
                </ul>
              </section>
            </div>
          </div>


          {/* Footer */}
          <div className="bg-muted text-secondary py-10 px-6 sm:px-12">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10 flex-wrap">
              
              {/* Logo & Branding */}
              <div className="flex items-center gap-4">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={60}
                  height={60}
                  className="rounded"
                />
                <h1 className="text-2xl sm:text-3xl font-semibold"><a href="./">JobLinker</a></h1>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col sm:flex-row gap-10 text-sm sm:text-base">
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold text-lg mb-1">Company</h3>
                  <a href="/about" className="hover:underline">About Us</a>
                  <a href="/careers" className="hover:underline">Careers</a>
                  <a href="/blog" className="hover:underline">Blog</a>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold text-lg mb-1">Resources</h3>
                  <a href="/help" className="hover:underline">Help Center</a>
                  <a href="/privacy" className="hover:underline">Privacy Policy</a>
                  <a href="/terms" className="hover:underline">Terms & Conditions</a>
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

    </>
  );
}
