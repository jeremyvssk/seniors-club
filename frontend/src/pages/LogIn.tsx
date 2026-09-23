import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { AxiosError } from "axios";
import api from "../api/axios";
import { Logo } from "../components/ui/design";
import { saveSession } from "../lib/session";

type LogInFields = {
  email: string;
  password: string;
};

// Shared frame for log in and sign up
export const AuthFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="auth">
    <header className="ph-h auth-h">
      <Link to="/" style={{ color: "inherit", textDecoration: "none" }} aria-label="Seniors' Club home">
        <Logo />
      </Link>
    </header>
    <main className="auth-main">{children}</main>
  </div>
);

export const PasswordInput: React.FC<React.ComponentProps<"input"> & { invalid?: boolean }> = ({
  invalid,
  ...props
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className={`inp${invalid ? " err" : ""}`}>
      <Lock className="s" />
      <input {...props} type={show ? "text" : "password"} />
      <button type="button" className="ib btn" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((s) => !s)}>
        {show ? <EyeOff className="s" /> : <Eye className="s" />}
      </button>
    </div>
  );
};

const SeniorsClubLogIn: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LogInFields>();

  const onSubmit: SubmitHandler<LogInFields> = async (data) => {
    try {
      const response = await api.post("/login", {
        email: data.email.trim(),
        password: data.password,
      });

      saveSession(response.data.token, response.data.user);

      // checks if there is a profile
      navigate(response.data.user.profileComplete ? "/explore" : "/complete-profile");
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      if (error.response?.status === 401) {
        setError("root", { message: "That email and password don’t match. Check for typos and try again." });
      } else if (error.response) {
        setError("root", { message: "Something went wrong on our side. Please try again." });
      } else {
        setError("root", { message: "We can’t reach the server. Check your connection and try again." });
      }
    }
  };

  return (
    <AuthFrame>
      <div>
        <h1 className="auth-h1">Welcome back</h1>
        <p className="flow-sub">Log in to see who is nearby.</p>
      </div>

      {errors.root && (
        <div className="alert" role="alert">
          <AlertCircle className="s" style={{ marginTop: 2 }} />
          <span>{errors.root.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="form" noValidate>
        <div className="field">
          <label htmlFor="email">Email</label>
          <div className={`inp${errors.email ? " err" : ""}`}>
            <Mail className="s" />
            <input
              {...register("email", {
                required: "Enter your email",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, message: "That doesn’t look like an email address" },
              })}
              type="email"
              id="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="field-err">{errors.email.message}</p>}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <PasswordInput
            {...register("password", { required: "Enter your password" })}
            id="password"
            autoComplete="current-password"
            invalid={Boolean(errors.password || errors.root)}
          />
          {errors.password && <p className="field-err">{errors.password.message}</p>}
        </div>

        <button type="submit" className="b-lg pri btn" style={{ width: "100%", marginTop: 6 }} disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="auth-alt">
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </AuthFrame>
  );
};

export default SeniorsClubLogIn;
