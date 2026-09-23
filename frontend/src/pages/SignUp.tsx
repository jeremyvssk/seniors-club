import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Mail } from "lucide-react";
import { AxiosError } from "axios";
import api from "../api/axios";
import { AuthFrame, PasswordInput } from "./LogIn";
import { saveSession } from "../lib/session";

const SeniorsClubSignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [tried, setTried] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const emailBad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const tooShort = password.length < 6;
  const mismatch = repeatPassword !== password;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTried(true);
    if (emailBad || tooShort || mismatch) return;

    setLoading(true);
    setError("");

    try {
      await api.post("/signup", { email: email.trim(), password });
      const loginResponse = await api.post("/login", { email: email.trim(), password });

      const token = loginResponse.data.token;
      saveSession(token, loginResponse.data.user);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      navigate("/complete-profile", { replace: true });
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      console.error("Sign up error:", error);
      if (error.response) {
        setError(error.response.data?.message || "We couldn’t create your account. Please try again.");
      } else {
        setError("We can’t reach the server. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame>
      <div>
        <h1 className="auth-h1">Create an account</h1>
        <p className="flow-sub">It’s free. Next, we’ll ask a few questions for your profile.</p>
      </div>

      {error && (
        <div className="alert" role="alert">
          <AlertCircle className="s" style={{ marginTop: 2 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form" noValidate>
        <div className="field">
          <label htmlFor="email">Email</label>
          <div className={`inp${tried && emailBad ? " err" : ""}`}>
            <Mail className="s" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          {tried && emailBad && <p className="field-err">That doesn’t look like an email address</p>}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
            invalid={tried && tooShort}
          />
          <p className={tried && tooShort ? "field-err" : "field-help"}>At least 6 characters</p>
        </div>

        <div className="field">
          <label htmlFor="repeatpassword">Password again</label>
          <PasswordInput
            id="repeatpassword"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
            invalid={tried && mismatch}
          />
          {tried && mismatch && <p className="field-err">The two passwords are different</p>}
        </div>

        <button type="submit" className="b-lg pri btn" style={{ width: "100%", marginTop: 6 }} disabled={loading}>
          {loading ? "Creating your account…" : "Create account"}
        </button>
      </form>

      <p className="auth-alt">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthFrame>
  );
};

export default SeniorsClubSignUp;
