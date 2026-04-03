# Carbon Credit Platform - GreenCredits

A modern web application that connects companies with verified tree-planting organizations to generate carbon credits through environmental initiatives. Built with React, TypeScript, and Tailwind CSS.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Installation & Setup](#installation--setup)
- [Workflow](#workflow)
- [Code Architecture](#code-architecture)
- [Development](#development)

## 🎯 Overview

GreenCredits is a carbon credit marketplace platform that facilitates the connection between companies seeking to offset their carbon footprint and verified organizations that plant trees. Companies can invest in tree-planting projects and earn certified carbon credits, while organizations can receive funding for their environmental initiatives.

## 🛠 Tech Stack

### Core Technologies
- **React 18.3.1** - UI library
- **TypeScript 5.5.3** - Type-safe JavaScript
- **Vite 5.4.2** - Build tool and dev server
- **React Router DOM 7.7.1** - Client-side routing

### Styling & UI
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Lucide React 0.344.0** - Icon library

### Development Tools
- **ESLint 9.9.1** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS & Autoprefixer** - CSS processing

## 📁 Project Structure

```
Carbon_credit-main/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── Navbar.tsx      # Navigation bar component
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx # Authentication state management
│   ├── pages/              # Page components (routes)
│   │   ├── HomePage.tsx
│   │   ├── Login.tsx
│   │   ├── CompanyRegister.tsx
│   │   ├── OrganizationRegister.tsx
│   │   ├── CompanyDashboard.tsx
│   │   ├── OrganizationDashboard.tsx
│   │   └── AdminPanel.tsx
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles and Tailwind imports
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.ts          # Vite build configuration
└── eslint.config.js        # ESLint configuration
```

## ✨ Features

### User Roles
1. **Companies** - Register, invest in projects, track carbon credits
2. **Organizations** - Register, create projects, receive funding
3. **Admin** - Platform management and oversight

### Key Functionality
- User authentication and role-based access
- Company and organization registration
- Dashboard for tracking investments and projects
- Project management and monitoring
- Carbon credit tracking
- Verified organization listings

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Carbon_credit-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

6. **Run linter**
   ```bash
   npm run lint
   ```

The application will be available at `http://localhost:5173` (default Vite port).

## 🔄 Workflow

### Application Flow

#### 1. **Homepage (`/`)**
   - Landing page with platform overview
   - "How It Works" section explaining the process
   - Call-to-action buttons for registration
   - Navigation to login or registration pages

#### 2. **Registration Flow**

   **Company Registration (`/company-register`)**
   - Companies provide:
     - Company name and industry type
     - Contact information (email, phone)
     - GST/PAN number
     - Address
     - Funding budget range
     - Company logo (optional)
     - Password
   - Form validation and submission
   - Redirects to login after successful registration

   **Organization Registration (`/organization-register`)**
   - Organizations provide similar details
   - Different registration form tailored for NGOs/environmental groups

#### 3. **Authentication Flow (`/login`)**
   - User selects role (Company/Organization/Admin)
   - Email and password input
   - Mock authentication (currently accepts any credentials)
   - Role-based redirect after login:
     - Company → `/company-dashboard`
     - Organization → `/organization-dashboard`
     - Admin → `/admin`

#### 4. **Dashboard Flows**

   **Company Dashboard (`/company-dashboard`)**
   - **Stats Overview:**
     - Total invested amount
     - Trees planted count
     - Carbon credits earned
     - Active projects count
   
   - **Current Projects Section:**
     - List of funded projects
     - Project details (location, progress, funding)
     - Progress bars showing completion status
     - Last update timestamps
   
   - **Verified Organizations:**
     - List of available organizations
     - Organization details (type, location, capacity, rating)
     - Option to fund new projects
     - Verified badge indicators

   **Organization Dashboard (`/organization-dashboard`)**
   - Similar structure for organizations
   - Project creation and management
   - Funding received tracking
   - Tree planting progress updates

   **Admin Panel (`/admin`)**
   - Platform-wide management
   - User verification
   - Project oversight
   - Analytics and reporting

#### 5. **Navigation**
   - Persistent navbar across all pages
   - Role-based dashboard links
   - Logout functionality
   - User profile display

### User Journey Example

1. **New Company User:**
   ```
   Homepage → Company Register → Login → Company Dashboard
   ```

2. **Existing Organization:**
   ```
   Homepage → Login → Organization Dashboard
   ```

3. **Admin Access:**
   ```
   Homepage → Login (Admin role) → Admin Panel
   ```

## 🏗 Code Architecture

### Component Structure

#### **App.tsx** - Main Application Component
- Wraps entire app with `AuthProvider` for global authentication state
- Sets up React Router with `BrowserRouter`
- Defines all application routes
- Applies global styling (gradient background)

**Key Routes:**
- `/` - HomePage
- `/company-register` - CompanyRegistration
- `/organization-register` - OrganizationRegistration
- `/login` - Login
- `/company-dashboard` - CompanyDashboard
- `/organization-dashboard` - OrganizationDashboard
- `/admin` - AdminPanel

#### **AuthContext.tsx** - Authentication State Management
- Provides global authentication state using React Context API
- **State:**
  - `user`: Current logged-in user object (id, name, email, role)
  - `isAuthenticated`: Boolean flag for auth status

- **Methods:**
  - `login(email, password, role)`: Mock authentication function
    - Currently accepts any credentials
    - Creates mock user object based on role
    - Returns boolean for success/failure
  - `logout()`: Clears user state

- **Hook:** `useAuth()` - Custom hook to access auth context

#### **Navbar.tsx** - Navigation Component
- Displays platform branding (GreenCredits logo)
- Conditional rendering based on auth state:
  - **Unauthenticated:** Login and "Get Started" buttons
  - **Authenticated:** User name, dashboard link, logout button
- Role-based dashboard routing
- Responsive design with Tailwind CSS

#### **Page Components**

**HomePage.tsx**
- Hero section with platform introduction
- "How It Works" 4-step process visualization
- Benefits section with feature highlights
- Global impact statistics
- Call-to-action sections

**Login.tsx**
- Role selection (Company/Organization/Admin)
- Email and password form
- Password visibility toggle
- Remember me checkbox
- Form validation
- Demo credentials information

**CompanyRegister.tsx**
- Multi-field registration form
- File upload for company logo
- Industry type selection
- Budget range selection
- Form validation
- Terms and conditions acceptance

**CompanyDashboard.tsx**
- Statistics cards (invested, trees, credits, projects)
- Current projects list with progress tracking
- Verified organizations sidebar
- Quick actions panel
- Interactive organization selection

### Styling Approach

- **Tailwind CSS** utility classes for all styling
- Consistent color scheme: Green theme (`green-50` to `green-900`)
- Responsive design with breakpoints (`sm:`, `md:`, `lg:`)
- Modern UI with:
  - Rounded corners (`rounded-lg`, `rounded-xl`)
  - Shadows (`shadow-sm`, `shadow-xl`)
  - Hover effects and transitions
  - Gradient backgrounds

### State Management

- **Local State:** React `useState` hooks in components
- **Global State:** React Context API for authentication
- **Form State:** Managed locally in each form component
- **Mock Data:** Currently using hardcoded data (ready for API integration)

### Type Safety

- TypeScript interfaces for:
  - User objects
  - Auth context types
  - Component props
  - Form data structures

## 💻 Development

### Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```
   - Hot Module Replacement (HMR) enabled
   - Fast refresh for React components
   - Automatic browser reload on changes

2. **Code Quality**
   - ESLint for code linting
   - TypeScript for type checking
   - Follow React best practices

3. **Building for Production**
   ```bash
   npm run build
   ```
   - Creates optimized production build in `dist/` folder
   - Minified and tree-shaken code
   - Asset optimization

### Key Development Notes

- **Mock Authentication:** Currently uses mock authentication. Replace `AuthContext.tsx` login function with actual API calls.
- **Data Persistence:** No backend integration yet. All data is client-side only.
- **File Uploads:** Logo upload is captured but not persisted (ready for backend integration).
- **Routing:** Client-side routing with React Router. All routes are public (no route guards implemented yet).

### Future Enhancements

- Backend API integration
- Database for user and project data
- Real authentication with JWT tokens
- File upload to cloud storage
- Route protection/guards
- Real-time project updates
- Payment integration
- Email notifications
- Advanced analytics and reporting

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Authentication

Currently uses mock authentication. The system accepts any email/password combination and assigns a role based on the selected user type during login. In production, this should be replaced with:
- Secure authentication API
- JWT token management
- Password hashing
- Session management
- Role-based access control (RBAC)

## 📄 License

This project is part of a carbon credit platform implementation.

---

**Note:** This is a frontend-only implementation. Backend integration is required for full functionality including data persistence, real authentication, and payment processing.
