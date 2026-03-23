## Smart Blood Bank & Hospital Management System

Full-stack medical blood banking system with role-based access, dashboards, blood stock management, and a basic AI-style symptom checker.

### Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS, React Router, Recharts
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT auth, bcrypt password hashing

### Folder Structure (high level)

- `backend/`
  - `package.json` – backend dependencies and scripts
  - `src/`
    - `config/config.js` – environment configuration (Mongo, JWT, SMTP)
    - `models/`
      - `User.js` – users (roles: user, admin, hospital, donor flags, history, optional `hospital` link)
      - `Admin.js` – admin metadata
      - `Hospital.js` – hospitals with address, contacts, treatments, doctors, `doctorCount` virtual
      - `Doctor.js` – doctors with specialization, qualification, experience, status, hospital, timings, contacts, profile image
      - `Treatment.js` – available treatments
      - `BloodStock.js` – blood stock per hospital per blood group
      - `BloodRequest.js` – blood requests, urgency, status (pending/approved/rejected), emergency flag, admin remarks, approval info
      - `AuditLog.js` – admin and hospital actions for audit trail
    - `middleware/auth.js` – JWT verification + role-based access control
    - `middleware/rateLimit.js` – rate limiters for auth and sensitive writes
    - `middleware/errorHandler.js` – centralized error handler
    - `controllers/`
      - `authController.js` – register/login (JWT)
      - `userController.js` – profile, donor registration, donation history
      - `hospitalController.js` – CRUD/list hospitals with pagination
      - `doctorController.js` – admin list + hospital-scoped CRUD and image upload
      - `bloodController.js` – blood stock and search by location
      - `bloodRequestController.js` – create/approve blood requests + stock deduction + email + audit logs
      - `adminController.js` – dashboard stats and activity logs
    - `routes/`
      - `authRoutes.js` – `/api/auth`, `/api/v1/auth`
      - `userRoutes.js` – `/api/users`, `/api/v1/users`
      - `hospitalRoutes.js` – `/api/hospitals`, `/api/v1/hospitals`
      - `doctorRoutes.js` – `/api/doctors`, `/api/v1/doctors`
      - `bloodRoutes.js` – `/api/blood`, `/api/v1/blood`
      - `bloodRequestRoutes.js` – `/api/requests`, `/api/v1/requests`
      - `adminRoutes.js` – `/api/admin`, `/api/v1/admin`
    - `utils/email.js` – Nodemailer wrapper (logs in dev)
    - `server.js` – Express app + Mongo connection
    - `seed.js` – seed script with sample admin, hospital, doctor, stock, treatments

- `frontend/`
  - `package.json` – frontend dependencies and scripts
  - `vite.config.mts`, `tailwind.config.cjs`, `postcss.config.cjs`
  - `index.html`
  - `src/`
    - `main.jsx` – React root
    - `index.css` – Tailwind + base theme
    - `api/client.js` – Axios client with JWT interceptor
    - `context/AuthContext.jsx` – auth state, login/register/logout
    - `components/`
      - `Layout.jsx` – shell with header/footer/navigation
      - `ProtectedRoute.jsx` – route guard with optional role restriction
    - `pages/`
      - `Auth/Login.jsx`, `Auth/Register.jsx`
      - `Dashboard/UserDashboard.jsx` – user stats, donation chart, recent requests with status badges and admin remarks
      - `Dashboard/AdminDashboard.jsx` – admin sidebar, request table with approve/reject modal, analytics charts, activity logs
      - `Dashboard/HospitalDashboard.jsx` – hospital-only doctor management (CRUD, status, image upload)
      - `Blood/BloodRequestForm.jsx` – create blood request (with emergency option)
      - `Blood/BloodSearch.jsx` – search real-time blood availability by location
      - `Hospital/HospitalList.jsx`, `Hospital/HospitalDetail.jsx`
      - `Doctor/DoctorList.jsx`
      - `SymptomChecker.jsx` – rule-based medicine suggestions + disclaimer
      - `Contact.jsx` – contact info + emergency helpline
    - `App.jsx` – routing and role-based dashboard router

### Backend Setup

1. **Install dependencies**

   ```bash
   cd "d:\blood bankig\backend"
   npm install
   ```

