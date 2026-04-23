import React, { useState } from "react";
import { contactAPI } from "../services/api";
import toast from "react-hot-toast";
import "../styles/form.css";

export default function Contact() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [form, setForm] = useState({ name: user.name || "", phone: user.phone || "", message: "" });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.error(""); setLoading(true);
    try {
      const res = await contactAPI.send(form);
      toast.success("Message sent! We will contact you soon. 🙏");
      setForm({ ...form, message: "", phone: user.phone || "" });
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Contact Us</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Contact Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ background: "linear-gradient(135deg, #8B4513, #D2691E)", color: "#fff", border: "none" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              ઘનશ્યામ Ladies Tailor
            </div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontStyle: "italic", fontSize: 14 }}>
              Precision and Perfection in Every Stitch
            </div>
          </div>

          {[
            { icon: "fa-phone", title: "Phone", value: "+91 8160942724", sub: "Mon–Sat, 9AM–8PM", href: "tel:+918160942724" },
            { icon: "fa-location-dot", title: "Address", value: "Shop no:-21, Gigev Park, Opposite Uttamnagar, Ratanpark Road.", sub: " Bapunagar, Ahmedabad." },
            { icon: "fa-envelope", title: "Email", value: "ghanshyamladiestailor21@gmail.com", sub: "We reply within 24 hours", href: "https://mail.google.com/mail/?view=cm&to=ghanshyamladiestailor21@gmail.com", external: true },
            { icon: "fa-clock", title: "Working Hours", value: "Monday to Saturday", sub: "9:00 AM – 8:00 PM" },
          ].map((c) => {
            const CardInner = (
              <div key={c.href ? undefined : c.title} className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, background: "var(--primary)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className={`fa-solid ${c.icon}`} style={{ color: "#fff", fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-gray)" }}>{c.value}</div>
                  <div style={{ fontSize: 12, color: "var(--text-light)" }}>{c.sub}</div>
                </div>
              </div>
            );

            return c.href ? (
              <a
                key={c.title}
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

        {/* Contact Form */}
        <div className="card">
          <div className="form-section-title"><i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }} />Send Us a Message</div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Name <span className="required">*</span></label>
              <div className="input-icon-wrap">
                <i className="input-icon fa-solid fa-user" />
                <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Phone Number <span className="required">*</span></label>
              <div className="input-icon-wrap">
                <i className="input-icon fa-solid fa-phone" />
                <input className="form-control" type="tel" placeholder="+91 99999 99999" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Message <span className="required">*</span></label>
              <textarea
                className="form-control"
                rows={5}
                placeholder="Write your message, inquiry, or feedback here..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Sending...</> : <><i className="fa-solid fa-paper-plane" /> Send Message</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
