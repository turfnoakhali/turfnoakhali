"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ShieldCheck,
  Trophy,
  Zap,
  CheckCircle2,
  Phone,
  MessageCircle,
  Mail,
  ChevronRight,
  ChevronDown,
  Layers,
  Award,
  Flame,
  Users,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Droplets,
  Activity,
  Video,
  Shirt,
  Compass,
  MapPin,
  Lightbulb,
  Car,
  Heart,
  Star,
  Target,
} from "lucide-react";
import SlotBookingView from "./SlotBookingView";

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? -1 : index);
  };

  const amenities = [
    {
      icon: Lightbulb,
      title: "Stadium Floodlights",
      desc: "Stadium-grade high-lumen LED lighting engineered for evening and night matches.",
    },
    {
      icon: Car,
      title: "Safe Parking",
      desc: "Dedicated secure parking space for players' motorbikes and cars right at the venue.",
    },
    {
      icon: Droplets,
      title: "Drinking Water",
      desc: "Free purified and cold mineral water dispenser available for all active teams.",
    },
    {
      icon: Users,
      title: "Washroom & Shower",
      desc: "Separated, hygienic toilets and refreshing post-match shower stalls for players.",
    },
    {
      icon: Video,
      title: "Match Video Recording",
      desc: "HD match highlight recording of your squad's top goals captured live.",
    },
    {
      icon: Shirt,
      title: "Team Bibs & Accessories",
      desc: "Clean match aprons, color-coded bibs, and official match footballs provided.",
    },
    {
      icon: ShieldCheck,
      title: "Changing Room & Dugout",
      desc: "Spacious player changing facilities and covered dugout benches on pitch-side.",
    },
    {
      icon: Zap,
      title: "Continuous Power Backup",
      desc: "24/7 dedicated generator support ensuring zero interruption to your night match.",
    },
  ];

  const whyUsFeatures = [
    {
      title: "50mm FIFA Quality Artificial Grass",
      desc: "Shock-absorbing dual-layer infill minimizes player joint fatigue and injury risks, giving you smooth ball roll and natural bounce.",
      icon: Layers,
    },
    {
      title: "High-Lux Glare-Free Floodlights",
      desc: "Uniform pitch illumination engineered specifically for crystal clear high-speed ball tracking and 4K recording at night.",
      icon: Zap,
    },
    {
      title: "Instant Online Slot Reservation",
      desc: "Real-time schedule booking with zero double-booking possibility and automatic bKash / Nagad verification.",
      icon: ShieldCheck,
    },
  ];

  const shiftPricingData = [
    {
      id: "open",
      name: "Open Shift",
      time: "06:00 AM - 11:00 AM",
      regularPrice: 1700,
      discountPrice: 1100,
      saveAmount: 600,
      badge: "MORNING FIT",
      icon: Sunrise,
      desc: "Fresh daylight atmosphere, optimal for fitness routines, academy drills and early friendly matches.",
      isPopular: false,
    },
    {
      id: "mid",
      name: "Mid Shift",
      time: "11:00 AM - 03:00 PM",
      regularPrice: 1500,
      discountPrice: 1000,
      saveAmount: 500,
      badge: "BEST VALUE",
      icon: Sun,
      desc: "Maximum savings with full field turf access. Best budget choice for student squads and casual friendlies.",
      isPopular: false,
    },
    {
      id: "afternoon",
      name: "Afternoon Shift",
      time: "03:00 PM - 05:00 PM",
      regularPrice: 2000,
      discountPrice: 1500,
      saveAmount: 500,
      badge: "GOLDEN HOUR",
      icon: Sunset,
      desc: "Prime golden hour football with pleasant temperature, cool breeze and natural light before sundown.",
      isPopular: false,
    },
    {
      id: "night",
      name: "Night Shift",
      time: "05:00 PM - 01:00 AM",
      regularPrice: 2800,
      discountPrice: 2200,
      saveAmount: 600,
      badge: "MOST POPULAR",
      icon: Moon,
      desc: "Electric tournament match atmosphere under stadium-grade LED floodlights throughout peak evening hours.",
      isPopular: true,
    },
    {
      id: "close",
      name: "Close Shift",
      time: "01:00 AM - 06:00 AM",
      regularPrice: 2500,
      discountPrice: 2000,
      saveAmount: 500,
      badge: "MIDNIGHT SPECIAL",
      icon: Clock,
      desc: "Midnight madness for die-hard teams and weekend night leagues with 100% uninterrupted power backup.",
      isPopular: false,
    },
  ];

  const galleryItems = [
    {
      src: "/images/1.jpg",
      title: "Tournament Final Clash",
      tag: "Match Action",
      desc: "Intense local football matches under stadium lights.",
    },
    {
      src: "/images/2.jpg",
      title: "Night Floodlit Energy",
      tag: "Atmosphere",
      desc: "Full pitch action with crisp daylight LED visibility.",
    },
    {
      src: "/images/3.jpg",
      title: "Victory Celebration",
      tag: "Community",
      desc: "Squads celebrating their tournament championship win.",
    },
    {
      src: "/images/4.jpg",
      title: "Pre-Match Lineup",
      tag: "Lineup",
      desc: "Captains and teams gearing up for kickoff in the cage.",
    },
    {
      src: "/images/5.jpg",
      title: "Evening Training Drill",
      tag: "Training",
      desc: "Academy squads sharpening tactical skills.",
    },
    {
      src: "/images/6.JPG",
      title: "Precision Strike",
      tag: "Action",
      desc: "High rebound tension netting keeping the game moving.",
    },
    {
      src: "/images/7.JPG",
      title: "Fast-Paced Footwork",
      tag: "Dribble",
      desc: "Non-slip FIFA certified synthetic turf providing peak agility.",
    },
    {
      src: "/images/8.jpg",
      title: "Under The Floodlights",
      tag: "Night Game",
      desc: "Clean, safe, and exciting football action with your friends.",
    },
  ];

  const testimonials = [
    {
      id: "t-1",
      name: "Sabbir Rahman",
      role: "CAPTAIN, NOAKHALI WARRIORS",
      rating: 5,
      review:
        "No more rolling start of matches! This turf is the best we've ever used in Noakhali. Perfect grip, perfect bounce. Our Friday 8 PM slot is always booked in advance.",
    },
    {
      id: "t-2",
      name: "Fahadul Islam",
      role: "MANAGER, SONAIMURI FC",
      rating: 5,
      review:
        "We love how the arena stays clean and well-lit. Booking through the website with bKash advance is super fast and reliable. Highly recommended for all football teams!",
    },
    {
      id: "t-3",
      name: "Tawhid Chowdhury",
      role: "ORGANIZER, UNITED NOAKHALI",
      rating: 5,
      review:
        "Awesome customer portal. Our receipts, match schedules, and advance payments are all in one place. Best artificial turf and management in the region.",
    },
  ];

  const faqs = [
    {
      q: "How do I secure my reservation?",
      a: "Select your preferred slot from our Live Schedule, provide your team details, and pay a 500 BDT advance via bKash/Nagad. You will receive an instant confirmation.",
    },
    {
      q: "Can I cancel or reschedule my match?",
      a: "Yes! Contact the turf hotline at 01355289797 or WhatsApp us. Cancellations made 24 hours before kick-off are eligible for easy rescheduling.",
    },
    {
      q: "How early should my team arrive?",
      a: "Please arrive at least 15 minutes before your scheduled slot so players can gear up in the changing rooms and start right on time.",
    },
    {
      q: "Is water provided at the ground?",
      a: "Yes, we provide pure filtered chilled drinking water for all active teams at no cost.",
    },
    {
      q: "What footwear is allowed on the turf?",
      a: "Specialized turf shoes (TF rubber studs) or standard athletic trainers/sneakers are recommended. Hard metal studs are strictly prohibited to safeguard the grass.",
    },
  ];

  return (
    <div className="landing-amishapara-root">
      {/* =================================================================
          1. HERO SECTION (Matching Amishapara Sports Hub)
         ================================================================= */}
      <section className="hero-amishapara">
        <div className="hero-amishapara__bg-wrap">
          <Image
            src="/images/hero-banner-bright.jpg"
            alt="The Turf Noakhali"
            fill
            priority
            sizes="100vw"
            quality={90}
            className="hero-amishapara__bg-img"
          />
          <div className="hero-amishapara__overlay"></div>
        </div>

        <div className="container hero-amishapara__container">
          <div className="hero-amishapara__grid">
            {/* Left Content */}
            <div className="hero-amishapara__left">
              <div className="hero-badge-pill">
                <span className="badge-bullet"></span>
                <span>THE TURF NOAKHALI</span>
              </div>

              <h1 className="hero-headline">
                <span className="headline-block">
                  PLAY <span className="headline-highlight">FOOTBALL</span>
                </span>
                <span className="headline-block">LIVE PASSION</span>
                <span className="headline-block headline-sub">AT THE TURF NOAKHALI</span>
              </h1>

              <div className="hero-subtitles">
                <p className="hero-sub-p">
                  <span className="sub-bullet"></span>
                  <span>Premium Turf • Modern Facilities</span>
                </p>
                <p className="hero-sub-p">
                  <span className="sub-bullet"></span>
                  <span>Safe &amp; Enjoyable Environment</span>
                </p>
              </div>

              <div className="hero-actions">
                <Link href="#live-slots" className="primary-button hero-btn-main">
                  <span>Book Your Slot</span>
                  <ChevronRight size={16} />
                </Link>

                <a href="#facilities" className="primary-button hero-btn-main">
                  <span>Explore Facilities</span>
                  <ChevronRight size={16} />
                </a>
              </div>
            </div>


          </div>

          {/* Bottom Floating Info Strip */}
          <div className="hero-bottom-strip">
            <div className="strip-item">
              <div className="strip-icon-box">
                <MapPin size={20} />
              </div>
              <div className="strip-text">
                <span className="strip-title">Noakhali,</span>
                <span className="strip-sub">Sonaimuri / Companigonj</span>
              </div>
            </div>

            <div className="strip-divider"></div>

            <a href="tel:01355289797" className="strip-item strip-link">
              <div className="strip-icon-box">
                <Phone size={20} />
              </div>
              <div className="strip-text">
                <span className="strip-title">01355 289 797</span>
                <span className="strip-sub">Call for Booking</span>
              </div>
            </a>

            <div className="strip-divider"></div>

            <div className="strip-item">
              <div className="strip-icon-box">
                <Users size={20} />
              </div>
              <div className="strip-text">
                <span className="strip-title">6-7 Players</span>
                <span className="strip-sub">(Per Team)</span>
              </div>
            </div>

            <div className="strip-divider"></div>

            <div className="strip-item">
              <div className="strip-icon-box">
                <Clock size={20} />
              </div>
              <div className="strip-text">
                <span className="strip-title">Premium Lighting</span>
                <span className="strip-sub">Play Day &amp; Night</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          2. ABOUT US SECTION (White Background)
         ================================================================= */}
      <section id="about" className="section-about">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <div className="section-badge-green">ABOUT US</div>
              <h2 className="section-title-dark">THE TURF NOAKHALI</h2>
              <p className="section-desc-gray">
                A premier football turf in Noakhali, built for football lovers. Enjoy high-quality artificial turf, professional lighting, and a friendly environment for your matches. Whether it's a friendly game, team practice, or a high-stakes tournament, The Turf Noakhali is the perfect place to play.
              </p>
              <div className="about-action">
                <Link href="#live-slots" className="primary-button">
                  <span>View Schedule</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            <div className="about-media-card">
              <div className="media-img-wrap">
                <Image
                  src="/images/1.jpg"
                  alt="Stadium atmosphere at The Turf Noakhali"
                  fill
                  className="media-img"
                />
                <div className="media-overlay">
                  <span className="media-tag">LIVE RECORDING</span>
                  <h4 className="media-title">Experience the stadium atmosphere</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          3. LIVE GROUND SCHEDULE SECTION (#live-slots)
         ================================================================= */}
      <section id="live-slots" className="section-schedule">
        <div className="container">
          <div className="section-header-center">
            <div className="section-badge-green">LIVE GROUND SCHEDULE</div>
            <h2 className="section-title-dark">Today's Match Availability</h2>
            <p className="section-desc-gray">
              Real-time booking matrix. Select any available slot to initiate instant reservation.
            </p>
            <div className="notice-chip">
              <span>⚡ Instant confirmation • 100% Refund guarantee on 24h prior cancellations • BDT 500 Advance</span>
            </div>
          </div>

          {/* Embedded Slot Booking View */}
          <div className="schedule-booking-card">
            <SlotBookingView />
          </div>
        </div>
      </section>

      {/* =================================================================
          OFFICIAL 5-SHIFT PRICING MATRIX SECTION (#pricing)
         ================================================================= */}
      <section id="pricing" className="section-pricing-matrix">
        <div className="container">
          <div className="section-header-center">
            <div className="section-badge-green">OFFICIAL 5-SHIFT PRICING MATRIX</div>
            <h2 className="section-title-dark">Simple, Transparent Shift Pricing</h2>
            <p className="section-desc-gray">
              Standard full pitch match slots with special discounted rates for online reservations. Book any shift with minimum ৳500 advance.
            </p>
          </div>

          <div className="pricing-matrix-grid">
            {shiftPricingData.map((shift) => {
              const Icon = shift.icon;
              return (
                <div
                  key={shift.id}
                  className={`pricing-shift-card ${shift.isPopular ? "is-popular-card" : ""}`}
                >
                  {shift.isPopular && (
                    <div className="popular-badge-pill">
                      <span>MOST POPULAR • 8 SLOTS</span>
                    </div>
                  )}

                  <div className="shift-card-header">
                    <div className="shift-icon-box">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="shift-name">{shift.name}</h3>
                      <span className="shift-time-pill">{shift.time}</span>
                    </div>
                  </div>

                  <div className="shift-price-box">
                    <div className="price-row">
                      <span className="discount-price">৳{shift.discountPrice.toLocaleString()}</span>
                      <span className="price-unit">BDT / SLOT</span>
                    </div>
                    <div className="regular-price-row">
                      <span className="regular-label">Regular:</span>
                      <span className="regular-price">৳{shift.regularPrice.toLocaleString()}</span>
                      <span className="save-badge">SAVE ৳{shift.saveAmount}</span>
                    </div>
                  </div>

                  <p className="shift-desc">{shift.desc}</p>

                  <ul className="shift-perks-list">
                    <li>
                      <CheckCircle2 size={15} className="perk-icon" />
                      <span>Full 50mm FIFA Synthetic Turf</span>
                    </li>
                    <li>
                      <CheckCircle2 size={15} className="perk-icon" />
                      <span>High-Lux LED Floodlights</span>
                    </li>
                    <li>
                      <CheckCircle2 size={15} className="perk-icon" />
                      <span>Bibs & Match Balls Provided</span>
                    </li>
                    <li>
                      <CheckCircle2 size={15} className="perk-icon" />
                      <span>Pure Filtered Drinking Water</span>
                    </li>
                  </ul>

                  <Link href="#live-slots" className="shift-book-btn">
                    <span>Book This Shift</span>
                    <ChevronRight size={15} />
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="pricing-guarantee-strip">
            <div className="guarantee-item">
              <ShieldCheck size={18} className="guarantee-icon" />
              <span><strong>Instant Slot Lock:</strong> ৳500 minimum bKash advance secures your match reservation.</span>
            </div>
            <div className="guarantee-item">
              <CheckCircle2 size={18} className="guarantee-icon" />
              <span><strong>100% Refund Guarantee:</strong> Cancel up to 24 hours prior for a full refund.</span>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          4. WHY US SECTION ("Engineered for Football Perfection")
         ================================================================= */}
      <section className="section-why-us">
        <div className="container">
          <div className="section-header-center">
            <div className="section-badge-green">WHY THE TURF NOAKHALI</div>
            <h2 className="section-title-dark">Engineered for Football Perfection</h2>
            <p className="section-desc-gray">
              From sub-base shock drainage to high-lux stadium illumination, experience top tier sports management.
            </p>
          </div>

          <div className="why-us-grid">
            {whyUsFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="why-us-card">
                  <div className="why-icon-box">
                    <Icon size={26} />
                  </div>
                  <h3 className="why-title">{item.title}</h3>
                  <p className="why-desc">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================================================================
          5. GROUND AMENITIES SECTION
         ================================================================= */}
      <section id="facilities" className="section-amenities">
        <div className="container">
          <div className="section-header-center">
            <div className="section-badge-green">GROUND AMENITIES</div>
            <h2 className="section-title-dark">Stadium-Grade Facilities</h2>
            <p className="section-desc-gray">
              Professional ground standards designed for maximum match-day enjoyment.
            </p>
          </div>

          <div className="amenities-grid">
            {amenities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="amenity-card">
                  <div className="amenity-icon-wrap">
                    <Icon size={22} />
                  </div>
                  <div className="amenity-info">
                    <h4 className="amenity-title">{item.title}</h4>
                    <p className="amenity-desc">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================================================================
          6. ARENA GALLERY SECTION (#gallery)
         ================================================================= */}
      <section id="gallery" className="section-gallery-showcase">
        <div className="container">
          <div className="section-header-center">
            <div className="section-badge-green">ARENA GALLERY &amp; CLIPS</div>
            <h2 className="section-title-dark">Matchday Energy &amp; Action</h2>
            <p className="section-desc-gray">
              Witness thrilling moments, team tournaments, and stadium atmosphere captured live.
            </p>
          </div>

          <div className="gallery-card-grid">
            {galleryItems.map((item, idx) => (
              <div key={idx} className="gallery-card">
                <div className="gallery-card-img-box">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="gallery-card-img"
                  />
                  <span className="gallery-card-tag">{item.tag}</span>
                </div>
                <div className="gallery-card-info">
                  <h4 className="card-match-title">{item.title}</h4>
                  <p className="card-match-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================================
          7. TESTIMONIALS SECTION ("PLAYERS VOICE")
         ================================================================= */}
      <section className="section-testimonials">
        <div className="container">
          <div className="section-header-center">
            <div className="section-badge-green">PLAYERS VOICE</div>
            <h2 className="section-title-dark">Trusted by Hundreds of Local Teams</h2>
            <p className="section-desc-gray">
              Hear from team captains, managers, and players who play regularly on our pitch.
            </p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((item) => (
              <div key={item.id} className="testimonial-card">
                <div className="rating-stars">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={16} className="star-fill" />
                  ))}
                </div>
                <p className="review-quote">"{item.review}"</p>
                <div className="reviewer-info">
                  <h4 className="reviewer-name">{item.name}</h4>
                  <span className="reviewer-role">{item.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================================
          8. FREQUENTLY ASKED QUESTIONS SECTION (#faq)
         ================================================================= */}
      <section id="faq" className="section-faqs">
        <div className="container">
          <div className="section-header-center">
            <div className="section-badge-green">FREQUENTLY ASKED QUESTIONS</div>
            <h2 className="section-title-dark">Got Questions? We Have Answers</h2>
            <p className="section-desc-gray">
              Find clear details on booking policies, payments, amenities, and ground rules.
            </p>
          </div>

          <div className="faqs-accordion">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`faq-card ${isOpen ? "faq-card--open" : ""}`}
                  onClick={() => toggleFaq(idx)}
                >
                  <div className="faq-card-question">
                    <span className="faq-q-text">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className="faq-arrow"
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.25s ease",
                      }}
                    />
                  </div>
                  {isOpen && (
                    <div className="faq-card-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================================================================
          9. LOCATION & CONTACT SECTION (#contact)
         ================================================================= */}
      <section id="contact" className="section-contact-location">
        <div className="container">
          <div className="section-header-center">
            <div className="section-badge-green">LOCATION &amp; CONTACT</div>
            <h2 className="section-title-dark">Find Our Arena &amp; Get In Touch</h2>
            <p className="section-desc-gray">
              Visit The Turf Noakhali for high-voltage football action or reach out directly to book slots and organize tournaments.
            </p>
          </div>

          <div className="contact-layout-grid">
            {/* Left Column: Direct Contact Info Cards */}
            <div className="contact-cards-col">
              <a href="tel:01355289797" className="contact-info-card">
                <div className="contact-card-icon">
                  <Phone size={22} />
                </div>
                <div className="contact-card-content">
                  <span className="contact-card-label">Direct Hotline</span>
                  <span className="contact-card-val">01355289797</span>
                  <span className="contact-card-sub">Tap to call instantly for slot availability</span>
                </div>
              </a>

              <a
                href="https://wa.me/8801355289797"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-info-card"
              >
                <div className="contact-card-icon">
                  <MessageCircle size={22} />
                </div>
                <div className="contact-card-content">
                  <span className="contact-card-label">WhatsApp Support</span>
                  <span className="contact-card-val">+880 1355 289 797</span>
                  <span className="contact-card-sub">Instant chat, booking confirmation &amp; queries</span>
                </div>
              </a>

              <div className="contact-info-card">
                <div className="contact-card-icon">
                  <MapPin size={22} />
                </div>
                <div className="contact-card-content">
                  <span className="contact-card-label">Arena Location</span>
                  <span className="contact-card-val">The Turf Noakhali</span>
                  <span className="contact-card-sub">Companigonj, Noakhali, Bangladesh</span>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-card-icon">
                  <Clock size={22} />
                </div>
                <div className="contact-card-content">
                  <span className="contact-card-label">Opening Hours</span>
                  <span className="contact-card-val">Open 24/7 • Every Day</span>
                  <span className="contact-card-sub">Floodlit daylight LED ready around the clock</span>
                </div>
              </div>

              <a href="mailto:turfnoakhali@gmail.com" className="contact-info-card">
                <div className="contact-card-icon">
                  <Mail size={22} />
                </div>
                <div className="contact-card-content">
                  <span className="contact-card-label">Official Email</span>
                  <span className="contact-card-val">turfnoakhali@gmail.com</span>
                  <span className="contact-card-sub">For sponsorship, tournaments &amp; corporate events</span>
                </div>
              </a>
            </div>

            {/* Right Column: Interactive Map */}
            <div className="contact-map-col">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.023344707103!2d90.96260507438787!3d23.639334993033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37546900120d1447%3A0x129756cfae422568!2sCompanigonj%20Turf%20Zone!5e0!3m2!1sen!2sbd!4v1789580638671!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                className="contact-map-iframe"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="The Turf Noakhali Arena Location Map"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          10. CALL TO ACTION (CTA) SECTION (Dark Green Background)
         ================================================================= */}
      <section className="section-cta-amishapara">
        <div className="container">
          <div className="cta-box">
            <div className="cta-badge">READY FOR KICKOFF?</div>
            <h2 className="cta-heading">Book Your Match Slot Today</h2>
            <p className="cta-sub">
              Experience stadium-grade turf action with your friends and teammates in Noakhali.
            </p>

            <div className="cta-actions">
              <Link href="#live-slots" className="white-button">
                <span>Book Slot Instantly</span>
                <ChevronRight size={16} />
              </Link>

              <a href="tel:01355289797" className="outline-white-button">
                <Phone size={16} />
                <span>Call: 01355 289 797</span>
              </a>

              <a
                href="https://wa.me/8801355289797"
                target="_blank"
                rel="noopener noreferrer"
                className="gold-button"
              >
                <MessageCircle size={16} />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
