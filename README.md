# SV5T Evaluation System

A web-based system to support students in self-evaluating, tracking, and improving their eligibility for the “Sinh viên 5 Tốt” title.

---

## 📌 Project Overview

The SV5T Evaluation System is designed to help students:
- Self-assess their current status based on official SV5T criteria
- Identify missing or improvable criteria
- Receive guidance on how to improve their profile
- Submit evidence for achievements and activities

At the same time, the system provides administrators with tools to:
- Monitor student progress
- Review submitted evidence
- Manage and publish relevant activities and events

---

## 🎯 Objectives

- Standardize the self-evaluation process for “Sinh viên 5 Tốt”
- Increase transparency in student progress tracking
- Support students with data-driven insights and visual feedback
- Assist administrators in managing evaluation data efficiently

---

## 🚀 Features

### 👨‍🎓 Student Side
- Personal information input (Full name, Student ID, Class, Faculty, Email)
- Self-evaluation based on SV5T criteria
- Automatic calculation of completion percentage
- Radar chart visualization of evaluation results
- Achievement and evidence submission (multiple criteria, multiple images)
- Recommendations on how to improve incomplete criteria
- Login to save evaluation results (Student ID or Google login)

### 🛠️ Admin Side
- Secure admin authentication
- Student list management with filtering options
- Review and approval of submitted evidence
- Event and activity management
- Overview of students with high completion potential
- Export data to Excel for backup and reporting purposes

---

## 🧠 Evaluation Logic

- **Hard criteria:** Mandatory criteria required for SV5T eligibility  
- **Soft criteria:** Optional criteria that enhance the profile but do not affect the core eligibility score  

The system calculates the completion percentage based on hard criteria, while soft criteria are used for recommendations and guidance.

---

## 📊 Data Visualization

- Radar charts are used to display student performance across all SV5T criteria
- Visual feedback helps students quickly identify strengths and weaknesses

---

## 🛠️ Technology Stack

### Frontend
- **React.js** – User interface development
- **TypeScript** – Type-safe logic and data structures
- **Tailwind CSS** – Responsive and modern UI design
- **Lucide Icons** – SVG icons for UI clarity
- **Recharts** – Data visualization and charts
- **Vite** – Fast build and development tool

### Data Storage
- **Local Storage (HTML5 Web Storage API)** – Client-side data persistence

### Development Tools
- **Visual Studio Code**
- **Git & GitHub**
- **Postman**

---

## 🔐 Access Control

- Role-based access control (RBAC) is implemented
- Two main roles:
  - **Student**
  - **Administrator**

Only authorized administrators can access the management dashboard.

---

## 📁 Project Structure

```txt
src/
 ├── components/
 ├── pages/
 ├── services/
 ├── utils/
 ├── types/
 └── assets/
