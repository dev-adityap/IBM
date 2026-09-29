import { useState } from "react";
import axios from "axios";
import "./Login.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/visitors";

const AUTH_URL = API_URL.replace(
  "/api/visitors",
  "/api/auth"
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
          role
        }
      );

      setSuccess(
        response.data.message +
          ". You can now sign in."
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
          password
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
      <div className="login-page">

        <div className="login-card">

          <img
            className="login-logo"
            src="/favicon.ico"
            alt="VisitEase"
          />

          <h1>VisitEase</h1>

          <p className="login-subtitle">
            Visitor Management System
          </p>

          <p className="auth-prompt">
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

          <div className="login-footer">
            Secure role-based access
          </div>

        </div>

      </div>
    );
  }

  // ============================================
  // REGISTER
  // ============================================

  if (view === "register") {
    return (
      <div className="login-page">

        <div className="login-card">

          <img
            className="login-logo"
            src="/favicon.ico"
            alt="VisitEase"
          />

          <h1>
            {role === "admin"
              ? "Admin Sign Up"
              : "Visitor Register"}
          </h1>

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

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : role === "admin"
                ? "Create Admin Account"
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

        </div>

      </div>
    );
  }

  // ============================================
  // SIGN IN
  // ============================================

  return (
    <div className="login-page">

      <div className="login-card">

        <img
          className="login-logo"
          src="/favicon.ico"
          alt="VisitEase"
        />

        <h1>Sign In</h1>

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

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {success && (
            <div className="login-success">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
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

        <div className="login-footer">
          Secure role-based access
        </div>

      </div>

    </div>
  );
}

export default Login;
