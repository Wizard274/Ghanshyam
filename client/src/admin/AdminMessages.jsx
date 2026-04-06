import React, { useState, useEffect } from "react";
import { contactAPI } from "../services/api";
import "../styles/dashboard.css";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  // Filter states
  const [dateFilter, setDateFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [filterMode, setFilterMode] = useState("single"); // "single" | "range"
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    contactAPI.getAll()
      .then((res) => {
        setMessages(res.data.messages);
        setFiltered(res.data.messages);
      })
      .finally(() => setLoading(false));
  }, []);

  // Apply filters whenever any filter value changes
  useEffect(() => {
    let list = [...messages];

    // Text search
    if (searchText.trim()) {
      const s = searchText.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(s) ||
          m.phone.includes(s) ||
          m.message.toLowerCase().includes(s)
      );
    }

    // Date filter
    if (filterMode === "single" && dateFilter) {
      list = list.filter((m) => {
        const msgDate = new Date(m.createdAt).toISOString().split("T")[0];
        return msgDate === dateFilter;
      });
    }

    if (filterMode === "range") {
      if (dateRange.from) {
        list = list.filter(
          (m) => new Date(m.createdAt) >= new Date(dateRange.from)
        );
      }
      if (dateRange.to) {
        // Include the full "to" day
        const toEnd = new Date(dateRange.to);
        toEnd.setHours(23, 59, 59, 999);
        list = list.filter((m) => new Date(m.createdAt) <= toEnd);
      }
    }

    setFiltered(list);

    // If selected message is no longer in filtered list, clear it
    if (selected && !list.find((m) => m._id === selected._id)) {
      setSelected(null);
    }
  }, [dateFilter, dateRange, filterMode, searchText, messages]);

  const clearFilters = () => {
    setDateFilter("");
    setDateRange({ from: "", to: "" });
    setSearchText("");
    setFilterMode("single");
  };

  const hasActiveFilter = dateFilter || dateRange.from || dateRange.to || searchText;

  const handleMarkRead = async (id) => {
    try {
      await contactAPI.markRead(id);
      setMessages((msgs) =>
        msgs.map((m) => (m._id === id ? { ...m, isRead: true } : m))
      );
    } catch {}
  };

  const handleSelect = (msg) => {
    setSelected(msg);
    if (!msg.isRead) handleMarkRead(msg._id);
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  // Group filtered messages by date for display
  const groupByDate = (msgs) => {
    const groups = {};
    msgs.forEach((m) => {
      const d = new Date(m.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      });
      if (!groups[d]) groups[d] = [];
      groups[d].push(m);
    });
    return groups;
  };

  const grouped = groupByDate(filtered);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Customer Messages</h1>
        {unreadCount > 0 && (
          <span className="badge badge-pending" style={{ fontSize: 13, padding: "4px 12px" }}>
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* ── Filter Bar ── */}
      <div className="card" style={{ marginBottom: 20, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>

          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 180px", minWidth: 180 }}>
            <i className="fa-solid fa-search" style={{
              position: "absolute", left: 12, top: "50%",
              transform: "translateY(-50%)", color: "var(--text-light)", fontSize: 13,
            }} />
            <input
              style={{ width: "100%", padding: "9px 12px 9px 34px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none" }}
              placeholder="Search name, phone, message..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Mode toggle */}
          <div style={{ display: "flex", background: "var(--primary-pale)", borderRadius: 10, padding: 3, gap: 2, flexShrink: 0 }}>
            {["single", "range"].map((m) => (
              <button
                key={m}
                onClick={() => { setFilterMode(m); setDateFilter(""); setDateRange({ from: "", to: "" }); }}
                className={`btn btn-sm ${filterMode === m ? "btn-primary" : "btn-ghost"}`}
                style={{ border: "none", fontSize: 12 }}
              >
                {m === "single" ? <><i className="fa-solid fa-calendar-day" /> Single Date</> : <><i className="fa-solid fa-calendar-week" /> Date Range</>}
              </button>
            ))}
          </div>

          {/* Single date picker */}
          {filterMode === "single" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 13, color: "var(--text-gray)", whiteSpace: "nowrap" }}>Date:</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ padding: "8px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none", color: "var(--text-dark)" }}
              />
            </div>
          )}

          {/* Range date picker */}
          {filterMode === "range" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <label style={{ fontSize: 13, color: "var(--text-gray)" }}>From:</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                style={{ padding: "8px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none" }}
              />
              <label style={{ fontSize: 13, color: "var(--text-gray)" }}>To:</label>
              <input
                type="date"
                value={dateRange.to}
                min={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                style={{ padding: "8px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none" }}
              />
            </div>
          )}

          {/* Clear */}
          {hasActiveFilter && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ flexShrink: 0 }}>
              <i className="fa-solid fa-times" /> Clear
            </button>
          )}
        </div>

        {/* Active filter summary */}
        {hasActiveFilter && (
          <div style={{ marginTop: 10, fontSize: 13, color: "var(--primary)", display: "flex", alignItems: "center", gap: 6 }}>
            <i className="fa-solid fa-filter" />
            Showing <strong>{filtered.length}</strong> of <strong>{messages.length}</strong> messages
            {dateFilter && <> · Date: <strong>{new Date(dateFilter).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong></>}
            {dateRange.from && <> · From: <strong>{new Date(dateRange.from).toLocaleDateString("en-IN")}</strong></>}
            {dateRange.to && <> · To: <strong>{new Date(dateRange.to).toLocaleDateString("en-IN")}</strong></>}
            {searchText && <> · Search: "<strong>{searchText}</strong>"</>}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20 }}>

          {/* Message list — grouped by date */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Messages ({filtered.length})</span>
              {filtered.length !== messages.length && (
                <span style={{ fontSize: 12, color: "var(--text-gray)" }}>filtered</span>
              )}
            </div>

            <div style={{ maxHeight: 540, overflowY: "auto" }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-gray)" }}>
                  <i className="fa-solid fa-calendar-xmark" style={{ fontSize: 32, marginBottom: 10, display: "block", opacity: 0.4 }} />
                  No messages found for this filter
                </div>
              ) : (
                Object.entries(grouped).map(([date, msgs]) => (
                  <div key={date}>
                    {/* Date group header */}
                    <div style={{
                      padding: "7px 20px", background: "var(--primary-pale)",
                      fontSize: 11, fontWeight: 700, color: "var(--primary)",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      borderBottom: "1px solid var(--primary-border)",
                      position: "sticky", top: 0, zIndex: 1,
                    }}>
                      <i className="fa-solid fa-calendar" style={{ marginRight: 6 }} />
                      {date} · {msgs.length} message{msgs.length !== 1 ? "s" : ""}
                    </div>

                    {msgs.map((msg) => (
                      <div
                        key={msg._id}
                        onClick={() => handleSelect(msg)}
                        style={{
                          padding: "13px 20px",
                          cursor: "pointer",
                          borderBottom: "1px solid var(--border)",
                          background: selected?._id === msg._id
                            ? "var(--primary-pale)"
                            : !msg.isRead ? "#FFFBF5" : "#fff",
                          borderLeft: !msg.isRead
                            ? "3px solid var(--primary)"
                            : "3px solid transparent",
                          transition: "background 0.15s",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ fontWeight: !msg.isRead ? 700 : 500, fontSize: 14, color: "var(--text-dark)" }}>
                            {msg.name}
                            {!msg.isRead && (
                              <span style={{
                                display: "inline-block", width: 7, height: 7,
                                background: "var(--primary)", borderRadius: "50%",
                                marginLeft: 7, verticalAlign: "middle",
                              }} />
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-gray)", flexShrink: 0 }}>
                            {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-gray)", marginTop: 2 }}>
                          {msg.phone}
                        </div>
                        <div style={{
                          fontSize: 13, color: "var(--text-mid)", marginTop: 4,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {msg.message}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message detail */}
          <div className="card">
            {!selected ? (
              <div className="empty-state">
                <i className="fa-solid fa-envelope-open" />
                <p>Select a message to read</p>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>
                      {selected.name}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--primary)", marginTop: 3 }}>
                      <i className="fa-solid fa-phone" style={{ marginRight: 5 }} />{selected.phone}
                    </div>
                    {selected.userId && (
                      <span className="badge badge-delivered" style={{ marginTop: 6, fontSize: 11 }}>
                        Registered Customer
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
                      {new Date(selected.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-gray)", marginTop: 2 }}>
                      {new Date(selected.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {/* Message bubble */}
                <div style={{
                  background: "var(--primary-pale)",
                  borderRadius: "4px 16px 16px 16px",
                  padding: "16px 20px",
                  fontSize: 15, lineHeight: 1.7, color: "var(--text-dark)",
                  borderLeft: "4px solid var(--primary)",
                  marginBottom: 24,
                }}>
                  {selected.message}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a
                    href={`tel:${selected.phone}`}
                    className="btn btn-primary"
                  >
                    <i className="fa-solid fa-phone" /> Call Customer
                  </a>
                  <a
                    href={`https://wa.me/91${selected.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                    style={{ background: "#25D366", color: "#fff" }}
                  >
                    <i className="fa-brands fa-whatsapp" /> WhatsApp
                  </a>
                  {!selected.isRead && (
                    <button className="btn btn-ghost" onClick={() => handleMarkRead(selected._id)}>
                      <i className="fa-solid fa-check" /> Mark as Read
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
