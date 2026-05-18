import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/navbar.css";
import "../styles/home.css";

const services = [
  { 
    images: [
      "/images/blouse/b_1.png",
      "/images/blouse/b_2.png",
      "/images/blouse/b_3.png",
      "/images/blouse/b_4.png",
      "/images/blouse/b_5.png"
    ], 
    name: "Blouse Stitching", 
    desc: "Beautifully crafted blouses for all occasions" 
  },
  { 
    images: [
      "/images/chaniya_choli/c_1.png",
      "/images/chaniya_choli/c_2.png",
      "/images/chaniya_choli/c_3.png",
      "/images/chaniya_choli/c_4.png",
      "/images/chaniya_choli/c_5.png"
    ], 
    name: "Chaniya Choli", 
    desc: "Traditional Gujarati outfits with modern flair" 
  },
  { 
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop", 
    name: "Designer Dresses", 
    desc: "Unique designs tailored to your style" 
  },
  { 
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600&auto=format&fit=crop", 
    name: "Alterations", 
    desc: "Perfect fit alterations for any garment" 
  },
  { 
    image: "https://images.unsplash.com/photo-1566207274740-0f8cf6b7d5a5?q=80&w=600&auto=format&fit=crop", 
    name: "Gown & Lehenga", 
    desc: "Elegant evening & bridal wear" 
  },
  { 
    image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop", 
    name: "Salwar Kameez", 
    desc: "Classic and contemporary salwar styles" 
  }
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const AutoImageSlider = ({ images, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <>
      {images.map((img, index) => (
        <img 
          key={index}
          src={img} 
          alt={`${alt} - ${index + 1}`} 
          className="service-image" 
          loading="lazy" 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 1s ease-in-out, transform 0.6s ease',
            zIndex: index === currentIndex ? 1 : 0
          }}
        />
      ))}
    </>
  );
};

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="public-navbar">
        <div className="nav-brand">
          ઘનશ્યામ Ladies Tailor
          <span>Precision and Perfection in Every Stitch</span>
        </div>

        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <i className={`fa-solid ${isMenuOpen ? "fa-xmark" : "fa-bars"}`} />
        </button>

        <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          <a href="#services" className="nav-link" onClick={() => setIsMenuOpen(false)}>Services</a>
          <a href="#contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</a>
          <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setIsMenuOpen(false)}>Order Online</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        {/* Background Video */}
        <div className="hero-video-wrapper">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="hero-video"
            poster="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1920&auto=format&fit=crop"
          >
            <source src="https://player.vimeo.com/external/440538833.sd.mp4?s=d7e7c90e0c0343a41ef726a4c264c1b92837bcde&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
          </video>
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="hero-badge"
          >
            <i className="fa-solid fa-scissors" /> Ladies Tailoring Specialists
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hero-title"
          >
            <span className="gujarati-name">ઘનશ્યામ</span>
            <span className="english-name">Ladies Tailor</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero-tagline"
          >
            Precision and Perfection in Every Stitch
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.8, delay: 0.5 }}
            className="hero-desc"
          >
            Where traditional craftsmanship meets modern design. We bring your dream outfits to life
            with precision tailoring and personal attention to detail.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.7 }}
            className="hero-actions"
          >
            <Link to="/register" className="btn btn-primary btn-lg pulse-effect">
              <i className="fa-solid fa-scissors" /> Order Online
            </Link>
            <a href="#services" className="btn btn-outline btn-lg">View Services</a>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 1, delay: 1 }}
            className="hero-stats"
          >
            <div className="hero-stat"><span>500+</span><small>Happy Customers</small></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span>10+</span><small>Years Experience</small></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span>1000+</span><small>Orders Stitched</small></div>
          </motion.div>
        </div>
        
        {/* Floating elements animation */}
        <div className="hero-decoration">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }} 
            className="deco-circle deco-1" 
          />
          <motion.div 
            animate={{ rotate: -360 }} 
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }} 
            className="deco-circle deco-2" 
          />
          <div className="deco-circle deco-3" />
          <div className="deco-icon-grid">
            {["fa-scissors", "fa-star", "fa-heart", "fa-crown", "fa-wand-sparkles", "fa-shirt"].map((ic, i) => (
              <motion.div 
                key={i} 
                className="deco-icon"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: i * 0.2 }}
              >
                <i className={`fa-solid ${ic}`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="services-section" id="services">
        <div className="section-wrap">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="section-header"
          >
            <div className="section-label">What We Do</div>
            <h2 className="section-title-h2">Our Tailoring Services</h2>
            <p className="section-subtitle">Crafted with love and sewn with precision for every occasion</p>
          </motion.div>
          
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="services-grid"
          >
            {services.map((s, i) => (
              <motion.div variants={fadeInUp} className="service-card image-card" key={i}>
                <div className="service-image-container">
                  {s.images ? (
                    <AutoImageSlider images={s.images} alt={s.name} />
                  ) : (
                    <img src={s.image} alt={s.name} className="service-image" loading="lazy" />
                  )}
                  <div className="service-overlay">
                    <i className="fa-solid fa-magnifying-glass-plus" />
                  </div>
                </div>
                <div className="service-content">
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={fadeInUp}
            className="services-cta"
          >
            <Link to="/register" className="btn btn-primary btn-lg pulse-effect">
              <i className="fa-solid fa-plus" /> Start Your Order
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="howto-section">
        <div className="section-wrap">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="section-header"
          >
            <div className="section-label">Process</div>
            <h2 className="section-title-h2">How It Works</h2>
          </motion.div>
          
          <div className="timeline-container">
            <div className="timeline-line"></div>
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }}
              variants={staggerContainer}
              className="timeline-row"
            >
              {[
                { n: "01", icon: "fa-user-plus", title: "Register", desc: "Create your free account with email verification" },
                { n: "02", icon: "fa-ruler", title: "Share Measurements", desc: "Enter your measurements when placing order" },
                { n: "03", icon: "fa-scissors", title: "We Stitch", desc: "Our expert tailors craft your outfit with care" },
                { n: "04", icon: "fa-truck", title: "Pickup Ready", desc: "Get notified when your order is ready for pickup" },
              ].map((s, i) => (
                <motion.div variants={fadeInUp} className="timeline-item" key={i}>
                  <div className="timeline-num-bg">{s.n}</div>
                  <div className="timeline-icon-wrap">
                    <div className="timeline-icon"><i className={`fa-solid ${s.icon}`} /></div>
                  </div>
                  <div className="timeline-content">
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="contact-section light-theme-creative" id="contact">
        <div className="contact-blob"></div>
        <div className="section-wrap">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="section-header"
          >
            <div className="section-label">Find Us</div>
            <h2 className="section-title-h2">Contact Us</h2>
          </motion.div>
          
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={fadeInUp}
            className="contact-layout-premium"
          >
            <div className="contact-info-cards">
              {[
                { icon: "fa-phone", title: "Phone", value: "+91 8160942724", href: "tel:+918160942724" },
                { icon: "fa-location-dot", title: "Address", value: "Shop no:-21, Gigev Park, Opposite Uttamnagar, Ratanpark Road, Bapunagar, Ahmedabad." },
                { icon: "fa-clock", title: "Hours", value: "Mon–Sat: 9:00 AM – 8:00 PM" },
                { icon: "fa-envelope", title: "Email", value: "ghanshyamladiestailor21@gmail.com", href: "https://mail.google.com/mail/?view=cm&to=ghanshyamladiestailor21@gmail.com", external: true },
              ].map((c, i) => {
                const CardInner = (
                  <div className="contact-card creative-light-card hover-effect" key={c.href ? undefined : i}>
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
              className="card contact-map-link premium-map hover-effect"
            >
              <div className="premium-map-inner">
                <iframe 
                  title="Ghanshyam Ladies Tailor Location"
                  src="https://maps.google.com/maps?q=Gigev%20Park,%20Bapunagar,%20Ahmedabad&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                  className="map-iframe"
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="map-footer-light">
                <h3>
                  <i className="fa-solid fa-map-location-dot" />
                  ઘનશ્યામ Ladies Tailor
                </h3>
                <p>
                  Shop no:-21, Gigev Park, Opposite Uttamnagar, Ratanpark Road, Bapunagar, Ahmedabad, Gujarat.
                </p>
                <div className="map-directions">
                  Get directions <i className="fa-solid fa-arrow-right" />
                </div>
              </div>
            </a>
          </motion.div>
        </div>
        {/* Floating Decos */}
        <div className="light-deco deco-top"><i className="fa-regular fa-envelope" /></div>
        <div className="light-deco deco-bottom"><i className="fa-solid fa-phone-volume" /></div>
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