2. **Environment variables**

   Create `.env` in `backend/` (optional, defaults work for local dev with Mongo on `27017`):

   ```bash
   MONGO_URI=mongodb://127.0.0.1:27017/smart_blood_bank
   JWT_SECRET=change_this_secret_in_production
   CLIENT_URL=http://localhost:5173
   # Optional SMTP (for real emails)
   SMTP_HOST=smtp.yourprovider.com
   SMTP_PORT=587
   SMTP_USER=your_user
   SMTP_PASS=your_pass
   EMAIL_FROM="Smart Blood Bank <no-reply@smartbloodbank.local>"
   ```

3. **Seed sample data**

   ```bash
   cd "d:\blood bankig\backend"
   npm run seed
   ```

   This creates:

   - **Admin user**: `admin@smartbloodbank.local` / `Admin@123`
   - One sample hospital with treatments and a doctor
   - Initial blood stock entries (A+, B+, O-)

4. **Run backend**

   ```bash
   cd "d:\blood bankig\backend"
   npm run dev
   ```

   Backend runs on `http://localhost:5000`.

### Frontend Setup

1. **Install dependencies**

   ```bash
   cd "d:\blood bankig\frontend"
   npm install
   ```

2. **Frontend environment**

   Create `frontend/.env` (optional):

   ```bash
   VITE_API_URL=http://localhost:5001/api
   ```

3. **Run frontend**

   ```bash
   cd "d:\blood bankig\frontend"
   npm run dev
   ```

   Open the printed URL (default `http://localhost:5173`).

### Core Flows

- **Authentication & Roles**
  - Registration (`/register`) supports roles `user` and `hospital`.
  - Login (`/login`) issues a JWT stored in `localStorage` and used on all API calls.
  - Role-based routing:
    - `/dashboard` routes to:
      - `UserDashboard` for `user`
      - `AdminDashboard` for `admin`
      - `HospitalDashboard` for `hospital`
    - `ProtectedRoute` component guards auth-only pages and role-specific routes.

- **User Module**
  - Manage profile and donor registration via `/api/users` endpoints (already wired in backend).
  - View blood donation history and blood request status from user dashboard.

- **Admin Module**
  - Use seeded admin account to log in.
  - Manage hospitals (`/api/v1/hospitals`), doctors list (`/api/v1/doctors`), blood stock (`/api/v1/blood/stock/:hospitalId`).
  - View and approve/reject blood requests via `PATCH /api/v1/requests/:id/status` with optional `adminRemarks`.
  - `AdminDashboard` shows key stats (users, hospitals, requests, pending/approved, emergency), group-wise blood stock chart, request trend, and recent audit logs.

- **Hospital Module**
  - Public list of hospitals with pagination and search.
  - Each hospital detail page shows address, treatments, doctors, and available blood stock.
  - Authenticated `hospital` role can manage their own doctors only via `/api/v1/doctors` (create), `/api/v1/doctors/my`, `/api/v1/doctors/:id` (update/delete), with profile image upload.

- **Doctor Module**
  - Public list of doctors with pagination, search, and specialization filter.
  - Admin can view all doctors; hospitals can only manage their own doctors.

- **Blood Management**
  - Blood groups supported: A+, A-, B+, B-, AB+, AB-, O+, O-.
  - Real-time availability via `/blood/search` with filters for blood group and location (city/state).
  - Emergency blood requests flagged by `isEmergency` in `BloodRequest`.

- **Medicine Suggestion / Symptom Checker**
  - Frontend-only, rule-based mapping:
    - **Fever → Paracetamol**
    - **Cold → Cetirizine**
    - **Headache → Ibuprofen**
  - Includes clear disclaimer: **“This is only a basic suggestion. Please consult a doctor.”**

### Notes & Next Steps

- **Security**
  - Passwords are hashed with **bcrypt** in the `User` model `pre('save')` hook.
  - All protected APIs use **JWT** with role-based checks in `middleware/auth.js`.
  - Rate limiting on auth endpoints and sensitive admin write operations.
  - Centralized error handling and validation via `express-validator` on write routes.
  - For production, configure strong secrets, HTTPS, CORS rules, and a real SMTP server.

- **Extensibility Ideas**
  - Add dedicated admin analytics endpoints (total donors, users, per-group stock).
  - Enhance hospital dashboard for stock editing and request triage.
  - Add profile edit UI and donor registration UI wiring (`/users/donor`).

#   b l o o d - b a n k i n g - s y s t e m -  
 