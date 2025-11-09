======================================================
Video File link :-
https://drive.google.com/file/d/1_bGT82zA03LMCJApuE156Xg1xdMhcTkh/view?usp=sharing
======================================================

OneFlow Hackathon Project
# 🧩 OneFlow — Plan to Bill in One Place

### 🚀 Full-Stack Application (MERN)  
> Manage Projects, Tasks, Timesheets, Billing, Analytics, and more — all in one flow.

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Testing APIs (Hoppscotch / Postman)](#-testing-apis-hoppscotch--postman)
- [Default Admin Credentials](#-default-admin-credentials)
- [Screenshots](#-screenshots)
- [Team Members](#-team-members)
- [License](#-license)

---

## 🧠 About the Project

**OneFlow** is an integrated system designed to handle the complete workflow of a company —  
from planning projects, managing tasks, tracking time, to generating invoices and analyzing performance.  

This project was built for the **Hackathon Challenge: “Plan to Bill in One Place”**.

---

## 🧰 Tech Stack

### 💻 Backend
- Node.js + Express.js
- MongoDB + Mongoose ORM
- JWT Authentication
- bcrypt for password hashing
- Nodemailer (for OTP and password reset)
- Helmet + Morgan + CORS for security and logging

### 🖥️ Frontend
- React.js (Vite)
- Tailwind CSS
- Axios for API requests
- React Router DOM
- jsPDF for document exports
- Toastify for notifications

---

## 🏗️ System Architecture

```text
Frontend (React)
       ↓
Backend API (Node + Express)
       ↓
Database (MongoDB)

Roles:


Admin → full control, manages roles and billing


Manager → manages projects, tasks, and teams


Team Member → submits tasks and timesheets



🌟 Key Features
ModuleFeaturesAuthenticationSignup / Login / JWT Token / Role-based accessAdmin PanelManage users, update roles, delete accountsProjectsCRUD operations for projectsTasksAssign tasks to members, track progressTimesheetsLog hours, update work entriesBillingManage sales orders, purchase orders, invoices, vendor bills, and expensesAnalyticsProject & financial summariesDashboardSeparate dashboards for Admin, Manager, and Team

📁 Project Structure
OneFlow-Hackathon/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   ├── Timesheet.js
│   │   ├── Invoice.js
│   │   ├── VendorBill.js
│   │   ├── Expense.js
│   │   └── SalesOrder.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── timesheetRoutes.js
│   │   ├── billingRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── dashboardRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── utils/
│   │   ├── emailService.js
│   │   └── generateOTP.js
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── App.jsx
│   ├── public/
│   └── vite.config.js
│
└── README.md


⚙️ Installation
1️⃣ Clone Repository
git clone https://github.com/Jenil05-web/OneFlow-Hackathon.git
cd OneFlow-Hackathon

2️⃣ Backend Setup
cd backend
npm install
npm run dev

3️⃣ Frontend Setup
cd ../frontend
npm install
npm run dev


🔑 Environment Variables
Create a .env file inside /backend folder:
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/oneflow
JWT_SECRET=supersecretkey
FRONTEND_URL=http://localhost:5173

# Default Admin
DEFAULT_ADMIN_EMAIL=admin@gmail.com
DEFAULT_ADMIN_PASSWORD=admin1234

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=yourapppassword
SMTP_FROM="OneFlow <no-reply@oneflow.com>"


🧩 API Overview
CategoryBase URLDescriptionAuth/api/authSignup / Login / ProfileAdmin/api/adminManage users and rolesProjects/api/projectsProject CRUD operationsTasks/api/tasksManage tasksTimesheets/api/timesheetsLog work and track timeBilling/api/billingSales, Purchase, Invoice, Vendor, ExpenseAnalytics/api/analyticsProject and financial summaryDashboard/api/dashboardRole-based dashboards

🧪 Testing APIs (Hoppscotch / Postman)
Base URL:
http://localhost:5000/api

Example Flow:


POST /auth/signup
→ register a new user


POST /auth/login
→ get JWT token


Use token in all future requests:
Authorization: Bearer <token>



Test Admin routes (using admin@gmail.com)



👑 Default Admin Credentials
Email: admin@gmail.com
Password: admin1234

Admin can:


View all users


Assign roles (Admin / Manager / Team)


Delete accounts



🖼️ Screenshots (Optional)
ModulePreviewLogin PageDashboardProjects

👥 Team Members
NameRoleRavi VataliyaFull-Stack DeveloperJenil JoshiFrontend Developer[Add Others]Backend / Design / QA

📜 License
This project is open-source and available under the MIT License.

💬 Contact
For support or questions, reach out at:
📧 Email: oneflow.team@gmail.com
🌐 GitHub: https://github.com/Jenil05-web/OneFlow-Hackathon


