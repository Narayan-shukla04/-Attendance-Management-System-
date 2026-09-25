# D-Table Analysis — Attendance Management System

A full-stack, role-based attendance management system with geolocation-verified punch-in/out, selfie capture, overtime tracking, and manager/admin validation workflows.

---

## Table of Contents

- [Features Implemented](#features-implemented)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Assumptions Made](#assumptions-made)

---

## Features Implemented

### Authentication & Authorization
- **JWT-based auth** with access token (30 min) + refresh token (7 day) strategy
- Tokens stored in HTTP-only cookies (not localStorage) for XSS protection
- Role-based access control with three roles: **Employee**, **Manager**, **Admin**
- Protected routes on both client and server enforcing role-specific access
- Auto-refresh of access token using refresh token
- Profile photo upload during registration via ImageKit

### Employee Features
- **Geolocation-verified Punch In / Punch Out** — employee must be within a configurable radius of the office
- **Selfie capture** required for both punch-in and punch-out (uploaded to ImageKit)
- Distance from office is calculated and stored with each punch record
- View personal attendance history with pagination
- Request overtime (OT) on attendance records
- Auto-calculated total hours and status (`present` → `completed` / `incomplete`)

### Manager Features
- View **team attendance** — filtered to employees assigned to the manager via `managerId`
- **Validate attendance** records as `valid` or `invalid` with optional remarks
- **Approve / reject overtime** requests from team members
- Date-range filtering for team attendance records

### Admin Features
- View **all attendance records** across the organization with date-range filtering
- **User management** — list all users, delete non-admin users
- Access to daily attendance reports
- Full validation and OT decision capabilities

### General
- Paginated API responses for all list endpoints
- Global error handling with custom `appError` class
- Responsive UI with TailwindCSS
- State management with Redux Toolkit (auth) + React Query (server data)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│                   (React 19 + Vite)                     │
│                                                         │
│  ┌─────────┐  ┌──────────┐  ┌─────────────────────┐    │
│  │  Redux   │  │  React   │  │      Pages          │    │
│  │ Toolkit  │  │  Query   │  │ ┌─────────────────┐ │    │
│  │ (Auth)   │  │ (Data)   │  │ │ Employee        │ │    │
│  └────┬─────┘  └────┬─────┘  │ │  Dashboard      │ │    │
│       │              │        │ │  PunchPage      │ │    │
│       │              │        │ ├─────────────────┤ │    │
│       │              │        │ │ Manager         │ │    │
│       │              │        │ │  Dashboard      │ │    │
│       │              │        │ ├─────────────────┤ │    │
│       │              │        │ │ Admin           │ │    │
│       │              │        │ │  Dashboard      │ │    │
│       │              │        │ └─────────────────┘ │    │
│       └──────┬───────┘        └─────────────────────┘    │
│              │  Axios (withCredentials)                   │
└──────────────┼───────────────────────────────────────────┘
               │  HTTP (cookies)
┌──────────────┼───────────────────────────────────────────┐
│              ▼         SERVER                            │
│         (Express 5 + Node.js)                            │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Routes     │  │  Middleware   │  │   Utils      │   │
│  │ /api/auth    │  │  authMiddle   │  │  geo.js      │   │
│  │ /api/users   │  │  Ware        │  │  token.js    │   │
│  │ /api/attend  │  │  errorHandler│  │  appError.js │   │
│  └──────┬───────┘  └──────────────┘  └──────────────┘   │
│         │                                                │
│  ┌──────▼───────┐  ┌──────────────┐                     │
│  │ Controllers  │  │   Services   │                     │
│  │  auth        │  │  ImageKit    │                     │
│  │  attendance  │  │  (storage)   │                     │
│  │  users       │  └──────────────┘                     │
│  └──────┬───────┘                                        │
│         │                                                │
│  ┌──────▼───────┐                                        │
│  │   Models     │                                        │
│  │  User        │──────────▶  MongoDB Atlas              │
│  │  Attendance  │                                        │
│  └──────────────┘                                        │
└──────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Client** dispatches auth actions via Redux Toolkit (`fetchCurrentUser` on mount) and uses React Query hooks (`useAttendance`, `useAuth`, `useUsers`) for server-state.
2. **Axios** instance sends requests with `withCredentials: true` to pass cookies.
3. **Server** validates JWT from cookies via `authMiddleware`, routes to controllers.
4. **Controllers** interact with Mongoose models and the ImageKit storage service.
5. **Geolocation** is verified server-side using `geolib` before allowing punch operations.

---

## Tech Stack

### Server
| Technology | Purpose |
|---|---|
| **Express 5** | HTTP framework |
| **MongoDB + Mongoose 9** | Database & ODM |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcrypt** | Password hashing |
| **ImageKit** | Cloud image storage (selfies, profiles) |
| **geolib** | Geolocation distance calculation |
| **multer** | File upload handling (memory storage) |
| **morgan** | HTTP request logging |
| **cookie-parser** | Cookie parsing middleware |
| **dotenv** | Environment variable management |

### Client
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **TailwindCSS 4** | Utility-first styling |
| **Redux Toolkit** | Auth state management |
| **React Query (TanStack)** | Server-state & caching |
| **React Router 8** | Client-side routing |
| **React Hook Form** | Form handling |
| **Axios** | HTTP client |
| **Lucide React** | Icon library |

---

## Project Structure

```
├── server/
│   ├── index.js                          # Entry point — starts Express & connects DB
│   ├── .env                              # Environment variables
│   ├── package.json
│   └── src/
│       ├── app/
│       │   └── app.js                    # Express app setup, middleware, routes
│       ├── config/
│       │   ├── database.js               # MongoDB connection via Mongoose
│       │   └── multer.js                 # Multer memory storage config
│       ├── controllers/
│       │   ├── auth.controller.js        # Register, login, logout, refresh, get managers
│       │   ├── attendence.controller.js  # Punch in/out, attendance queries, OT, validation
│       │   └── users.controller.js       # Get me, list users, delete user, list team
│       ├── middlewares/
│       │   ├── authMiddleWare.js         # JWT verification from cookies
│       │   └── error.middelware.js       # Global error handler
│       ├── models/
│       │   ├── user.model.js             # User schema (name, email, password, role, managerId)
│       │   └── attendence.model.js       # Attendance schema (punch times, location, OT, validation)
│       ├── routes/
│       │   ├── auth.route.js             # /api/auth/*
│       │   ├── attendance.route.js       # /api/attendance/*
│       │   └── users.route.js            # /api/users/*
│       ├── services/
│       │   └── storageInstance.service.js # ImageKit upload wrapper
│       └── utils/
│           ├── appError.js               # Custom error class with statusCode
│           ├── geo.js                    # Office geofence check using geolib
│           └── token.js                  # JWT token generator
│
├── client/
│   ├── index.html                        # HTML entry
│   ├── vite.config.js                    # Vite + React + Tailwind config
│   ├── package.json
│   └── src/
│       ├── main.jsx                      # React root — Provider, QueryClient, BrowserRouter
│       ├── App.jsx                       # Fetches current user on mount, renders router
│       ├── index.css                     # Tailwind import
│       ├── app/
│       │   └── Strore.jsx                # Redux store configuration
│       ├── config/
│       │   └── AxiosInstance.jsx          # Axios instance with baseURL + credentials
│       ├── feature/
│       │   └── AuthSlice.jsx             # Redux slice — login, register, fetchCurrentUser
│       ├── hooks/
│       │   ├── useAttendance.jsx          # React Query hooks for attendance APIs
│       │   ├── useAuth.jsx                # Auth-related hooks
│       │   └── useUsers.jsx               # User management hooks
│       ├── routes/
│       │   ├── Approuter.jsx              # All route definitions with role guards
│       │   └── ProtectedRoute.jsx         # Role-based route protection component
│       ├── layout/
│       │   └── DashboardLayout.jsx        # Navbar + Outlet wrapper
│       ├── components/
│       │   ├── Navbar.jsx                 # Navigation bar with role-based links
│       │   ├── StatCard.jsx               # Dashboard stat display card
│       │   ├── Badges.jsx                 # Status badge components
│       │   └── ValidateAction.jsx         # Attendance validation UI
│       └── pages/
│           ├── auth/
│           │   ├── Login.jsx              # Login form (email, password, role)
│           │   └── Register.jsx           # Registration form with profile upload
│           ├── employee/
│           │   ├── EmployeeDashboard.jsx  # Employee home — attendance stats & history
│           │   └── PunchPage.jsx          # Punch in/out with selfie & geolocation
│           ├── manager/
│           │   └── ManagerDashboard.jsx   # Team attendance, validation, OT decisions
│           └── admin/
│               └── AdminDashboard.jsx     # All attendance, user management, reports
│
└── readme.md                              # ← You are here
```

---

## Setup Instructions

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB Atlas** account (or local MongoDB instance)
- **ImageKit** account (for image uploads)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "D- table analyasis"
```

### 2. Server Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=<your-jwt-secret>
IK_PUB_KEY=<your-imagekit-public-key>
IK_PRI_KEY=<your-imagekit-private-key>
IK_ENDPOINT=<your-imagekit-url-endpoint>
```

Optional geofence variables (defaults shown):

```env
OFFICE_LAT=23.2184
OFFICE_LNG=77.3937
MAX_DISTANCE_METERS=50000
```

Start the server:

```bash
npx nodemon
```

The server runs on `http://localhost:3000`.

### 3. Client Setup

```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` and proxies API requests to the server.

### 4. Verify

1. Open `http://localhost:5173` in your browser.
2. Register a new user (select role: employee, manager, or admin).
3. Log in and explore the role-specific dashboard.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `5000`) |
| `MONGO_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret key for signing JWTs |
| `IK_PUB_KEY` | **Yes** | ImageKit public key |
| `IK_PRI_KEY` | **Yes** | ImageKit private key |
| `IK_ENDPOINT` | **Yes** | ImageKit URL endpoint |
| `OFFICE_LAT` | No | Office latitude (default: `23.2184`) |
| `OFFICE_LNG` | No | Office longitude (default: `77.3937`) |
| `MAX_DISTANCE_METERS` | No | Max allowed distance for punch-in (default: `50000`) |

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/managers` | No | List all managers (for registration dropdown) |
| `POST` | `/register` | No | Register new user (multipart — profile photo) |
| `POST` | `/login` | No | Login with email, password, role |
| `POST` | `/logout` | No | Clear auth cookies |

