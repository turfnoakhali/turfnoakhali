"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, Phone, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const isValidBDPhone = (phone) => {
  const bdRegex = /^(013|014|015|016|017|018|019)\d{8}$/;
  return bdRegex.test(phone);
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!isValidBDPhone(form.phone)) {
      toast.error(
        "Phone must be 11 digits and start with 013, 014, 015, 016, 017, 018, or 019"
      );
      setLoading(false);
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Account created successfully!");
        setTimeout(() => router.push("/dashboard"), 1200);
      } else {
        toast.error(data?.error || "Failed to create account");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong, please try again");
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
              <span>JOIN THE ARENA</span>
            </div>
            <h2 className="auth-hero-title">
              THE TURF <br />
              <span className="text-gradient-emerald">NOAKHALI</span>
            </h2>
            <p className="auth-hero-sub">
              Create your account to unlock priority slot bookings, earn discounts, and track all your match receipts in one place.
            </p>
            <div className="auth-trust-pill">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Instant Online bKash & Nagad Integration</span>
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
            <h3 className="auth-title">Create Account</h3>
            <p className="auth-sub">Enter your details to register as a player</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="form-input-box">
                <User size={17} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ahad Chowdhury"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="form-input-box">
                <Phone size={17} className="input-icon" />
                <input
                  type="tel"
                  className="form-input"
                  placeholder="01XXXXXXXXX"
                  value={form.phone}
                  maxLength={11}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-box">
                <Mail size={17} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="yourname@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-box">
                <Lock size={17} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="form-input-box">
                <Lock size={17} className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="primary-button auth-submit-btn"
            >
              <span>{loading ? "Creating Account..." : "Sign Up"}</span>
              <ArrowRight size={16} />
            </button>

            <div className="auth-footer-prompt">
              <span>Already have an account? </span>
              <Link href="/signin" className="auth-action-link">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
