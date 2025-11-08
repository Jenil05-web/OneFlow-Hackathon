import React, { useState } from 'react';

export default function OneFlowLanding() {
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

return (
<div className="min-h-screen bg-white text-gray-900">
    <style jsx>
        {
            ` :root {
                --primary: #2563eb;
                --primary-hover: #1d4ed8;
                --text-main: #1f2937;
                --text-muted: #6b7280;
                --bg-main: #ffffff;
                --bg-alt: #f9fafb;
                --border-color: #e5e7eb;
                --footer-bg: #1f2937;
                --footer-text: #d1d5db;
            }

            `
        }
    </style>

    {/* Navigation */}
    <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <a href="#" className="text-2xl font-bold text-blue-600 no-underline tracking-tight">
            OneFlow
        </a>
        <div className="hidden md:flex items-center gap-10">
            <a href="#features"
                className="text-gray-600 font-medium no-underline hover:text-blue-600 transition-colors">
                Features
            </a>
            <a href="#pricing" className="text-gray-600 font-medium no-underline hover:text-blue-600 transition-colors">
                Pricing
            </a>
            <a href="#testimonials"
                className="text-gray-600 font-medium no-underline hover:text-blue-600 transition-colors">
                Testimonials
            </a>
            <a href="#blog" className="text-gray-600 font-medium no-underline hover:text-blue-600 transition-colors">
                Blog
            </a>
            <a href="#login"
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold no-underline hover:bg-blue-700 transition-colors">
                Login / Sign Up
            </a>
        </div>
        <button className="md:hidden text-2xl text-gray-900 bg-transparent border-0" onClick={()=>
            setMobileMenuOpen(!mobileMenuOpen)}
            >
            ☰
        </button>
    </nav>

    <hr className="border-gray-200" />

    {/* Hero Section */}
    <section className="px-8 py-24 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="max-w-2xl">
            <h1 className="text-6xl leading-tight font-extrabold text-gray-900 mb-6">
                OneFlow.<br />Plan, Execute & Bill. All In One Place
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Streamline Projects, Maximize Profitability, Unify Your Workflow. The modular system that takes you
                from planning to billing without the chaos.
            </p>
            <div className="flex gap-4">
                <a href="#"
                    className="inline-flex items-center justify-center px-8 py-4 font-semibold rounded-md text-white bg-blue-600 border border-blue-600 no-underline hover:bg-blue-700 transition-all">
                    Start Your Free Trial
                </a>
                <a href="#"
                    className="inline-flex items-center justify-center px-8 py-4 font-semibold rounded-md text-blue-600 bg-white border border-blue-600 no-underline hover:bg-gray-50 transition-all">
                    Watch Demo
                </a>
            </div>
        </div>
        <div className="w-full aspect-video bg-gray-100 rounded-xl border border-gray-200 overflow-hidden shadow-2xl">
            <img src="./Images/image.jpg"
                alt="Dashboard Preview" className="w-full h-full object-cover" />
        </div>
    </section>

    {/* Features */}
    <section id="features" className="bg-white px-8 py-24 text-center">
        <h2 className="text-5xl text-gray-900 mb-16 font-bold">
            Everything you need to run your business
        </h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
            <div
                className="text-left p-8 bg-white border border-gray-200 rounded-xl hover:border-blue-600 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <h3 className="text-xl mb-3 text-gray-900 font-semibold">Project Planning</h3>
                <p className="text-gray-600 leading-relaxed">
                    Create detailed project plans, assign tasks, and set milestones with our intuitive interface.
                </p>
            </div>
            <div
                className="text-left p-8 bg-white border border-gray-200 rounded-xl hover:border-blue-600 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl mb-3 text-gray-900 font-semibold">Time Tracking</h3>
                <p className="text-gray-600 leading-relaxed">
                    Track time spent on tasks effortlessly and generate accurate timesheets for billing.
                </p>
            </div>
            <div
                className="text-left p-8 bg-white border border-gray-200 rounded-xl hover:border-blue-600 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl mb-3 text-gray-900 font-semibold">Invoicing & Billing</h3>
                <p className="text-gray-600 leading-relaxed">
                    Convert project hours into professional invoices and get paid faster with integrated payments.
                </p>
            </div>
        </div>
    </section>

    {/* Dark Footer */}
    <footer className="bg-gray-800 text-gray-300 px-8 py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
            <div>
                <h4 className="text-white text-lg mb-6 font-semibold">Contact Us</h4>
                <ul className="list-none space-y-4">
                    <li>+91 981-555-1234</li>
                    <li>hello@oneflow.com</li>
                    <li>123 Business Ave, Tech City</li>
                </ul>
            </div>
            <div>
                <h4 className="text-white text-lg mb-6 font-semibold">Company</h4>
                <ul className="list-none space-y-4">
                    <li><a href="#" className="text-gray-300 no-underline hover:text-white transition-colors">About
                            Us</a></li>
                    <li><a href="#"
                            className="text-gray-300 no-underline hover:text-white transition-colors">Careers</a></li>
                    <li><a href="#" className="text-gray-300 no-underline hover:text-white transition-colors">Blog</a>
                    </li>
                    <li><a href="#"
                            className="text-gray-300 no-underline hover:text-white transition-colors">Contact</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white text-lg mb-6 font-semibold">Resources</h4>
                <ul className="list-none space-y-4">
                    <li><a href="#"
                            className="text-gray-300 no-underline hover:text-white transition-colors">Features</a></li>
                    <li><a href="#"
                            className="text-gray-300 no-underline hover:text-white transition-colors">Pricing</a></li>
                    <li><a href="#" className="text-gray-300 no-underline hover:text-white transition-colors">Help
                            Center</a></li>
                    <li><a href="#" className="text-gray-300 no-underline hover:text-white transition-colors">API
                            Docs</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white text-lg mb-6 font-semibold">Legal</h4>
                <ul className="list-none space-y-4">
                    <li><a href="#" className="text-gray-300 no-underline hover:text-white transition-colors">Privacy
                            Policy</a></li>
                    <li><a href="#" className="text-gray-300 no-underline hover:text-white transition-colors">Terms of
                            Service</a></li>
                    <li><a href="#"
                            className="text-gray-300 no-underline hover:text-white transition-colors">Security</a></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-700 text-center text-gray-500">
            &copy; 2025 OneFlow. All rights reserved.
        </div>
    </footer>
</div>
);
}