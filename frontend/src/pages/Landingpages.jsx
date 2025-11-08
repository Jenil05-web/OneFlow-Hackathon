import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import "./LandingPage.css";

export default function OneFlowLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">OneFlow</span>
          </Link>

          <div className={`nav-menu ${mobileMenuOpen ? "open" : ""}`}>
            <button
              className="nav-link-button"
              onClick={() => scrollToSection("features")}
            >
              Features
            </button>
            <button
              className="nav-link-button"
              onClick={() => scrollToSection("pricing")}
            >
              Pricing
            </button>
            <Link to="/login" className="nav-link-button">
              Login
            </Link>
            <ThemeToggle />
            <Link to="/signup" className="nav-cta">
              Get Started
            </Link>
          </div>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={mobileMenuOpen ? "open" : ""}></span>
            <span className={mobileMenuOpen ? "open" : ""}></span>
            <span className={mobileMenuOpen ? "open" : ""}></span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">✨</span>
              <span>Plan to Bill in One Place</span>
            </div>
            <h1 className="hero-title">
              Streamline Your Projects
              <span className="gradient-text"> from Start to Finish</span>
            </h1>
            <p className="hero-description">
              The all-in-one project management platform that helps you plan,
              execute, track time, and bill clients seamlessly. Built for teams
              who value efficiency and profitability.
            </p>
            <div className="hero-cta">
              <Link to="/signup" className="btn-primary-large">
                Start Free Trial
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/login" className="btn-secondary-large">
                Watch Demo
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number"></div>
                <div className="stat-label"></div>
              </div>
              <div className="stat-item">
                <div className="stat-number"></div>
                <div className="stat-label"></div>
              </div>
              <div className="stat-item">
                <div className="stat-number"></div>
                <div className="stat-label"></div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-wrapper">
              <img
                src="/Images/image.png"
                alt="OneFlow Dashboard Preview"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop";
                }}
              />
              <div className="image-overlay"></div>
            </div>
          </div>
        </div>
        <div className="hero-background"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              Everything You Need to{" "}
              <span className="gradient-text">Run Your Business</span>
            </h2>
            <p className="section-description">
              Powerful features designed to streamline your workflow and
              maximize profitability
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="feature-title">Project Planning</h3>
              <p className="feature-description">
                Create detailed project plans, assign tasks, set milestones, and
                track progress with our intuitive Kanban board interface.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="feature-title">Time Tracking</h3>
              <p className="feature-description">
                Track time spent on tasks effortlessly and generate accurate
                timesheets for billing. Automatic time logging and detailed
                reports.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="feature-title">Invoicing & Billing</h3>
              <p className="feature-description">
                Convert project hours into professional invoices and get paid
                faster with integrated payment tracking and automated reminders.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h3 className="feature-title">Team Collaboration</h3>
              <p className="feature-description">
                Work seamlessly with your team. Assign tasks, share updates, and
                collaborate in real-time with role-based access control.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 3h18v18H3zM3 9h18M9 3v18" />
                </svg>
              </div>
              <h3 className="feature-title">Analytics & Reports</h3>
              <p className="feature-description">
                Get insights into project performance, team productivity, and
                financial metrics with comprehensive analytics dashboards.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="feature-title">Secure & Reliable</h3>
              <p className="feature-description">
                Enterprise-grade security with encrypted data, regular backups,
                and 99.9% uptime guarantee. Your data is safe with us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Transform Your Workflow?</h2>
          <p className="cta-description">
            Join thousands of teams already using OneFlow to streamline their
            projects
          </p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn-primary-large">
              Start Free Trial
            </Link>
            <Link to="/login" className="btn-secondary-large">
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-column">
              <div className="footer-logo">
                <span className="logo-icon">⚡</span>
                <span className="logo-text">OneFlow</span>
              </div>
              <p className="footer-description">
                Plan, execute, and bill all in one place. The modern project
                management platform for teams.
              </p>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Product</h4>
              <ul className="footer-links">
                <li>
                  <button onClick={() => scrollToSection("features")}>
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("pricing")}>
                    Pricing
                  </button>
                </li>
                <li>
                  <Link to="/login">Demo</Link>
                </li>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Company</h4>
              <ul className="footer-links">
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Legal</h4>
              <ul className="footer-links">
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 OneFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
