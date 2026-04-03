# ClusterCarbon MSME Credit Allocation System
**Fully Integrated Full-Stack Application Blueprint**

This document serves as the architectural overview for connecting the React Frontend to the Node/Express Backend. It defines where core data lives, how models interact, and where API endpoints map.

---

## 🛠️ Tech Stack
* **Frontend**: React, Vite, React-Router-Dom, Axios, TailwindCSS
* **Backend**: Node.js, Express, MongoDB, Mongoose, JWT Auth

---

## 📂 Project Structure Overview

```text
Carbon_credit-main/
│
├── backend/                 # Node.js + Express API Server
│   ├── models/                # MongoDB Data Schemas (Mongoose)
│   ├── routes/                # Express API Endpoints
│   ├── services/              # Core Business Logic & Calculations
│   ├── middlewares/           # JWT, Auth, and RBAC Protections
│   ├── .env                   # Environment Vars (PORT, MONGODB_URI)
│   └── server.js              # Main Express Configuration File
│
└── frontend/                # React + Vite Client Application
    ├── src/
    │   ├── components/        # Reusable UI (Navbar, Sidebar)
    │   ├── context/           # AuthContext (Tracks User Sessions)
    │   ├── pages/             # Route Views (Dashboards, Registers)
    │   ├── services/          # Axios API Callers (Maps to backend/routes)
    │   ├── config/            # API Route Settings (api.config.js)
    │   ├── App.tsx            # Global Layout & React Router Config
    │   ├── index.css          # Tailwind & Global Styles
    │   └── main.tsx           # React Root Injector
    ├── package.json
    └── vite.config.ts
```

---

## 🔗 Backend Map (Where logic runs)

### **1. Database Models (`backend/models/`)**
Defines how data is structured in MongoDB.
* `User.js` — Base accounts managing Auth and Passwords.
* `Admin.js`, `Aggregator.js`, `Company.js`, `MSME.js`, `Verifier.js` — Role-specific data profiles.
* `BaselineReading.js`, `MonitoringReading.js` — Energy consumption inputs.
* `Cluster.js` — Groups of MSMEs aggregated together automatically.
* `EmissionSummary.js` — Processed reading data translating into CO2 reductions.
* `RiskScore.js` — Computes data completeness, consistency, and penalization.
* `Allocation.js` — Final carbon credits assigned and tracked.
* `DashboardMetrics.js` — Cached system metrics for fast global dashboard loading.

### **2. Core Services (`backend/services/`)**
Contains the exact math and engine functions for the application.
* `authService.js` — Login verifications, JWT token signing, encryptions.
* `msmeService.js` — Processes baselines and parses monitoring averages.
* `clusteringEngine.js` — AI grouping for MSMEs by geographic state and industry.
* `emissionCalculationService.js` — Calculates offsets.
* `riskAllocationService.js` — Analyzes submission histories to generate risk reduction factors.
* `reportingService.js` — Aggregates data for Dashboards and exports PDFs/CSVs.

### **3. API Endpoints (`backend/routes/`)**
Provides RESTful hooks that the Frontend interacts with natively.
* `/api/auth/` — Login & Registration.
* `/api/msmes/` — Submit baseline readings & view specific MSME metrics.
* `/api/emissions/` — Dispatch cluster offset calculations.
* `/api/risk-allocation/` — Allocate credits and verification statuses.
* `/api/dashboard/` — Read comprehensive metrics.

---

## 🎨 Frontend Map (Where users click)

The frontend uses an Axios Client (`apiClient.js`) wrapped with `Bearer Tokens` from LocalStorage to contact the backend automatically.

### **1. API Hook Bridges (`frontend/src/services/`)**
These files map identically to standard Backend Routes:
* `authService.js` ➡️ Hooks into `backend/routes/authRoutes.js`
* `msmeService.js` ➡️ Hooks into `backend/routes/msmeRoutes.js`
* `emissionService.js` ➡️ Hooks into `backend/routes/emissionRoutes.js`
* `dashboardService.js` ➡️ Hooks into `backend/routes/dashboardRoutes.js`
* `riskAllocationService.js` ➡️ Hooks into `backend/routes/riskAllocationRoutes.js`

### **2. Global Context (`frontend/src/context/`)**
* `AuthContext.tsx` — Checks local storage, holds User data, processes logins/logouts globally. Required by `ProtectedRoute` to restrict page access.

### **3. UI Views (`frontend/src/pages/`)**
React components defining what users actually see.
* `Login.tsx`, `HomePage.tsx`, `RegisterLanding.tsx` (Public endpoints)
* `AdminPanel.tsx` (Admin dashboard showing all clusters and metrics)
* `MSMEDashboard.tsx` (MSME portal to submit readings and watch credits grow)
* `CompanyDashboard.tsx` (Company buyers waiting for verified credits)

---

## 🚀 How to Connect the Frontend to the Backend

If you want an interaction on a webpage to trigger backend logic, follow this 3-step loop:

**Example: Clicking "Submit Baseline Reading"**
1. **Frontend View (`MSMEDashboard.tsx`)**:
   Add a button with an `onClick` method calling the Service layer.
   ```javascript
   import msmeService from '../services/msmeService';
   
   const submitData = async () => {
       await msmeService.submitBaseline(user.msmeId, formData);
   }
   ```
2. **Frontend Service (`msmeService.js`)**:
   Sends an HTTP POST via Axios to the backend address string.
   ```javascript
   submitBaseline: async (msmeId, data) => {
      // Points exactly to http://localhost:5000/api/msmes/{msmeId}/baseline-reading
      return await apiClient.post(`/msmes/${msmeId}/baseline-reading`, data); 
   }
   ```
3. **Backend Route & Controller (`backend/routes/msmeRoutes.js`)**:
   Reads the Request, validates data, uses Mongoose to save to MongoDB (`BaselineReading`), and sends a `200 Success` JSON response back to the React UI.

**Tip:** Always verify `http://localhost:5000` is spinning before making Axios calls, and ensure the specific user's login `Role` has permission to touch the backend route based on JWT tokens!
