# ઘનશ્યામ Ladies Tailor — Tailor Management System

**Precision and Perfection in Every Stitch**

A complete MERN Stack (MongoDB, Express, React, Node.js) Tailor Management SaaS platform with Admin and Customer panels.

---

## ✨ Features

### 👤 Customer Panel
- OTP-based registration & login via email
- Place tailoring orders with design image upload
- Add/edit measurements per order (editable only in Pending stage)
- Track order status in real-time (Pending → Cutting → Stitching → Ready → Delivered)
- View and download PDF invoices
- Contact the tailor via built-in messaging
- Manage profile & change password

### 🔧 Admin Panel
- Full dashboard with order stats & charts
- Manage all customers
- Create walk-in orders on behalf of customers
- Update order status with notes & price
- View per-customer measurements
- Generate and edit invoices manually
- Update payment status (Pending / Paid / Partial)
- Read customer messages with WhatsApp/call links

### 🔒 Security
- JWT authentication (7-day expiry)
- bcryptjs password hashing
- OTP expiry (5 minutes)
- Protected routes for admin and user
- Environment variable configuration

---

## 🗂️ Project Structure

```
ghanshyam-tailor-system/
├── server/                  # Express + Node.js backend
│   ├── controllers/         # Business logic
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API route definitions
│   ├── middleware/          # JWT auth middleware
│   ├── utils/               # OTP email & PDF generation
│   ├── uploads/             # Uploaded design images
│   ├── server.js            # Entry point
│   └── .env.example         # Environment template
│
├── client/                  # React frontend
│   └── src/
│       ├── admin/           # All admin pages
│       ├── user/            # All customer pages
│       ├── pages/           # Public pages (Home)
│       ├── components/      # Shared layouts (Sidebar, Navbar)
│       ├── services/        # Axios API service
│       └── styles/          # Global CSS, forms, dashboard
│
└── package.json             # Root with concurrent scripts
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Gmail account for OTP emails

### 1. Clone & Install

```bash
# Install root dependencies
npm install

# Install all server + client dependencies at once
npm run install-all
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ghanshyam_tailor
JWT_SECRET=your_strong_secret_key_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:3000
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App passwords → Generate one for "Mail"

### 3. Create Admin Account

After starting the server, run this in a separate terminal to seed an admin user:

```bash
cd server
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/userModel');
  const existing = await User.findOne({ email: 'admin@tailor.com' });
  if (existing) { console.log('Admin already exists'); process.exit(0); }
  const hashed = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Ghanshyam Admin',
    phone: '8160942724',
    email: 'admin@tailor.com',
    password: hashed,
    role: 'admin',
    isVerified: true,
    address: 'Shop Address'
  });
  console.log('✅ Admin created: admin@tailor.com / admin123');
  process.exit(0);
});
"
```

### 4. Start Development

```bash
# From the root directory — starts both server and client
npm run dev
```

Or start separately:
```bash
npm run server   # Backend on http://localhost:5000
npm run client   # Frontend on http://localhost:3000
```

---

## 🔗 Application URLs

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Public homepage |
| `http://localhost:3000/register` | Customer registration |
| `http://localhost:3000/login` | Login (customer + admin) |
| `http://localhost:3000/dashboard` | Customer dashboard |
| `http://localhost:3000/admin` | Admin dashboard |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register + send OTP |
| POST | `/api/auth/verify-otp` | Verify OTP & activate |
| POST | `/api/auth/login` | Login → returns JWT |
| POST | `/api/auth/forgot-password` | Send reset OTP |
| POST | `/api/auth/verify-reset-otp` | Verify reset OTP |
| POST | `/api/auth/reset-password` | Set new password |
| POST | `/api/auth/resend-otp` | Resend OTP |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/create` | Customer places order |
| GET | `/api/orders/my-orders` | Customer's own orders |
| GET | `/api/orders/all` | Admin: all orders |
| GET | `/api/orders/stats` | Dashboard statistics |
| GET | `/api/orders/:id` | Single order details |
| PUT | `/api/orders/:id/status` | Admin: update status |
| PUT | `/api/orders/:id/measurement` | Customer: edit measurement |
| POST | `/api/orders/admin-create` | Admin: walk-in order |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/invoices/create` | Admin: create invoice |
| GET | `/api/invoices/my-invoices` | Customer invoices |
| GET | `/api/invoices/all` | Admin: all invoices |
| GET | `/api/invoices/:id` | Invoice details |
| GET | `/api/invoices/pdf/:id` | Download PDF |
| PUT | `/api/invoices/:id/payment` | Update payment status |
| PUT | `/api/invoices/:id` | Edit invoice |

