"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  MessageCircle,
  ShieldCheck,
  Trophy,
  Zap,
  Users,
  ChevronRight,
} from "lucide-react";
import SlotBookingView from "@/components/SlotBookingView";

export default function BookingPage() {
  return (
    <main className="booking-page-root">
      {/* Top Hero Banner Matching Amishapara Sports Hub */}
      <section className="booking-hero-banner">
        <div className="booking-hero-banner__bg">
          <Image
            src="/images/hero-banner-bright.jpg"
            alt="The Turf Noakhali"
            fill
            priority
            quality={85}
            sizes="100vw"
            className="banner-bg-img"
          />
          <div className="banner-overlay"></div>
          <div className="banner-radial-glow"></div>
        </div>

        <div className="container banner-container">
          <div className="banner-breadcrumbs">
            <Link href="/" className="crumb-link">
              Home
            </Link>
            <ChevronRight size={13} className="crumb-separator" />
            <span className="crumb-active">Booking</span>
          </div>

          <h1 className="banner-title">
            BOOK YOUR <span className="accent-glow">SLOT</span>
          </h1>

          <p className="banner-desc">
            Select your date, time and team size to book your turf at The Turf Noakhali.
            Real-time availability, dynamic pricing, and instant confirmation via bKash.
          </p>

          <div className="banner-pills">
            <div className="pill-item">
              <div className="pill-icon-circle">
                <Trophy size={13} />
              </div>
              <span>Premium FIFA Turf</span>
            </div>

            <div className="pill-item">
              <div className="pill-icon-circle">
                <Users size={13} />
              </div>
              <span>9-A Side (Per Team)</span>
            </div>

            <div className="pill-item">
              <div className="pill-icon-circle">
                <Zap size={13} />
              </div>
              <span>Bright Floodlights Play Day &amp; Night</span>
            </div>

            <div className="pill-item">
              <div className="pill-icon-circle">
                <ShieldCheck size={13} />
              </div>
              <span>Easy Booking &amp; Confirmation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main 12-Column Slot Booking View */}
      <section className="booking-view-section">
        <div className="container">
          <SlotBookingView />
        </div>
      </section>

      {/* Booking Help Assistance Banner */}
      <section className="booking-help-bar">
        <div className="container">
          <div className="help-bar-card">
            <div className="help-text">
              <h4>Need Immediate Assistance with Your Reservation?</h4>
              <p>
                Our ground coordinators are ready 24/7 to help you secure match slots,
                tournaments, or customized team timings.
              </p>
            </div>
            <div className="help-actions">
              <a href="tel:01355289797" className="secondary-button">
                <Phone size={15} />
                <span>Call: 01355289797</span>
              </a>
              <a
                href="https://wa.me/8801355289797"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-pill"
              >
                <MessageCircle size={15} />
                <span>WhatsApp Coordinator</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
