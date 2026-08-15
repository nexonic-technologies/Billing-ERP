# 🍵 Tea Shop Billing & Management Application (Chai Point POS)

A modern, full-stack **Tea Shop Billing & Store Management Application** built with Node.js, Express, MySQL, React (Vite), PDFKit, and custom warm glassmorphism aesthetics.

---

## 🌟 Key Features

1. **POS Billing Station**:
   - Quick item search & category filters (Hot Chai, Iced Tea, Coffee Specialties, Snacks & Bakery).
   - Custom note support (e.g. Less Sugar, Kulhad cup, Extra Ginger).
   - Real-time billing engine: Subtotal, Discount %, 5% GST Tax calculation, and Grand Total.
   - Payment method toggle (Cash, UPI, Credit/Debit Card).
   - Customer details capture (Name, Phone number).

2. **PDF Invoices & Receipts**:
   - Printable thermal invoice receipt popup modal (Browser direct print support).
   - Server-side PDF generation (`pdfkit`) with downloadable link.

3. **Admin Dashboard & Reports**:
   - Revenue analytics: Total Revenue (₹), Total Orders, Average Ticket Value, Today's Sales.
   - Top selling tea & snack items chart.
   - Payment distribution breakdown.
   - Export full date-range Sales Report as PDF.

4. **Menu & Product Management**:
   - CRUD operations for menu items (Add new tea/snacks, edit price, update description/image URL, toggle stock availability).

5. **Security & Role-Based Access Control**:
   - JWT authentication & Bcrypt password hashing.
   - Roles: `Admin` (Full store access) and `Cashier` (Billing & order view access).

---

## 🔑 Demo Credentials

- **Admin Account**:
  - **Username**: `admin`
  - **Password**: `admin123`
- **Cashier Account**:
  - **Username**: `cashier`
  - **Password**: `cashier123`

*(Note: The login page includes 1-click demo fill buttons for quick testing)*

---

## 🚀 How to Run the Application

### 1. Prerequisites
- Node.js (v18+)
- MySQL Server (e.g., standard MySQL installation, XAMPP, or MariaDB running on `localhost:3306`)

### 2. Backend Setup
```bash
cd backend
npm install
node server.js
```
The server will automatically connect to MySQL, create the `teashop_db` database, initialize required tables, and seed initial sample tea menu items & accounts if empty!

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Custom CSS (Design tokens, glassmorphism, responsive grid), Lucide Icons.
- **Backend**: Node.js, Express.js REST API, JWT Authentication, Bcryptjs.
- **Database**: MySQL (Connection pool via `mysql2/promise`, auto-migration schema).
- **PDF Engine**: PDFKit server-side PDF stream builder.
