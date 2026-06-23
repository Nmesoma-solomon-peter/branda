# Branda - Brand Management Platform

[[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](https://github.com/Nmesoma-solomon-peter/branda)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green.svg)](https://www.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-green.svg)](https://reactjs.org/)

---

## About Branda

Branda is a two-sided platform that connects small business owners (SMEs) in Aba, Nigeria, with professional brand designers. Currently, SMEs struggle to find affordable, reliable designers for their branding needs. Designers struggle to find consistent, paying clients. Branda solves both problems.

### The Problem

| Problem | Impact |
|---------|--------|
| **Expensive** | Professional design agencies charge high fees SMEs cannot afford |
| **Fragmented** | No central place to find designers. Business owners rely on WhatsApp and Facebook |
| **No Quality Guarantee** | No system to ensure quality work. No recourse if something goes wrong |

**Result:** 85% of SMEs in Aba have no professional brand identity.

### Our Solution

| For SMEs | For Designers |
|----------|---------------|
| Find trusted designers easily | Find paying clients easily |
| Get logos and brand assets at affordable prices | Get paid for design work |
| Central place to manage brand files | Build a portfolio of work |
| Quality guarantee and dispute resolution | Receive clear project requirements |

---

## MVP Features

| Category | Features |
|----------|----------|
| **User Management** | Registration, Login, Role Selection (SME/Specialist/Admin) |
| **SME Features** | Create Project, Dashboard, Upload Reference Images, Download Assets |
| **Specialist Features** | Dashboard, View Projects, Upload Design Files, Update Status |
| **Project Management** | CRUD Operations, Status Tracking (Active → In Review → Completed) |
| **File Management** | Upload, View, Download Images and Design Files |
| **Security** | JWT Authentication, Password Hashing, HTTPS |
| **Responsive** | Mobile-Responsive Web Design |

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React.js | 18.x |
| **Backend** | Node.js + Express.js | 22.x |
| **Database** | MongoDB | 7.0+ |
| **ODM** | Mongoose | Latest |
| **Authentication** | JWT + bcrypt | Latest |
| **File Upload** | Multer | Latest |
| **Styling** | CSS3 | - |
| **Version Control** | Git + GitHub | - |

---

## Project Structure
branda/
├── backend/
│ ├── server.js # Main server file
│ ├── package.json # Backend dependencies
│ ├── .env # Environment variables
│ ├── models/
│ │ ├── User.js # User model (SME/Specialist)
│ │ ├── Project.js # Project model
│ │ ├── Asset.js # File upload model
│ │ └── Subscription.js # Waitlist subscribers
│ ├── routes/
│ │ ├── auth.js # Authentication routes
│ │ ├── projects.js # Project CRUD routes
│ │ ├── uploads.js # File upload routes
│ │ └── subscribers.js # Waitlist routes
│ ├── middleware/
│ │ └── auth.js # JWT verification middleware
│ └── uploads/ # Stored files directory
│
├── frontend/
│ ├── public/
│ │ └── index.html # Main HTML
│ ├── src/
│ │ ├── App.js # Main React component
│ │ ├── App.css # Styling
│ │ ├── index.js # Entry point
│ │ └── components/
│ │ ├── Auth.js # Login/Register forms
│ │ ├── Dashboard.js # User dashboard
│ │ ├── Projects.js # Project management
│ │ └── Uploads.js # File upload component
│ └── package.json # Frontend dependencies
│
├── docs/
│ └── branda.md # Complete platform specification
├── README.md # This file
├── BRANDA.md # Full platform documentation
└── backup-branda.sh # Database backup script

Thanks!
