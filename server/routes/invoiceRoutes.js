const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { createInvoice, getInvoiceById, getAllInvoices, getUserInvoices, downloadInvoicePDF, updatePaymentStatus, updateInvoice } = require("../controllers/invoiceController");

router.post("/create", protect, adminOnly, createInvoice);
router.get("/all", protect, adminOnly, getAllInvoices);
router.get("/my-invoices", protect, getUserInvoices);
router.get("/pdf/:id", protect, downloadInvoicePDF);
router.get("/:id", protect, getInvoiceById);
router.put("/:id/payment", protect, adminOnly, updatePaymentStatus);
router.put("/:id", protect, adminOnly, updateInvoice);

module.exports = router;
