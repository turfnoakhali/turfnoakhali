"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu as MenuIcon, X as CloseIcon, Phone, User, CalendarCheck } from "lucide-react";

import Menu from "./api/menuApi";
import HeaderNav from "./HeaderNav";

const Header = () => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const [isScrolled, setIsScrolled] = useState(false);

  const [menuData] = useState(Menu);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`header-amishapara ${isScrolled ? "scrolled" : ""}`}>
      <div className="container">
        <div className="header-amishapara__content">
          {/* Logo */}
          <div className="header-amishapara__brand">
            <Link href="/" className="brand-link" aria-label="The Turf Noakhali">
              <div className="brand-logo-wrap">
                <Image
                  src="/images/the-turf-noakhali-logo.png"
                  alt="The Turf Noakhali"
                  width={56}
                  height={56}
                  priority
                  className="brand-logo-img"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="header-amishapara__nav desktop-nav">
            <HeaderNav menuDataAtt={menuData} />

            {/* Hotline Link */}
            <a href="tel:01355289797" className="hotline-pill">
              <Phone size={14} className="hotline-icon" />
              <span>01355289797</span>
            </a>

            {/* Account / Sign In */}
            {session?.user ? (
              <Link href="/dashboard" className="user-account-btn">
                <User size={15} />
                <span>{session.user.name || "Account"}</span>
              </Link>
            ) : (
              <Link href="/signin" className="signin-link-btn">
                <User size={15} />
                <span>Sign In</span>
              </Link>
            )}

            {/* Primary Booking CTA */}
            <Link href="/booking" className="primary-button header-book-btn">
              <CalendarCheck size={16} />
              <span>Book Slot</span>
            </Link>
          </nav>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <CloseIcon size={24} color="#0b3b24" /> : <MenuIcon size={24} color="#0b3b24" />}
          </button>

          {/* Mobile Drawer */}
          {isMenuOpen && (
            <div className="mobile-drawer-overlay" onClick={toggleMenu}>
              <div className="mobile-drawer-card" onClick={(e) => e.stopPropagation()}>
                <div className="drawer-top">
                  <Link href="/" onClick={toggleMenu} className="drawer-brand" aria-label="The Turf Noakhali">
                    <Image
                      src="/images/the-turf-noakhali-logo.png"
                      alt="The Turf Noakhali"
                      width={44}
                      height={44}
                      className="brand-logo-img"
                    />
                  </Link>

                  <button
                    type="button"
                    className="drawer-close-btn"
                    onClick={toggleMenu}
                    aria-label="Close menu"
                  >
                    <CloseIcon size={20} color="#4b5563" />
                  </button>
                </div>

                <div className="drawer-links">
                  {menuData.map((item) => (
                    <Link
                      key={item.id}
                      href={item.menuUrl}
                      onClick={toggleMenu}
                      className="drawer-nav-item"
                    >
                      {item.menuText}
                    </Link>
                  ))}
                </div>

                <div className="drawer-actions">
                  <a href="tel:01355289797" className="drawer-hotline-btn">
                    <Phone size={16} />
                    <span>Call Hotline: 01355289797</span>
                  </a>

                  {session?.user ? (
                    <Link
                      href="/dashboard"
                      onClick={toggleMenu}
                      className="drawer-account-btn"
                    >
                      <User size={16} />
                      <span>My Account ({session.user.name})</span>
                    </Link>
                  ) : (
                    <Link
                      href="/signin"
                      onClick={toggleMenu}
                      className="drawer-account-btn"
                    >
                      <User size={16} />
                      <span>Sign In / Register</span>
                    </Link>
                  )}

                  <Link
                    href="/booking"
                    onClick={toggleMenu}
                    className="primary-button drawer-book-btn"
                  >
                    <CalendarCheck size={18} />
                    <span>Book Your Slot</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
