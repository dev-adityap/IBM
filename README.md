# VisitEase – Employee Visitor Management System

VisitEase is a full-stack Employee Visitor Management System built using the MERN stack. It helps organizations digitally manage visitor registrations, track visitor status, and provide secure role-based access to different users.

---

## 🚀 Features

### 👤 Visitor Management
- Add new visitors
- View all visitor records
- Search visitors by name or mobile number
- Edit visitor details
- Check visitors in and out
- Delete visitor records
- Automatically record visit date and time
- Track visitor status:
  - Checked In
  - Checked Out

### 🔐 Authentication & Authorization
- JWT-based authentication
- Secure login system
- Password hashing using bcrypt
- Role-based access control

### 👥 User Roles

| Role | Permissions |
|------|-------------|
| Admin | Add, View, Search, Edit, Check Out, Delete |
| Receptionist | Add, View, Search, Edit, Check Out |
| Viewer | View and Search only |

### 📊 Dashboard
- Total Visitors
- Currently Checked In
- Checked Out
- Recent visitor activity
- Quick visitor management actions

### 📱 Responsive UI
- Modern dashboard interface
- Responsive design
- Clean and user-friendly layout
- Role-based interface controls

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- Axios

### Backend
- Node.js
- Express.js
- REST API

### Database
- MongoDB
- MongoDB Atlas
- Mongoose

### Authentication
- JSON Web Token (JWT)
- bcrypt.js

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## 📁 Project Structure

```text
IBM/
│
├── client/
│   └── vite-project/
│       ├── src/
│       │   ├── App.jsx
│       │   ├── App.css
│       │   ├── Login.jsx
│       │   ├── Login.css
│       │   ├── api.js
│       │   └── main.jsx
│       │
│       ├── package.json
│       └── vite.config.js
│
├── server/
│   ├── middleware/
│   │   └── auth.Middleware.js
│   │
│   ├── models/
│   │   ├── User.model.js
│   │   └── Visitor.model.js
│   │
│   ├── routes/
│   │   ├── auth.Routes.js
│   │   └── visitor.Routes.js
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── README.md