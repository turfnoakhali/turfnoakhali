"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, MessageCircle, ShieldCheck, Trophy, Zap, ChevronRight } from "lucide-react";
import SlotBookingView from "@/components/SlotBookingView";

export default function BookingPage() {
  return (
    <main className="booking-page-root">
      {/* Top Banner */}
      <section className="booking-hero-banner">
        <div className="booking-hero-banner__bg">
          <Image
            src="/images/hero-banner-bright.jpg"
            alt="The Turf Noakhali"
            fill
            priority
            className="banner-bg-img"
          />
          <div className="banner-overlay"></div>
        </div>

        <div className="container banner-container">
          <div className="banner-breadcrumbs">
            <Link href="/">Home</Link>
            <ChevronRight size={14} />
            <span>Live Slot Booking</span>
          </div>

          <h1 className="banner-title">
            RESERVE YOUR <span className="text-gradient-emerald">MATCH SLOT</span>
          </h1>

          <p className="banner-desc">
            Book your squad's football match under the floodlights at The Turf Noakhali. Real-time availability, dynamic pricing, and instant confirmation via bKash.
          </p>

          <div className="banner-pills">
            <div className="pill-item">
              <Trophy size={14} className="pill-icon" />
              <span>FIFA-Standard Turf</span>
            </div>
            <div className="pill-item">
              <Zap size={14} className="pill-icon" />
              <span>Daylight Floodlights</span>
            </div>
            <div className="pill-item">
              <ShieldCheck size={14} className="pill-icon" />
              <span>৳500 Advance Lock</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Slot Booking View */}
      <section className="booking-view-section">
        <SlotBookingView />
      </section>

      {/* Booking Help Floating Assistance Banner */}
      <section className="booking-help-bar">
        <div className="container">
          <div className="help-bar-card">
            <div className="help-text">
              <h4>Need Immediate Assistance with Your Reservation?</h4>
              <p>Our ground coordinators are ready 24/7 to help you secure special tournament slots or customized timings.</p>
            </div>
            <div className="help-actions">
              <a href="tel:01355289797" className="secondary-button">
                <Phone size={16} />
                <span>Call: 01355289797</span>
              </a>
              <a
                href="https://wa.me/8801355289797"
                target="_blank"
                rel="noopener noreferrer"
                className="gold-button"
              >
                <MessageCircle size={16} />
                <span>WhatsApp Coordinator</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
