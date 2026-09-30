import { useState } from "react";
import axios from "axios";
import { Bot, ShieldCheck, Sparkles } from "lucide-react";
import "./Login.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/visitors";

const AUTH_URL = API_URL.replace(
  "/api/visitors",
  "/api/auth"
);

const Shell = ({ children }) => (
  <div className="login-page">
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="brand-mark">
          <Sparkles size={18} />
        </div>

        <h1>
          Visitor management,
          <span> finally effortless.</span>
        </h1>

        <p>
          Approve visits, track arrivals and keep every host notified
          from one calm workspace.
        </p>

        <ul className="aside-list">
          <li>
            <Bot size={15} />
            AI-assisted insights on every visit
          </li>
          <li>
            <ShieldCheck size={15} />
            Role-based access for staff and visitors
          </li>
          <li>
            <Sparkles size={15} />
            Live check-in and check-out status
          </li>
        </ul>

        <span className="aside-foot">VisitEase · MERN stack</span>
      </aside>

      <section className="auth-card">{children}</section>
    </div>
  </div>
);

function Login({ onLogin }) {
  const [view, setView] = useState("landing");
  const [role, setRole] = useState("visitor");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  // ============================================
  // REGISTER
  // ============================================

  const handleRegister = async (e) => {
    e.preventDefault();

    resetMessages();
    setLoading(true);

    try {
      const response = await axios.post(
        `${AUTH_URL}/register`,
        {
          name,
          email,
          phone,
          password,
          role,
        }
      );

      setSuccess(
        response.data.message + ". You can now sign in."
      );

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");

      setView("login");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOGIN
  // ============================================

  const handleLogin = async (e) => {
    e.preventDefault();

    resetMessages();
    setLoading(true);

    try {
      const response = await axios.post(
        `${AUTH_URL}/login`,
        {
          name,
          password,
        }
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      onLogin(user);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LANDING
  // ============================================

  if (view === "landing") {
    return (
      <Shell>
        <h2>Welcome to VisitEase</h2>
        <p className="login-subtitle">
          Choose how you want to continue
        </p>

        <button
          className="role-btn"
          onClick={() => {
            resetMessages();
            setRole("visitor");
            setView("register");
          }}
        >
          <span className="role-btn-title">
            Register as a Visitor
          </span>
          <span className="role-btn-text">
            Create a visitor account
          </span>
        </button>

        <button
          className="role-btn role-btn-alt"
          onClick={() => {
            resetMessages();
            setRole("admin");
            setView("register");
          }}
        >
          <span className="role-btn-title">
            Sign up as an Admin
          </span>
          <span className="role-btn-text">
            Full dashboard access
          </span>
        </button>

        <div className="auth-switch">
          Already registered?{" "}
          <button
            className="link-btn"
            onClick={() => {
              resetMessages();
              setView("login");
            }}
          >
            Sign in
          </button>
        </div>
      </Shell>
    );
  }

  // ============================================
  // REGISTER
  // ============================================

  if (view === "register") {
    return (
      <Shell>
        <h2>
          {role === "admin"
            ? "Admin sign up"
            : "Visitor register"}
        </h2>

        <p className="login-subtitle">
          {role === "admin"
            ? "Create an admin account"
            : "Create your visitor account"}
        </p>

        <form onSubmit={handleRegister}>
          <div className="login-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="login-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="login-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : role === "admin"
              ? "Create admin account"
              : "Register"}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?{" "}
          <button
            className="link-btn"
            onClick={() => {
              resetMessages();
              setView("login");
            }}
          >
            Sign in
          </button>
        </div>
      </Shell>
    );
  }

  // ============================================
  // SIGN IN
  // ============================================

  return (
    <Shell>
      <h2>Sign in</h2>
      <p className="login-subtitle">
        Use the name and password you registered with
      </p>

      <form onSubmit={handleLogin}>
        <div className="login-group">
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="login-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="login-error">{error}</div>}

        {success && (
          <div className="login-success">{success}</div>
        )}

        <button
          type="submit"
          className="login-btn"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="auth-switch">
        Don&apos;t have an account?{" "}
        <button
          className="link-btn"
          onClick={() => {
            resetMessages();
            setView("landing");
          }}
        >
          Register
        </button>
      </div>
    </Shell>
  );
}

export default Login;