### Users (`/api/users`) — *All require auth*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/me` | Get current user profile |
| `GET` | `/list` | List all users (with populated manager) |
| `DELETE` | `/:id` | Delete a user (admin can't be deleted) |
| `GET` | `/team` | List team members (for managers) |

### Attendance (`/api/attendance`) — *All require auth*

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/check-in` | Punch in (multipart — selfie + lat/lng) |
| `POST` | `/check-out` | Punch out (multipart — selfie + lat/lng) |
| `GET` | `/my-attendance` | Employee's own records (paginated) |
| `GET` | `/team-attendance` | Manager's team records (paginated, date filter) |
| `GET` | `/all-attendance` | Admin — all records (paginated, date filter) |
| `POST` | `/validate/:id` | Validate record as valid/invalid (manager/admin) |
| `POST` | `/request-ot/:id` | Employee requests overtime |
| `POST` | `/ot-decision/:id` | Manager/admin approves or rejects OT |
| `GET` | `/report` | Daily attendance report (role-scoped) |

---

## Assumptions Made

1. **Single office location** — The geofence check uses one configurable office coordinate. Multi-office support is not implemented.

2. **One punch-in per day** — Employees can punch in only once per calendar day (`date` field uses `YYYY-MM-DD` string format). No split shifts or multiple check-ins.

3. **8-hour workday threshold** — Attendance status is auto-set to `completed` if `totalHours >= 8`, otherwise `incomplete`. This threshold is hardcoded.

4. **Manager assignment at registration** — Employees select their manager during registration via `managerId`. There is no workflow for reassigning managers afterward.

5. **Selfie verification is manual** — Photos are uploaded and stored, but no facial recognition or automated verification is performed. Managers/admins visually verify selfies.

6. **No email verification** — Registration does not require email confirmation.

7. **Cookie-based auth only** — The app relies on HTTP-only cookies and CORS with `credentials: true`. The CORS origin is hardcoded to `http://localhost:5173` (development only).

8. **No rate limiting** — API endpoints do not enforce rate limiting or brute-force protection.

9. **Browser geolocation required** — Punch operations depend on the browser's Geolocation API. If the user denies permission, punching is not possible.

10. **ImageKit for all uploads** — Both profile photos and attendance selfies are uploaded to ImageKit's cloud storage under the `assessment` folder.

11. **Admins cannot be deleted** — The delete user endpoint explicitly prevents deletion of admin accounts.

12. **No password reset** — There is no forgot-password or change-password flow implemented.

13. **Access token uses a single secret** — Both access and refresh tokens are signed with the same `JWT_SECRET`. The `REFRESH_TOKEN_SECRET` referenced in the refresh endpoint falls back to the same env variable pattern.
