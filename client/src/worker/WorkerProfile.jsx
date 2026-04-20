import React, { useState, useEffect } from "react";
import { userAPI } from "../services/api";
import toast from "react-hot-toast";
import "../styles/form.css";

export default function WorkerProfile() {
  const [profile, setProfile] = useState({ name: "", phone: "", address: "", email: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [tab, setTab] = useState("profile");

  useEffect(() => {
    userAPI.getProfile().then((res) => {
      const u = res.data.user;
      setProfile({ name: u.name, phone: u.phone, address: u.address || "", email: u.email });
    }).finally(() => setLoading(false));
  }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
      };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(profile);
      const updated = res.data.user;
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, name: updated.name }));
      showMsg("success", "Profile updated successfully!");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return showMsg("error", "Passwords do not match");
    if (passwords.newPassword.length < 6) return showMsg("error", "Password must be at least 6 characters");
    setChangingPass(true);
    try {
      await userAPI.changePassword(passwords);
      showMsg("success", "Password changed successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} /></div>;

  return (
    <div>
      <h1 className="page-title">My Profile</h1>

      {/* Avatar card */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, flexShrink: 0 }}>
          {profile.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>{profile.name}</div>
          <div style={{ color: "var(--text-gray)", fontSize: 14 }}>{profile.email}</div>
          <div style={{ fontSize: 12, color: "var(--primary)", background: "var(--primary-pale)", borderRadius: 20, padding: "2px 10px", display: "inline-block", marginTop: 4 }}>
            Worker Account
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--primary-pale)", borderRadius: 12, padding: 4, width: "fit-content" }}>
        {[{ key: "profile", label: "Profile Info", icon: "fa-user" }, { key: "password", label: "Change Password", icon: "fa-lock" }].map((t) => (
          <button key={t.key} className={`btn btn-sm ${tab === t.key ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab(t.key)} style={{ border: "none" }}>
            <i className={`fa-solid ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      
      {tab === "profile" ? (
        <div className="card" style={{ maxWidth: 560 }}>
          <div className="form-section-title"><i className="fa-solid fa-user" style={{ marginRight: 8 }} />Personal Information</div>
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label>Full Name <span className="required">*</span></label>
              <div className="input-icon-wrap">
                <i className="input-icon fa-solid fa-user" />
                <input className="form-control" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Phone Number <span className="required">*</span></label>
              <div className="input-icon-wrap">
                <i className="input-icon fa-solid fa-phone" />
                <input 
                  className="form-control" 
                  value={profile.phone} 
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/\\D/g, '').slice(0, 10) })} 
                  maxLength={10}
                  required 
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrap">
                <i className="input-icon fa-solid fa-envelope" />
                <input className="form-control" value={profile.email} disabled style={{ background: "var(--primary-pale)", cursor: "not-allowed" }} />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <div className="input-icon-wrap">
                <i className="input-icon fa-solid fa-location-dot" />
                <input className="form-control" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 8 }}>
              {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</> : <><i className="fa-solid fa-check" /> Save Changes</>}
            </button>
          </form>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: 560 }}>
          <div className="form-section-title"><i className="fa-solid fa-lock" style={{ marginRight: 8 }} />Change Password</div>
          <form onSubmit={handlePasswordChange}>
            {["currentPassword", "newPassword", "confirmPassword"].map((key) => (
              <div className="form-group" key={key}>
                <label>{key === "currentPassword" ? "Current Password" : key === "newPassword" ? "New Password" : "Confirm New Password"} <span className="required">*</span></label>
                <div className="input-icon-wrap">
                  <i className="input-icon fa-solid fa-lock" />
                  <input className="form-control" type="password" value={passwords[key]} onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })} required />
                </div>
              </div>
            ))}
            <button type="submit" className="btn btn-primary" disabled={changingPass} style={{ marginTop: 8 }}>
              {changingPass ? <><i className="fa-solid fa-spinner fa-spin" /> Changing...</> : <><i className="fa-solid fa-check" /> Change Password</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
