import React, { useState } from "react";

export default function OneFlowLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900">
      <style jsx>
        {`
          :root {
            --primary: #0f172a;
            --primary-hover: #1e293b;
            --accent: #14b8a6;
            --accent-hover: #0d9488;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --bg-main: #ffffff;
            --bg-alt: #f8fafc;
            --border-color: #e2e8f0;
            --footer-bg: #0f172a;
            --footer-text: #cbd5e1;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out;
          }

          .gradient-text {
            background: linear-gradient(135deg, #0f172a 0%, #14b8a6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .glass-effect {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .feature-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(20, 184, 166, 0.15);
          }
        `}
      </style>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-effect border-b border-slate-200/50">
        <div className="flex justify-between items-center px-6 md:px-12 py-5 max-w-7xl mx-auto">
          <a
            href="#"
            className="text-2xl font-bold gradient-text no-underline tracking-tight"
          >
            OneFlow
          </a>
          <div
            className={`${
              mobileMenuOpen ? "flex" : "hidden"
            } md:flex flex-col md:flex-row absolute md:relative top-full left-0 right-0 md:top-auto md:left-auto md:right-auto bg-white md:bg-transparent border-t md:border-0 border-slate-200 md:border-0 items-center gap-6 md:gap-10 py-6 md:py-0 px-6 md:px-0`}
          >
            <a
              href="#features"
              className="text-slate-600 font-medium no-underline hover:text-slate-900 transition-colors relative group"
            >
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 transition-all group-hover:w-full"></span>
            </a>
            <a
              href="#pricing"
              className="text-slate-600 font-medium no-underline hover:text-slate-900 transition-colors relative group"
            >
              Pricing
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 transition-all group-hover:w-full"></span>
            </a>
            <a
              href="#login"
              className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-semibold no-underline hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
            >
              Login / Sign Up
            </a>
          </div>
          <button
            className="md:hidden text-2xl text-slate-900 bg-transparent border-0 cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 md:px-12 py-20 md:py-32 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center animate-fade-in-up">
        <div className="max-w-2xl space-y-8">
          <div className="inline-block px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-semibold mb-4 border border-teal-100">
            ✨ All-in-One Business Solution
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl leading-tight font-extrabold text-slate-900 mb-6 tracking-tight">
            OneFlow.
            <br />
            <span className="gradient-text">Plan, Execute & Bill.</span>
            <br />
            All In One Place
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-light">
            Streamline Projects, Maximize Profitability, Unify Your Workflow.
            The modular system that takes you from planning to billing without
            the chaos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 font-semibold rounded-lg text-white bg-slate-900 border border-slate-900 no-underline hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Start Your Free Trial
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 font-semibold rounded-lg text-slate-900 bg-white border-2 border-slate-200 no-underline hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Watch Demo
            </a>
          </div>
        </div>
        <div className="w-full aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl border border-slate-200 overflow-hidden shadow-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <img
            src="./Images/image.jpg"
            alt="Dashboard Preview"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-slate-900 mb-6 font-bold tracking-tight">
              Everything you need to run your business
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
              Powerful features designed to streamline your workflow and boost
              productivity
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="feature-card text-left p-8 bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl hover:border-teal-300">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <svg
                  width="28"
                  height="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl mb-4 text-slate-900 font-bold">
                Project Planning
              </h3>
              <p className="text-slate-600 leading-relaxed font-light">
                Create detailed project plans, assign tasks, and set milestones
                with our intuitive interface.
              </p>
            </div>
            <div className="feature-card text-left p-8 bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl hover:border-teal-300">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <svg
                  width="28"
                  height="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl mb-4 text-slate-900 font-bold">
                Time Tracking
              </h3>
              <p className="text-slate-600 leading-relaxed font-light">
                Track time spent on tasks effortlessly and generate accurate
                timesheets for billing.
              </p>
            </div>
            <div className="feature-card text-left p-8 bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl hover:border-teal-300">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <svg
                  width="28"
                  height="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl mb-4 text-slate-900 font-bold">
                Invoicing & Billing
              </h3>
              <p className="text-slate-600 leading-relaxed font-light">
                Convert project hours into professional invoices and get paid
                faster with integrated payments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 px-6 md:px-12 py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 md:gap-16">
          <div>
            <h4 className="text-white text-lg mb-6 font-bold">Contact Us</h4>
            <ul className="list-none space-y-3">
              <li className="hover:text-teal-400 transition-colors">
                +91 981-555-1234
              </li>
              <li className="hover:text-teal-400 transition-colors">
                hello@oneflow.com
              </li>
              <li className="hover:text-teal-400 transition-colors">
                123 Business Ave, Tech City
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-lg mb-6 font-bold">Company</h4>
            <ul className="list-none space-y-3">
              <li>
                <a
                  href="#"
                  className="text-slate-400 no-underline hover:text-teal-400 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 no-underline hover:text-teal-400 transition-colors"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 no-underline hover:text-teal-400 transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 no-underline hover:text-teal-400 transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-lg mb-6 font-bold">Resources</h4>
            <ul className="list-none space-y-3">
              <li>
                <a
                  href="#"
                  className="text-slate-400 no-underline hover:text-teal-400 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 no-underline hover:text-teal-400 transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 no-underline hover:text-teal-400 transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 no-underline hover:text-teal-400 transition-colors"
                >
                  API Docs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-lg mb-6 font-bold">Legal</h4>
            <ul className="list-none space-y-3">
              <li>
                <a
                  href="#"
                  className="text-slate-400 no-underline hover:text-teal-400 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 no-underline hover:text-teal-400 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 no-underline hover:text-teal-400 transition-colors"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-700 text-center text-slate-500">
          &copy; 2025 OneFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
