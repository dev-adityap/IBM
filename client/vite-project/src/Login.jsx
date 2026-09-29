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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${AUTH_URL}/login`,
        {
          email,
          password
        }
      );

      const { token, user } = response.data;

      // Store authentication information
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // Send user back to App
      onLogin(user);

    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          V
        </div>

        <h1>VisitEase</h1>

        <p className="login-subtitle">
          Visitor Management System
        </p>

        <form onSubmit={handleLogin}>

          <div className="login-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="login-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
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
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <div className="login-footer">
          Secure role-based access
        </div>

      </div>

    </div>
  );
}

export default Login;