### Users & Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get my profile |
| PUT | `/api/users/update` | Update profile |
| PUT | `/api/users/change-password` | Change password |
| GET | `/api/users/customers` | Admin: all customers |
| POST | `/api/contact/send` | Send message |
| GET | `/api/contact/all` | Admin: all messages |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#8B4513` (Saddle Brown) |
| Primary Light | `#D2691E` (Chocolate) |
| Accent | `#C4941C` (Golden) |
| Font Display | Playfair Display |
| Font Body | DM Sans |
| Font Elegant | Cormorant Garamond |

---

## 📦 Tech Stack

### Backend
- **Express.js** — REST API framework
- **Mongoose** — MongoDB ODM
- **bcryptjs** — Password hashing
- **jsonwebtoken** — JWT auth
- **Nodemailer** — OTP email delivery
- **Multer** — Design image uploads
- **PDFKit** — Server-side PDF generation

### Frontend
- **React 18** — UI framework
- **React Router v6** — Client-side routing
- **Recharts** — Dashboard charts
- **Axios** — HTTP client
- **Font Awesome 6** — Icons
- **Google Fonts** — Playfair Display, DM Sans, Cormorant Garamond

---

## 📱 Responsive Design

| Screen | Layout |
|--------|--------|
| Desktop (>1024px) | Sidebar + Main Content |
| Tablet (768–1024px) | Hamburger → Collapsible Sidebar |
| Mobile (<768px) | Top Navbar + Drawer Sidebar |

---

## 🔄 Complete Order Flow

```
Customer Registers → OTP Email Verification
        ↓
    Customer Logs In (JWT)
        ↓
    Places Order (with optional measurements + design image)
        ↓
Admin views order → Updates Status (Cutting → Stitching → Ready)
        ↓
    Admin marks order "Delivered"
        ↓
  Invoice auto-generated (or admin creates manually)
        ↓
Customer views invoice → Downloads PDF
```

---

## 🚀 Production Deployment

### Backend (e.g. Railway, Render)
```bash
cd server
npm start
```
Set environment variables in your hosting dashboard.

### Frontend (e.g. Vercel, Netlify)
```bash
cd client
npm run build
```
Set `REACT_APP_API_URL` if deploying to a different domain (update `client/src/services/api.js` baseURL).

### MongoDB Atlas
Replace `MONGO_URI` with your Atlas connection string:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ghanshyam_tailor
```

---

## 📧 OTP Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail
2. Go to: Google Account → Security → App passwords
3. Select app: **Mail**, device: **Other** → Generate
4. Copy the 16-character password into `.env` as `EMAIL_PASS`

---

## 🧾 Invoice Number Format

Auto-generated sequentially:
```
INV-2026-0001
INV-2026-0002
...
```

Order numbers follow the same pattern:
```
ORD-2026-0001
ORD-2026-0002
```

---

## 👗 Supported Cloth Types

Blouse · Fancy Dress · Chaniya · Gown Dress · Shirt · Pant · Salwar · Chudidar · Lengho · Patiyala · Other (custom input)

---

## 📐 Measurement Fields

All 15 standard Gujarati ladies tailoring measurements:
`lambai` · `shoulder` · `bai` · `moli` · `chhati` · `kamar` · `sit` · `gher` · `kapo` · `galu` · `pachal_galu` · `jangh` · `jolo` · `ghutan` · `mori`

---

*© 2026 ઘનશ્યામ Ladies Tailor. Built with ❤️ using MERN Stack.*
