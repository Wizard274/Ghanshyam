import React from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";
import "../styles/home.css";

const services = [
  { icon: "fa-shirt", name: "Blouse Stitching", desc: "Beautifully crafted blouses for all occasions" },
  { icon: "fa-wand-sparkles", name: "Chaniya Choli", desc: "Traditional Gujarati outfits with modern flair" },
  { icon: "fa-star", name: "Designer Dresses", desc: "Unique designs tailored to your style" },
  { icon: "fa-scissors", name: "Alterations", desc: "Perfect fit alterations for any garment" },
  { icon: "fa-crown", name: "Gown & Lehenga", desc: "Elegant evening & bridal wear" },
  { icon: "fa-heart", name: "Salwar Kameez", desc: "Classic and contemporary salwar styles" },
];

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="public-navbar">
        <div className="nav-brand">
          ઘનશ્યામ Ladies Tailor
          <span>Precision and Perfection in Every Stitch</span>
        </div>
        <div className="nav-links">
          <a href="#services" className="nav-link">Services</a>
          <a href="#contact" className="nav-link">Contact</a>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Order Online</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-bg-pattern" />
        <div className="hero-content">
          <div className="hero-badge"><i className="fa-solid fa-scissors" /> Ladies Tailoring Specialists</div>
          <h1 className="hero-title">
            <span className="gujarati-name">ઘનશ્યામ</span>
            <span className="english-name">Ladies Tailor</span>
          </h1>
          <p className="hero-tagline">Precision and Perfection in Every Stitch</p>
          <p className="hero-desc">
            Where traditional craftsmanship meets modern design. We bring your dream outfits to life
            with precision tailoring and personal attention to detail.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-scissors" /> Order Online
            </Link>
            <a href="#services" className="btn btn-outline btn-lg">View Services</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span>500+</span><small>Happy Customers</small></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span>10+</span><small>Years Experience</small></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span>1000+</span><small>Orders Stitched</small></div>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="deco-circle deco-1" />
          <div className="deco-circle deco-2" />
          <div className="deco-circle deco-3" />
          <div className="deco-icon-grid">
            {["fa-scissors","fa-star","fa-heart","fa-crown","fa-wand-sparkles","fa-shirt"].map((ic, i) => (
              <div key={i} className="deco-icon"><i className={`fa-solid ${ic}`} /></div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="services-section" id="services">
        <div className="section-wrap">
          <div className="section-header">
            <div className="section-label">What We Do</div>
            <h2 className="section-title-h2">Our Tailoring Services</h2>
            <p className="section-subtitle">Crafted with love and sewn with precision for every occasion</p>
          </div>
          <div className="services-grid">
            {services.map((s, i) => (
              <div className="service-card" key={i}>
                <div className="service-icon"><i className={`fa-solid ${s.icon}`} /></div>
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="services-cta">
            <Link to="/register" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-plus" /> Start Your Order
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="howto-section">
        <div className="section-wrap">
          <div className="section-header">
            <div className="section-label">Process</div>
            <h2 className="section-title-h2">How It Works</h2>
          </div>
          <div className="steps-row">
            {[
              { n: "01", icon: "fa-user-plus", title: "Register", desc: "Create your free account with email verification" },
              { n: "02", icon: "fa-ruler", title: "Share Measurements", desc: "Enter your measurements when placing order" },
              { n: "03", icon: "fa-scissors", title: "We Stitch", desc: "Our expert tailors craft your outfit with care" },
              { n: "04", icon: "fa-truck", title: "Pickup Ready", desc: "Get notified when your order is ready for pickup" },
            ].map((s, i) => (
              <div className="step-item" key={i}>
                <div className="step-num">{s.n}</div>
                <div className="step-icon"><i className={`fa-solid ${s.icon}`} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="contact-section" id="contact">
        <div className="section-wrap">
          <div className="section-header">
            <div className="section-label">Find Us</div>
            <h2 className="section-title-h2">Contact Us</h2>
          </div>
          <div className="contact-grid">
            <div className="contact-info-cards">
              {[
                { icon: "fa-phone", title: "Phone", value: "+91 8160942724" },
                { icon: "fa-location-dot", title: "Address", value: "Shop no:-21, Gigev Park, Opposite Uttamnagar, Ratanpark Road, Bapunagar, Ahmedabad." },
                { icon: "fa-clock", title: "Hours", value: "Mon–Sat: 9:00 AM – 8:00 PM" },
                { icon: "fa-envelope", title: "Email", value: "ghanshyamtailor@gmail.com" },
              ].map((c, i) => (
                <div className="contact-card" key={i}>
                  <div className="contact-card-icon"><i className={`fa-solid ${c.icon}`} /></div>
                  <div>
                    <div className="contact-card-title">{c.title}</div>
                    <div className="contact-card-value">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="contact-map-placeholder">
              <i className="fa-solid fa-map-location-dot" />
              <p>ઘનશ્યામ Ladies Tailor</p>
              <small>Shop no:-21, Gigev Park, Opposite Uttamnagar, Ratanpark Road, Bapunagar, Ahmedabad., City, Gujarat</small>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-name">ઘનશ્યામ Ladies Tailor</div>
            <div className="footer-tagline">Precision and Perfection in Every Stitch</div>
          </div>
          <div className="footer-links">
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
          <div className="footer-copy">© 2026 ઘનશ્યામ Ladies Tailor. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
