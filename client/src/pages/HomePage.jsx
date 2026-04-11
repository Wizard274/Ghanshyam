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
            {["fa-scissors", "fa-star", "fa-heart", "fa-crown", "fa-wand-sparkles", "fa-shirt"].map((ic, i) => (
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
                { icon: "fa-phone", title: "Phone", value: "+91 8160942724", href: "tel:+918160942724" },
                { icon: "fa-location-dot", title: "Address", value: "Shop no:-21, Gigev Park, Opposite Uttamnagar, Ratanpark Road, Bapunagar, Ahmedabad." },
                { icon: "fa-clock", title: "Hours", value: "Mon–Sat: 9:00 AM – 8:00 PM" },
                { icon: "fa-envelope", title: "Email", value: "ghanshyamladiestailor21@gmail.com", href: "https://mail.google.com/mail/?view=cm&to=ghanshyamladiestailor21@gmail.com", external: true },
              ].map((c, i) => {
                const CardInner = (
                  <div className="contact-card" key={c.href ? undefined : i}>
                    <div className="contact-card-icon"><i className={`fa-solid ${c.icon}`} /></div>
                    <div>
                      <div className="contact-card-title">{c.title}</div>
                      <div className="contact-card-value">{c.value}</div>
                    </div>
                  </div>
                );

                return c.href ? (
                  <a 
                    key={i} 
                    href={c.href} 
                    target={c.external ? "_blank" : undefined} 
                    rel={c.external ? "noopener noreferrer" : undefined}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                  >
                    {CardInner}
                  </a>
                ) : (
                  CardInner
                );
              })}
            </div>
            <a 
              href="https://maps.app.goo.gl/XZeSgfFq1Z2iLcbY6"
              target="_blank"
              rel="noopener noreferrer"
              className="card contact-map-link"
              style={{ 
                padding: 0, 
                overflow: "hidden", 
                display: "flex", 
                flexDirection: "column", 
                textDecoration: "none", 
                transition: "transform 0.2s, box-shadow 0.2s" 
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              }}
            >
              <div style={{ width: "100%", height: "220px", background: "#f0f0f0", position: "relative" }}>
                <iframe 
                  title="Ghanshyam Ladies Tailor Location"
                  src="https://maps.google.com/maps?q=Gigev%20Park,%20Bapunagar,%20Ahmedabad&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                  style={{ border: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div style={{ padding: "20px" }}>
                <h3 style={{ margin: "0 0 8px 0", color: "var(--primary)", fontSize: "16px", fontFamily: "var(--font-display)" }}>
                  <i className="fa-solid fa-map-location-dot" style={{ marginRight: "8px" }}/>
                  ઘનશ્યામ Ladies Tailor
                </h3>
                <p style={{ margin: "0 0 16px 0", color: "var(--text-gray)", fontSize: "13px", lineHeight: "1.5" }}>
                  Shop no:-21, Gigev Park, Opposite Uttamnagar, Ratanpark Road, Bapunagar, Ahmedabad, Gujarat.
                </p>
                <div style={{ color: "var(--text-dark)", fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                  Get directions <i className="fa-solid fa-arrow-right" style={{ color: "var(--primary)" }} />
                </div>
              </div>
            </a>
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
