import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Clock, Award } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer__top">
                    {/* Brand Column */}
                    <div className="footer__column footer__brand-col">
                        <Link href="/" className="footer__brand-link" aria-label="The Turf Noakhali">
                            <Image
                                src="/images/the-turf-noakhali-logo.png"
                                alt="The Turf Noakhali Logo"
                                width={75}
                                height={75}
                                className="footer__logo"
                            />
                        </Link>
                        <p className="footer__description">
                            Where Champions Play. Premier FIFA-grade artificial football turf arena in Noakhali. Equipped with professional daylight LED floodlights, 9-A-side format, and instant online reservations.
                        </p>
                        <div className="footer__payment-badge">
                            <span className="badge-label">Verified Online Payments</span>
                            <div className="badge-row">
                                <Image
                                    src="/images/bkash-logo.webp"
                                    alt="bKash Payment"
                                    width={40}
                                    height={24}
                                    className="bkash-img"
                                />
                                <span>bKash Accepted</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div className="footer__column">
                        <h4 className="footer__heading">QUICK LINKS</h4>
                        <nav className="footer__nav">
                            <Link href="/">Home</Link>
                            <Link href="/booking">Live Booking</Link>
                            <Link href="/#facilities">Facilities & Amenities</Link>
                            <Link href="/#pricing">Rates & Shifts</Link>
                            <Link href="/#gallery">Photo Gallery</Link>
                            <Link href="/#faq">Rules & FAQ</Link>
                            <Link href="/#contact">Contact Us</Link>
                        </nav>
                    </div>

                    {/* Support & Legal Column */}
                    <div className="footer__column">
                        <h4 className="footer__heading">POLICY & ACCOUNT</h4>
                        <nav className="footer__nav">
                            <Link href="/dashboard">My Dashboard</Link>
                            <Link href="/signin">Sign In / Register</Link>
                            <Link href="/refund-and-cancellation">Refund & Cancellation</Link>
                            <Link href="/privacy-policy">Privacy Policy</Link>
                            <Link href="/terms-and-conditions">Terms & Conditions</Link>
                        </nav>
                    </div>

                    {/* Contact & Hours Column */}
                    <div className="footer__column footer__contact-col">
                        <h4 className="footer__heading">LOCATION & CONTACT</h4>
                        <div className="footer__contact-list">
                            <div className="contact-item contact-item--multiline">
                                <MapPin size={18} className="contact-icon" />
                                <a href="https://maps.google.com/?q=Chowrasta-Maijdee+Road,+Begumganj,+Noakhali" target="_blank" rel="noopener noreferrer">
                                    জয়নাল আবেদীন স্কুল এবং গ্লোব ফ্যাক্টরির মধ্যবর্তী স্থান, রাস্তার পশ্চিম পাশ, চৌরাস্তা-মাইজদী সড়ক, বেগমগঞ্জ, নোয়াখালী
                                </a>
                            </div>

                            <div className="contact-item">
                                <Phone size={18} className="contact-icon" />
                                <a href="tel:01355289797">Hotline: 01355289797</a>
                            </div>

                            <div className="contact-item">
                                <Mail size={18} className="contact-icon" />
                                <a href="mailto:turfnoakhali@gmail.com">turfnoakhali@gmail.com</a>
                            </div>

                            <div className="contact-item">
                                <Clock size={18} className="contact-icon" />
                                <span>Open 24/7 • All Days</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom Bar */}
                <div className="footer__bottom">
                    <p className="copyright-text">
                        &copy; {new Date().getFullYear()} The Turf Noakhali. All Rights Reserved. Crafted for Champions.
                    </p>
                    <div className="footer__bottom-links">
                        <Link href="/privacy-policy">Privacy</Link>
                        <span>•</span>
                        <Link href="/terms-and-conditions">Terms</Link>
                        <span>•</span>
                        <Link href="/refund-and-cancellation">Refund Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
