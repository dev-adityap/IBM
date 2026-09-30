# VisitEase — Employee Visitor Management System

VisitEase is a full-stack visitor management platform built on the MERN stack. Staff register and track every visitor at the gate, while visitors can request their own visits and follow the approval status in real time.

The interface is a dark, glassmorphism **AI-assisted dashboard**: live statistics, a 7-day activity chart and generated insights, backed by a JWT-secured REST API with role-based access control.

---

## 🚀 Features

### 👤 Visitor Management
- Register visitors at reception (name, mobile, email, organization, host, purpose)
- Request a visit as a visitor and track its approval status
- Search by name, mobile number or organization
- Filter records by status (All, Pending, Checked In, Checked Out)
- Approve requests, check visitors in and out
- Edit and delete records (admin only for delete)
- Automatic visit date & time stamping
- Visitor requests lock once approved by staff

### 📊 Dashboard
- Four live stat cards: Total Visitors, On Site, Pending, Completed
- 7-day visitor activity area chart built with inline SVG
- AI assistant panel with insights generated from current data
- Recent visitors table with quick actions

### 🔐 Authentication & Authorization
- JWT authentication (1-day expiry, `Bearer` token)
- Password hashing with bcrypt (10 rounds)
- Role-based access control enforced on the server
- Automatic session recovery and logout on expired token

### 🎨 UI / UX
- Dark AI-assistant dashboard theme with violet gradient accents
- Glassmorphism cards with ambient glow backgrounds
- Animated modals, hover lifts, status chips and tinted action buttons
- Fully responsive — the sidebar collapses into a top bar on small screens
- Split-screen authentication page

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| Admin | Dashboard, add, view, search, filter, edit, approve, check in/out, delete |
| Visitor | Request a visit, view own requests, edit own pending requests |

Role-based visibility is applied on both the client (UI controls) and the server (route authorization + ownership checks).

---

## 🛠️ Tech Stack

**Frontend** — React 19, Vite 8, JavaScript (JSX), CSS, Axios, Lucide React icons
**Backend** — Node.js, Express 5, REST API, CORS, dotenv
**Database** — MongoDB / MongoDB Atlas, Mongoose 9
**Auth** — JSON Web Tokens (jsonwebtoken), bcryptjs
**Deployment** — Frontend: Vercel · Backend: Render · Database: MongoDB Atlas

---

## ⚙️ Setup

### 1. Clone and install

```bash
git clone <repo-url> IBM
cd IBM
```

**Server**

```bash
cd server
npm install
```

**Client**

```bash
cd client/vite-project
npm install
```

### 2. Environment variables

Create `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Create `client/vite-project/.env` (optional, defaults shown):

```env
VITE_API_URL=http://localhost:5000/api/visitors
```

### 3. Run both

```bash
# Terminal 1 — API on http://localhost:5000
cd server
npm run dev
```

```bash
# Terminal 2 — app on http://localhost:5173
cd client/vite-project
npm run dev
```

### 4. Build for production

```bash
cd client/vite-project
npm run lint
npm run build     # output in client/vite-project/dist
```

---

## 🔌 API Reference

Base URL: `http://localhost:5000`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Health check |
| POST | `/api/auth/register` | Public | Create a visitor or admin account |
| POST | `/api/auth/login` | Public | Sign in, returns JWT + user |
| POST | `/api/visitors` | admin, visitor | Create a visitor (staff → `Checked In`, visitor → `Pending`) |
| GET | `/api/visitors` | authenticated | List visitors (visitors see only their own) |
| GET | `/api/visitors/:id` | authenticated | Fetch one visitor (ownership enforced) |
| PUT | `/api/visitors/:id` | admin, visitor | Update details or status (visitor: pending requests only) |
| DELETE | `/api/visitors/:id` | admin | Delete a visitor record |

Authenticated requests require a header:

```
Authorization: Bearer <token>
```

---

## 📁 Project Structure

```text
IBM/
├── client/
│   └── vite-project/
│       ├── public/            # favicons, web manifest
│       ├── src/
│       │   ├── App.jsx         # dashboard, tables, modals, CRUD logic
│       │   ├── App.css         # dashboard theme
│       │   ├── Login.jsx       # landing / register / sign-in views
│       │   ├── Login.css       # auth theme
│       │   ├── api.js          # axios instance + auth interceptors
│       │   ├── index.css       # global design tokens + reset
│       │   └── main.jsx
│       ├── index.html
│       ├── package.json
│       └── vite.config.js
│
├── server/
│   ├── middleware/
│   │   └── auth.Middleware.js   # authenticate + authorize
│   ├── models/
│   │   ├── User.model.js
│   │   └── Visitor.model.js
│   ├── routes/
│   │   ├── auth.Routes.js       # register / login
│   │   └── visitor.Routes.js    # protected CRUD
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt and never returned by the API.
- All visitor routes require a valid JWT; role checks run server-side.
- Visitors can only read and edit their own records, and only while `Pending`.
- The `user` field is stripped on update so ownership cannot be reassigned.
- Regex input is escaped before use in database queries.

---

## 🚧 Roadmap

- Automated tests for API and UI
- Server-side pagination and search
- QR code badges and printable visitor passes
- Host notifications via email on check-in
- Receptionist and viewer roles
- Attendance-style monthly reports
