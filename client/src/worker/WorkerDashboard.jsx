import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { workerAPI } from "../services/api";
import toast from "react-hot-toast";

const STATUS_STEPS = ["Pending", "Cutting", "Stitching", "Ready"];
const STATUS_COLORS = { "Pending": "badge-pending", "Cutting": "badge-cutting", "Stitching": "badge-stitching", "Ready": "badge-ready" };

const WorkerDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await workerAPI.getAssignedItems();
      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (itemId, newStatus) => {
    setUpdating(itemId);
    try {
      await workerAPI.updateItemStatus(itemId, { status: newStatus });
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "var(--primary)" }} />
    </div>
  );

  return (
    <div>
      <h1 className="page-title">Assigned Work Items</h1>
      
      {items.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <i className="fa-solid fa-inbox" />
            <p>No items assigned to you currently.</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Customer</th>
                  <th>Item Details</th>
                  <th>Qty</th>
                  <th>Current Status</th>
                  <th>Instructions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--primary)" }}>{item.orderId?.orderNumber || "Unknown"}</span>
                      <div style={{ fontSize: 11, color: "var(--text-gray)" }}>{new Date(item.createdAt).toLocaleDateString("en-IN")}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.orderId?.userId?.name || "—"}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.clothType}</div>
                      <div style={{ fontSize: 11, color: "var(--text-gray)" }}>
                        {item.fabricType || "Fabric N/A"}
                        {item.customClothType ? ` (${item.customClothType})` : ""}
                      </div>
                    </td>
                    <td>{item.quantity || 1}</td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[item.status] || "badge-pending"}`}>
                        {updating === item._id ? <i className="fa-solid fa-spinner fa-spin" /> : item.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, maxWidth: 200, whiteSpace: "normal", color: "var(--text-gray)" }}>
                      {item.specialInstructions || "—"}
                    </td>
                    <td>
                      <Link to={`/worker/item/${item._id}`} className="btn btn-primary btn-sm">
                        <i className="fa-solid fa-eye" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
