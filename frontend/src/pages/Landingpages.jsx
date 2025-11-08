import React, { useState } from 'react';
import { Menu, X, CheckCircle, ListTodo, BarChart3, PieChart, ArrowRight } from 'lucide-react';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="font-sans text-gray-900 bg-white">
      {/* === NAVBAR === */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="#" className="flex items-center gap-2 text-2xl font-bold text-gray-900 no-underline">
            <span className="text-blue-600">
              <PieChart size={28} strokeWidth={2.5} />
            </span>
            OneFlow
          </a>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex list-none gap-10 items-center">
            <li><a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a></li>
            <li><a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Pricing</a></li>
            <li><a href="#testimonials" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Testimonials</a></li>
            <li><a href="#blog" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Blog</a></li>
          </ul>

          <div className="hidden md:flex items-center gap-4">
            <a href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 hover:-translate-y-0.5 transition-all no-underline">
              Login / SignUp
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={toggleMenu} className="md:hidden text-gray-700 focus:outline-none">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav Links */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg py-4 flex flex-col items-center gap-4 border-t border-gray-100">
            <a href="#features" onClick={toggleMenu} className="text-gray-600 hover:text-blue-600 font-medium py-2">Features</a>
            <a href="#pricing" onClick={toggleMenu} className="text-gray-600 hover:text-blue-600 font-medium py-2">Pricing</a>
            <a href="#testimonials" onClick={toggleMenu} className="text-gray-600 hover:text-blue-600 font-medium py-2">Testimonials</a>
            <a href="#blog" onClick={toggleMenu} className="text-gray-600 hover:text-blue-600 font-medium py-2">Blog</a>
             <a href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all no-underline mt-2">
              Login / SignUp
            </a>
          </div>
        )}
      </nav>

      {/* === HERO SECTION === */}
      <header className="bg-blue-50 px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              OneFlow. <br /> Plan, Execute & Bill. <br /> All In One Place
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Streamline Projects, Maximize Profitability, Unify Your Workflow
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a href="#" className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-center no-underline">
                Start Your Free Trial
              </a>
              <a href="#" className="bg-transparent text-gray-800 px-8 py-4 rounded-lg font-semibold border border-gray-300 hover:bg-gray-100 hover:-translate-y-0.5 transition-all text-center no-underline flex items-center justify-center gap-2">
                Watch Demo
              </a>
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center">
            {/* Placeholder for Laptop Image - Replace src with your actual image path */}
            <img 
              src="https://placehold.co/600x400/e2e8f0/1e293b?text=Dashboard+Preview" 
              alt="OneFlow platform dashboard" 
              className="max-w-full h-auto rounded-xl shadow-2xl"
            />
          </div>
        </div>
      </header>

      {/* === FEATURES SECTION === */}
      <section id="features" className="px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">Everything you need</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-full mb-6 text-blue-600">
                <ListTodo size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Project Planning</h3>
              <p className="text-gray-600 leading-relaxed">Clearly plan all your projects from start to finish with our easy-to-use tools.</p>
            </div>
            {/* Feature Card 2 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-full mb-6 text-blue-600">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Task Management</h3>
              <p className="text-gray-600 leading-relaxed">Organize every task, set deadlines, and assign them to your team members easily.</p>
            </div>
            {/* Feature Card 3 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-full mb-6 text-blue-600">
                 <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Analytics</h3>
              <p className="text-gray-600 leading-relaxed">Track progress with live data and reports on your project's performance.</p>
            </div>
             {/* Feature Card 4 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-full mb-6 text-blue-600">
                <PieChart size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Unified Workflow</h3>
               <p className="text-gray-600 leading-relaxed">Connect all your tools and processes in one single, streamlined dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* === FOOTER SECTION === */}
      <footer className="bg-gray-50 px-8 py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-gray-600 mb-2">+1 (800) 555-1234</p>
            <p className="text-gray-600 mb-2">+1 (800) 555-5678</p>
            <a href="mailto:hello@oneflow.com" className="text-gray-600 hover:text-blue-600 transition-colors">hello@oneflow.com</a>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors no-underline">About Us</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors no-underline">Careers</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors no-underline">Blog</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors no-underline">Contact</a>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors no-underline">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors no-underline">Pricing</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors no-underline">Help Center</a>
            <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors no-underline">Testimonials</a>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <form className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button type="submit" className="bg-gray-900 text-white p-3 rounded-lg font-medium hover:bg-black transition-colors">
                Subscribe
              </button>
            </form>
            <p className="text-sm text-gray-500 mt-4">
              Join our newsletter for the latest updates.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-200 text-center text-gray-500">
          &copy; {new Date().getFullYear()} OneFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;