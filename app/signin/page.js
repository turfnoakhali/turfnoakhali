"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Phone, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function SigninPage() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        phone: form.phone,
        password: form.password,
        redirect: false,
      });

      setLoading(false);

      if (!res?.error) {
        toast.success("Welcome back! Login successful.");
        window.location.href = "/dashboard";
      } else {
        toast.error("Invalid phone number or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-prestige-section">
      <div className="auth-prestige-card">
        {/* Left Visual Column */}
        <div className="auth-visual-col">
          <Image
            src="/images/hero-banner-bright.jpg"
            alt="The Turf Noakhali"
            fill
            priority
            className="auth-bg-img"
          />
          <div className="auth-overlay"></div>
          <div className="auth-visual-content">
            <div className="auth-badge">
              <span>WHERE CHAMPIONS PLAY</span>
            </div>
            <h2 className="auth-hero-title">
              THE TURF <br />
              <span className="text-gradient-emerald">NOAKHALI</span>
            </h2>
            <p className="auth-hero-sub">
              Sign in to manage your match reservations, check team booking history, and unlock exclusive weekday discounts.
            </p>
            <div className="auth-trust-pill">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>FIFA-Standard Multi-Sports Complex</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="auth-form-col">
          <div className="auth-form-header">
            <Link href="/" className="auth-logo-link">
              <Image
                src="/images/the-turf-noakhali-logo.png"
                alt="The Turf Noakhali"
                width={54}
                height={54}
                className="auth-logo"
              />
            </Link>
            <h3 className="auth-title">Welcome Back</h3>
            <p className="auth-sub">Enter your phone & password to sign in</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <div className="form-input-box">
                <Phone size={17} className="input-icon" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <Link href="/contactus" className="forgot-link">
                  Forgot?
                </Link>
              </div>
              <div className="form-input-box">
                <Lock size={17} className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="auth-error-msg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="primary-button auth-submit-btn"
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              <ArrowRight size={16} />
            </button>

            <div className="auth-footer-prompt">
              <span>Don't have an account? </span>
              <Link href="/signup" className="auth-action-link">
                Create Account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
