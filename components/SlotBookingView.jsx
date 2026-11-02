"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import bkashLogo from "@/public/images/bkash-logo.webp";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Tag,
  User,
  Phone,
  FileText,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  Sunrise,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { calculateSlotPrice, isMaintenanceBlockedSlot, formatBengaliDate, getBengaliSlotPeriod } from "@/lib/pricing";

const ARENA_NAME = "Turf Noakhali";

export default function SlotBookingView() {
  const router = useRouter();
  const { data: session } = useSession();

  // Date selection state
  const getTodayStr = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [periodFilter, setPeriodFilter] = useState("all");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [arenaPricing, setArenaPricing] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Form State inside Modal
  const [formData, setFormData] = useState({
    arenaName: ARENA_NAME,
    bookingDate: getTodayStr(),
    timeSlot: "",
    notes: "",
    paymentType: "advance",
    bookingForName: "",
    bookingForPhone: "",
    advanceAmount: 500,
    couponCode: "",
    cashAmount: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [couponData, setCouponData] = useState(null);
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);

  // Role permissions
  const role = session?.user?.role;
  const allowedCODRoles = ["SUPER_ADMIN", "GENERAL_ADMIN", "MANAGER", "SPECIAL_CUSTOMER", "VIEWER"];
  const canUseCOD = allowedCODRoles.includes(role);
  const canEnterCashAmount = ["SUPER_ADMIN", "GENERAL_ADMIN", "MANAGER", "VIEWER"].includes(role);
  const isStaff = role && role !== "REGULAR_CUSTOMER";
  const isGuest = !session;
  const MIN_ADVANCE = 500;

  // Auto fill session user details
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        bookingForName: prev.bookingForName || session.user.name || "",
        bookingForPhone: prev.bookingForPhone || session.user.phone || "",
      }));
    }
  }, [session]);

  // Fetch Pricing for Arena
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch(`/api/pricing?arena=${encodeURIComponent(ARENA_NAME)}`);
        const data = await res.json();
        if (res.ok) setArenaPricing(data);
      } catch (err) {
        console.error("Error fetching pricing:", err);
      }
    };
    fetchPricing();
  }, []);

  // Fetch Slots when Date changes
  const fetchSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const res = await fetch(
        `/api/bookings/slots?arena=${encodeURIComponent(ARENA_NAME)}&date=${date}`
      );
      const data = await res.json();
      if (res.ok) {
        setSlots(data.slots || []);
      } else {
        setSlots([]);
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const clientIdRef = React.useRef(
    typeof window !== "undefined"
      ? Math.random().toString(36).substring(2) + Date.now().toString(36)
      : "client"
  );

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedSlot) {
        navigator.sendBeacon(
          "/api/bookings/hold",
          JSON.stringify({
            arenaName: ARENA_NAME,
            date: selectedDate,
            slot: selectedSlot.slot,
            action: "release",
            clientId: clientIdRef.current,
          })
        );
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [selectedSlot, selectedDate]);

  // Price helper for a slot
  const getSlotPriceDetails = (slotTime, date = selectedDate) => {
    return calculateSlotPrice(slotTime, date, arenaPricing);
  };

  // Open modal when slot "বুক করুন" is clicked
  const handleOpenBookingModal = async (slotItem) => {
    if (slotItem.status !== "available" || isMaintenanceBlockedSlot(selectedDate, slotItem.slot)) {
      toast.error("১ অক্টোবর রাত ১০:০০ টা পর্যন্ত স্লট বুকিং সাময়িকভাবে বন্ধ আছে।");
      return;
    }

    try {
      const res = await fetch("/api/bookings/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arenaName: ARENA_NAME,
          date: selectedDate,
          slot: slotItem.slot,
          action: "hold",
          clientId: clientIdRef.current,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "এই স্লটটি বর্তমানে অন্য একজন ব্যবহারকারী বুকিং প্রসেস করছেন।");
        fetchSlots(selectedDate);
        return;
      }

      setSelectedSlot(slotItem);
      setFormData((prev) => ({
        ...prev,
        bookingDate: selectedDate,
        timeSlot: slotItem.slot,
        paymentType: "advance",
        advanceAmount: 500,
      }));
      setCouponData(null);
      setErrors({});
      setIsModalOpen(true);
      fetchSlots(selectedDate);
    } catch (err) {
      console.error("Error setting hold:", err);
      toast.error("স্লট চেক করতে সমস্যা হয়েছে");
    }
  };

  const handleCloseModal = async () => {
    if (selectedSlot) {
      try {
        await fetch("/api/bookings/hold", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            arenaName: ARENA_NAME,
            date: selectedDate,
            slot: selectedSlot.slot,
            action: "release",
            clientId: clientIdRef.current,
          }),
        });
      } catch (err) {
        console.error("Error releasing hold:", err);
      }
    }
    setIsModalOpen(false);
    setSelectedSlot(null);
    fetchSlots(selectedDate);
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const selectedSlotPriceInfo = selectedSlot
    ? getSlotPriceDetails(selectedSlot.slot, selectedDate)
    : { basePrice: 0, isWeekend: false, weekdayDiscountAmount: 0, finalPrice: 0 };

  const currentSlotPrice = selectedSlotPriceInfo.finalPrice;
  const slotBasePrice = selectedSlotPriceInfo.basePrice;
  const weekdayDiscountAmount = selectedSlotPriceInfo.weekdayDiscountAmount;
  const couponDiscountAmount = couponData?.discountAmount || 0;
  const totalDiscountAmount = weekdayDiscountAmount + couponDiscountAmount;
  const finalPrice = Math.max(0, currentSlotPrice - couponDiscountAmount);

  // Apply Coupon
  const handleApplyCoupon = async () => {
    if (!formData.couponCode) {
      toast.error("কুপন কোড প্রবেশ করুন");
      return;
    }

    setVerifyingCoupon(true);
    try {
      const response = await fetch(
        `/api/coupons?code=${formData.couponCode}&amount=${currentSlotPrice}`
      );
      const data = await response.json();

      if (response.ok && data.valid) {
        setCouponData(data.coupon);
        toast.success(`কুপন প্রয়োগ হয়েছে! ৳${data.coupon.discountAmount} ছাড় পেয়েছেন`);
      } else {
        toast.error(data.message || "অবৈধ কুপন কোড");
        setCouponData(null);
      }
    } catch (error) {
      toast.error("কুপন যাচাইকরণে সমস্যা হয়েছে");
      setCouponData(null);
    } finally {
      setVerifyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponData(null);
    setFormData((prev) => ({ ...prev, couponCode: "" }));
    toast.success("কুপন সরিয়ে দেওয়া হয়েছে");
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.bookingDate) newErrors.bookingDate = "তারিখ নির্বাচন করুন";
    if (!formData.timeSlot) newErrors.timeSlot = "সময় স্লট নির্বাচন করুন";
    if (!formData.paymentType) newErrors.paymentType = "পেমেন্ট মাধ্যম নির্বাচন করুন";

    if (isStaff || isGuest) {
      if (!formData.bookingForName?.trim()) newErrors.bookingForName = "আপনার নাম প্রয়োজন";
      if (!formData.bookingForPhone?.trim()) newErrors.bookingForPhone = "আপনার ফোন নম্বর প্রয়োজন";
    }

    if (formData.paymentType === "advance" && formData.advanceAmount < MIN_ADVANCE) {
      newErrors.advanceAmount = `সর্বনিম্ন অগ্রিম পেমেন্ট ৳${MIN_ADVANCE}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Booking
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await Swal.fire({
      title: "বুকিং নিশ্চিত করুন",
      html: `
        <div style="text-align: left; padding: 10px; font-family: sans-serif; color: #1e293b;">
          <p style="margin: 6px 0;"><strong>অ্যারেনা:</strong> The Turf Noakhali</p>
          <p style="margin: 6px 0;"><strong>তারিখ:</strong> ${new Date(formData.bookingDate).toLocaleDateString("bn-BD")}</p>
          <p style="margin: 6px 0;"><strong>সময় স্লট:</strong> ${formData.timeSlot}</p>
          <p style="margin: 6px 0;"><strong>পেমেন্ট:</strong> ${formData.paymentType === "cod" ? "ক্যাশ অন বুকিং" : "বিকাশ অগ্রিম"}</p>
          <p style="margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            <strong>এখন প্রদীয় পরিমাণ:</strong> 
            <span style="color: #10b981; font-size: 1.25rem; font-weight: bold;">
              ৳${formData.paymentType === "cod"
          ? Number(formData.cashAmount || 0).toLocaleString()
          : Number(formData.advanceAmount || 0).toLocaleString()}
            </span>
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, বুকিং কনফার্ম করুন",
      cancelButtonText: "বাতিল",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);

    try {
      const bookingData = {
        arenaName: ARENA_NAME,
        bookingDate: formData.bookingDate,
        timeSlot: formData.timeSlot,
        notes: formData.notes,
        paymentType: formData.paymentType,
        cashAmount: Number(formData.cashAmount || 0),
        paidAmount:
          formData.paymentType === "cod"
            ? Number(formData.cashAmount || 0)
            : formData.advanceAmount,
        totalAmount:
          formData.paymentType === "advance"
            ? formData.advanceAmount
            : formData.paymentType === "cod"
              ? Number(formData.cashAmount || 0)
              : finalPrice,
        finalPrice: finalPrice,
        originalAmount: slotBasePrice,
        couponCode: couponData?.code || null,
        discountAmount: totalDiscountAmount,
        bookingByRole: session?.user?.role || "GUEST",
        ...((isStaff || isGuest) && {
          bookingForName: formData.bookingForName,
          bookingForPhone: formData.bookingForPhone,
        }),
        ...(!isStaff && !isGuest && {
          bookingForName: session?.user?.name,
          bookingForPhone: session?.user?.phone,
        }),
      };

      // COD Booking Flow
      if (formData.paymentType === "cod") {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...bookingData,
            paymentMethod: "COD",
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          toast.error(data.error || "বুকিং ব্যর্থ হয়েছে");
          setSubmitting(false);
          return;
        }

        Swal.fire({
          icon: "success",
          title: "বুকিং সফল হয়েছে!",
          text: "আপনার স্লটটি সফলভাবে বুক করা হয়েছে।",
          timer: 2000,
          showConfirmButton: false,
        });

        handleCloseModal();
        fetchSlots(selectedDate);
        const redirectPath = isGuest ? "/?status=success" : "/dashboard";
        setTimeout(() => router.push(redirectPath), 2000);
        return;
      }

      // Automated bKash flow
      const response = await fetch("/api/bkash/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: bookingData.totalAmount,
          bookingData: bookingData,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "বিকাশ পেমেন্ট শুরু করা যায়নি");

      if (data.bkashURL) {
        window.location.href = data.bkashURL;
        return;
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.message || "বুকিং তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper date buttons (Today, Tomorrow, Day after...)
  const getDateOption = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return {
      dateStr: d.toISOString().split("T")[0],
      dayName:
        offsetDays === 0
          ? "আজ"
          : offsetDays === 1
          ? "আগামীকাল"
          : d.toLocaleDateString("bn-BD", { weekday: "short" }),
      formattedDate: d.toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
    };
  };

  const quickDates = [
    getDateOption(0),
    getDateOption(1),
    getDateOption(2),
    getDateOption(3),
    getDateOption(4),
  ];

  // Filter slots based on period
  const filteredSlots = slots.filter((item) => {
    if (periodFilter === "all") return true;
    const periodInfo = getBengaliSlotPeriod(item.slot);
    if (periodFilter === "morning") return periodInfo.type === "bhor" || periodInfo.type === "sokal";
    if (periodFilter === "afternoon") return periodInfo.type === "dupur" || periodInfo.type === "bikel";
    if (periodFilter === "night") return periodInfo.type === "sonda" || periodInfo.type === "raat";
    return true;
  });

  const availableCount = slots.filter(
    (item) => item.status === "available" && !isMaintenanceBlockedSlot(selectedDate, item.slot)
  ).length;

  return (
    <div className="slot-booking-container">
      {/* Top Banner Header */}
      <div className="slot-booking-header">
        <div className="slot-booking-badge">
          <span>OFFICIAL MATCH SLOT RESERVATIONS</span>
        </div>
        <h1 className="slot-booking-title">THE TURF NOAKHALI</h1>
        <p className="slot-booking-subtitle">
          আপনার পছন্দের দিন ও সময় বেছে নিয়ে অনলাইনে ম্যাচ বুকিং সম্পন্ন করুন • সর্বনিম্ন ৳৫০০ অ্যাডভান্স দিয়ে স্লট কনফার্ম করুন
        </p>

        {/* Quick Date Select Tabs */}
        <div className="date-picker-section">
          <div className="quick-dates-tabs">
            {quickDates.map((item) => (
              <button
                key={item.dateStr}
                type="button"
                className={`date-tab-btn ${selectedDate === item.dateStr ? "active" : ""}`}
                onClick={() => setSelectedDate(item.dateStr)}
              >
                <span className="tab-day-name">{item.dayName}</span>
                <span className="tab-date-num">{item.formattedDate}</span>
              </button>
            ))}

            <div className="custom-date-picker-wrap">
              <Calendar className="calendar-icon" size={17} />
              <input
                type="date"
                className="custom-date-input"
                min={getTodayStr()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Period Filter Tabs & Available Count Bar */}
        <div className="slot-filter-row">
          <div className="period-filter-tabs">
            <button
              type="button"
              className={`filter-tab-btn ${periodFilter === "all" ? "active" : ""}`}
              onClick={() => setPeriodFilter("all")}
            >
              সব স্লট ({slots.length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${periodFilter === "morning" ? "active" : ""}`}
              onClick={() => setPeriodFilter("morning")}
            >
              ☀️ সকাল (০৫:০০ - ১২:০০)
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${periodFilter === "afternoon" ? "active" : ""}`}
              onClick={() => setPeriodFilter("afternoon")}
            >
              ⛅ বিকাল (১২:০০ - ০৬:০০)
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${periodFilter === "night" ? "active" : ""}`}
              onClick={() => setPeriodFilter("night")}
            >
              🌙 রাত ও পিক (০৬:০০ - ১২:০০)
            </button>
          </div>

          <div className="slot-count-badge">
            <span className="count-dot"></span>
            <span>{availableCount}টি স্লট খালি আছে</span>
          </div>
        </div>
      </div>

      {/* Temporary Maintenance Notice Banner */}
      {isMaintenanceBlockedSlot(selectedDate, "05:00am to 06:00am") && (
        <div
          style={{
            marginTop: "20px",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: "14px",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#fca5a5",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
        >
          <AlertCircle size={22} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <strong>বিশেষ বিজ্ঞপ্তি:</strong> আগামী <strong>১ অক্টোবর রাত ১০:০০ টা</strong> পর্যন্ত সব ধরণের স্লট বুকিং সাময়িকভাবে বন্ধ থাকবে। ১ অক্টোবর রাত ১০:০০ টা থেকে বুকিং পুনরায় চালু হবে।
          </div>
        </div>
      )}

      {/* Slots List Grid */}
      <div className="slots-grid-wrapper">
        {loadingSlots ? (
          <div className="slots-loading-state">
            <div className="spinner"></div>
            <p>স্লটের সময়সূচী ও রেট লোড হচ্ছে...</p>
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="slots-empty-state">
            <AlertCircle size={40} color="#f59e0b" />
            <p>এই সময়ে কোনো স্লট পাওয়া যায়নি। অন্য সময় ফিল্টার নির্বাচন করুন।</p>
          </div>
        ) : (
          <div className="slots-grid">
            {filteredSlots.map((item) => {
              const priceInfo = getSlotPriceDetails(item.slot);
              const periodInfo = getBengaliSlotPeriod(item.slot);
              const PeriodIcon =
                periodInfo.type === "bhor"
                  ? Sunrise
                  : periodInfo.type === "sokal" || periodInfo.type === "dupur"
                  ? Sun
                  : periodInfo.type === "bikel" || periodInfo.type === "sonda"
                  ? Sunset
                  : Moon;

              const isBlocked =
                item.status === "blocked" || isMaintenanceBlockedSlot(selectedDate, item.slot);
              const isAvailable = !isBlocked && item.status === "available";
              const isBooked = !isBlocked && item.status === "booked";
              const isHolding = !isBlocked && item.status === "holding";

              return (
                <div
                  key={item.slot}
                  className={`slot-card ${
                    isBlocked
                      ? "blocked"
                      : isAvailable
                      ? "available"
                      : isBooked
                      ? "booked"
                      : isHolding
                      ? "holding"
                      : "past"
                  }`}
                >
                  {/* Top Meta Bar: Date & Slot Period */}
                  <div className="slot-card-meta-top">
                    <div className="slot-card-date">
                      <Calendar size={12} className="meta-icon" />
                      <span>{formatBengaliDate(selectedDate)}</span>
                    </div>
                    <div className={`slot-period-tag period-${periodInfo.type}`}>
                      <PeriodIcon size={12} className="meta-icon" />
                      <span>{periodInfo.label}</span>
                    </div>
                  </div>

                  {/* Slot Time & Price */}
                  <div className="slot-card-header">
                    <div className="slot-time-box">
                      <Clock size={16} className="clock-icon" />
                      <span className="slot-time-text">{item.slot}</span>
                    </div>
                    <div className="slot-price-tag">
                      {priceInfo.weekdayDiscountAmount > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "2px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "#64748b",
                                fontSize: "0.75rem",
                                fontWeight: "500",
                              }}
                            >
                              ৳{priceInfo.basePrice.toLocaleString("bn-BD")}
                            </span>
                            <span
                              style={{
                                fontWeight: "800",
                                color: "#10b981",
                                fontSize: "1.1rem",
                                letterSpacing: "-0.3px",
                              }}
                            >
                              ৳{priceInfo.finalPrice.toLocaleString("bn-BD")}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: "0.65rem",
                              backgroundColor: "#10b981",
                              color: "#061a11",
                              padding: "1px 7px",
                              borderRadius: "4px",
                              fontWeight: "800",
                              letterSpacing: "0.3px",
                              boxShadow: "0 2px 6px rgba(16,185,129,0.25)",
                            }}
                          >
                            ২০% ছাড়
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontWeight: "800", color: "#10b981", fontSize: "1.1rem" }}>
                          ৳{priceInfo.finalPrice.toLocaleString("bn-BD")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Duration & Availability Badge */}
                  <div className="slot-card-body">
                    <span className="slot-meta-info">৬০ মিনিট • 6v6/7v7</span>
                    <span
                      className={`slot-status-badge ${
                        isBlocked
                          ? "status-blocked"
                          : isAvailable
                          ? "status-available"
                          : isHolding
                          ? "status-holding"
                          : isBooked
                          ? "status-booked"
                          : "status-past"
                      }`}
                    >
                      {isBlocked ? (
                        <>
                          <AlertCircle size={13} /> বুকিং বন্ধ
                        </>
                      ) : isAvailable ? (
                        <>
                          <CheckCircle2 size={13} /> উপলব্ধ
                        </>
                      ) : isHolding ? (
                        <>
                          <AlertCircle size={13} /> হোল্ড
                        </>
                      ) : isBooked ? (
                        <>
                          <User size={13} /> {item.bookedForName || "বুকড"}
                        </>
                      ) : (
                        "সময় অতিক্রান্ত"
                      )}
                    </span>
                  </div>

                  {/* Action CTA Button */}
                  <div className="slot-card-footer">
                    <button
                      type="button"
                      disabled={!isAvailable}
                      className={`slot-action-btn ${isAvailable ? "btn-book" : "btn-disabled"}`}
                      onClick={() => handleOpenBookingModal(item)}
                    >
                      {isBlocked ? (
                        "বুকিং বন্ধ"
                      ) : isAvailable ? (
                        <>
                          বুক করুন <ChevronRight size={16} />
                        </>
                      ) : isHolding ? (
                        "হোল্ড আছে"
                      ) : isBooked ? (
                        item.bookedForName ? `বুকড (${item.bookedForName})` : "বুক করা হয়েছে"
                      ) : (
                        "অতিক্রান্ত"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOOKING MODAL POPUP */}
      {isModalOpen && selectedSlot && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            {/* Top Pill Handle */}
            <div className="modal-pill-bar"></div>

            {/* Close Button */}
            <button
              type="button"
              className="modal-close-btn"
              onClick={handleCloseModal}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Official Branding Header */}
            <div className="modal-brand-header">
              <Image
                src="/images/the-turf-noakhali-logo.png"
                alt="The Turf Noakhali"
                width={42}
                height={42}
                className="modal-logo-img"
              />
              <div className="modal-brand-info">
                <span className="modal-brand-title">THE TURF NOAKHALI</span>
                <span className="modal-brand-tag">অফিসিয়াল ম্যাচ স্লট রিজার্ভেশন</span>
              </div>
            </div>

            {/* Slot Header Info */}
            <div className="modal-slot-header">
              <div className="modal-slot-time-row">
                <h2 className="modal-slot-time">{selectedSlot.slot}</h2>
                <div className="modal-slot-price">
                  ৳{currentSlotPrice.toLocaleString("bn-BD")}
                </div>
              </div>
              <div className="modal-slot-subtitle">
                📅 {formatBengaliDate(selectedDate)} (
                {selectedDate === getTodayStr()
                  ? "আজ"
                  : getBengaliSlotPeriod(selectedSlot.slot).label}
                ) • {getBengaliSlotPeriod(selectedSlot.slot).label} • ৬০ মিনিট ম্যাচ
              </div>
            </div>

            {/* Modal Body Form */}
            <form className="modal-booking-form" onSubmit={handleSubmitBooking}>
              {(isStaff || isGuest) && (
                <>
                  <div className="modal-input-group">
                    <label className="modal-field-label">আপনার পুরো নাম:</label>
                    <div className="modal-input-wrapper">
                      <User size={18} className="input-field-icon" />
                      <input
                        type="text"
                        name="bookingForName"
                        className="modal-input"
                        placeholder="যেমন: আরিয়ান আহমেদ"
                        value={formData.bookingForName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {errors.bookingForName && (
                      <span className="modal-error-text">{errors.bookingForName}</span>
                    )}
                  </div>

                  <div className="modal-input-group">
                    <label className="modal-field-label">সচল মোবাইল নম্বর:</label>
                    <div className="modal-input-wrapper">
                      <Phone size={18} className="input-field-icon" />
                      <input
                        type="tel"
                        name="bookingForPhone"
                        className="modal-input"
                        placeholder="01XXXXXXXXX"
                        value={formData.bookingForPhone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {errors.bookingForPhone && (
                      <span className="modal-error-text">{errors.bookingForPhone}</span>
                    )}
                  </div>
                </>
              )}

              {/* Payment Methods */}
              <div className="modal-payment-section">
                <label className="modal-section-label">পেমেন্ট মাধ্যম:</label>

                <div className="modal-payment-options">
                  <label
                    className={`modal-payment-option-card ${
                      formData.paymentType === "advance" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      value="advance"
                      checked={formData.paymentType === "advance"}
                      onChange={handleChange}
                    />
                    <div className="payment-option-content">
                      <span className="payment-option-title">
                        বিকাশ অনলাইন অগ্রিম (সর্বনিম্ন ৳{MIN_ADVANCE})
                      </span>
                      <span className="payment-option-sub">
                        অবশিষ্ট টাকা মাঠে খেলার সময় পরিশোধযোগ্য
                      </span>
                    </div>
                    <Image
                      src={bkashLogo}
                      alt="bKash"
                      width={34}
                      height={34}
                      className="payment-logo"
                    />
                  </label>

                  {canUseCOD && (
                    <label
                      className={`modal-payment-option-card ${
                        formData.paymentType === "cod" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentType"
                        value="cod"
                        checked={formData.paymentType === "cod"}
                        onChange={handleChange}
                      />
                      <div className="payment-option-content">
                        <span className="payment-option-title">ক্যাশ অন বুকিং (অন-গ্রাউন্ড)</span>
                        <span className="payment-option-sub">অ্যাডমিন / স্টাফ প্যানেল অনুমোদিত</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Advance Amount Custom Input */}
              {formData.paymentType === "advance" && (
                <div className="modal-input-group">
                  <label className="modal-field-label">অগ্রিম প্রদানের পরিমাণ (৳):</label>
                  <div className="modal-input-wrapper">
                    <span
                      className="input-field-icon"
                      style={{ color: "#10b981", fontWeight: "bold", fontSize: "16px" }}
                    >
                      ৳
                    </span>
                    <input
                      type="number"
                      min={MIN_ADVANCE}
                      name="advanceAmount"
                      className="modal-input"
                      value={formData.advanceAmount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData((prev) => ({ ...prev, advanceAmount: val }));
                        if (val < MIN_ADVANCE) {
                          setErrors((prev) => ({
                            ...prev,
                            advanceAmount: `অ্যাডভান্স ন্যূনতম ৳${MIN_ADVANCE} হতে হবে`,
                          }));
                        } else {
                          setErrors((prev) => ({ ...prev, advanceAmount: "" }));
                        }
                      }}
                    />
                  </div>
                  {errors.advanceAmount && (
                    <span className="modal-error-text">{errors.advanceAmount}</span>
                  )}
                </div>
              )}

              {/* COD Cash Amount Input for Admins */}
              {formData.paymentType === "cod" && canEnterCashAmount && (
                <div className="modal-input-group">
                  <label className="modal-field-label">ক্যাশ পেমেন্ট পরিমাণ (৳):</label>
                  <div className="modal-input-wrapper">
                    <span
                      className="input-field-icon"
                      style={{ color: "#10b981", fontWeight: "bold", fontSize: "16px" }}
                    >
                      ৳
                    </span>
                    <input
                      type="number"
                      name="cashAmount"
                      className="modal-input"
                      placeholder="ক্যাশ পরিমাণ লিখুন"
                      value={formData.cashAmount}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {/* Coupon Code Section */}
              <div className="modal-input-group">
                <label className="modal-field-label">কুপন কোড (যদি থাকে):</label>
                <div className="coupon-input-flex">
                  <div className="modal-input-wrapper flex-1">
                    <Tag size={16} className="input-field-icon" />
                    <input
                      type="text"
                      name="couponCode"
                      className="modal-input text-uppercase"
                      placeholder="যেমন: TURF100"
                      value={formData.couponCode}
                      onChange={handleChange}
                      disabled={!!couponData}
                    />
                  </div>

                  {!couponData ? (
                    <button
                      type="button"
                      className="modal-apply-btn"
                      onClick={handleApplyCoupon}
                      disabled={verifyingCoupon || !formData.couponCode}
                    >
                      {verifyingCoupon ? "যাচাই..." : "প্রয়োগ"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="modal-remove-btn"
                      onClick={handleRemoveCoupon}
                    >
                      বাতিল
                    </button>
                  )}
                </div>

                {couponData && (
                  <div className="coupon-success-alert">
                    ✓ কুপন যুক্ত হয়েছে: {couponData.description} (ছাড়: ৳{couponData.discountAmount})
                  </div>
                )}
              </div>

              {/* Notes Input */}
              <div className="modal-input-group">
                <label className="modal-field-label">বিশেষ নোট বা দলের নাম (ঐচ্ছিক):</label>
                <div className="modal-input-wrapper">
                  <FileText size={18} className="input-field-icon" />
                  <input
                    type="text"
                    name="notes"
                    className="modal-input"
                    placeholder="যেমন: নোয়াখালী এফসি বনাম সোনাইমুড়ী রাইডার্স"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Summary box */}
              <div className="modal-summary-box">
                <div className="summary-row">
                  <span>স্লটের মূল মূল্য:</span>
                  <span
                    style={
                      weekdayDiscountAmount > 0
                        ? { textDecoration: "line-through", opacity: 0.7 }
                        : {}
                    }
                  >
                    ৳{slotBasePrice.toLocaleString("bn-BD")}
                  </span>
                </div>

                {weekdayDiscountAmount > 0 && (
                  <div className="summary-row discount-row">
                    <span>কর্মদিবস ছাড় (২০%):</span>
                    <span style={{ color: "#34d399", fontWeight: "bold" }}>
                      - ৳{weekdayDiscountAmount.toLocaleString("bn-BD")}
                    </span>
                  </div>
                )}

                {couponData && (
                  <div className="summary-row discount-row">
                    <span>কুপন ছাড়:</span>
                    <span style={{ color: "#f87171", fontWeight: "bold" }}>
                      - ৳{couponDiscountAmount.toLocaleString("bn-BD")}
                    </span>
                  </div>
                )}

                <div className="summary-row highlight-row">
                  <span>মোট প্রদেয় স্লট ফি:</span>
                  <span className="payable-price">
                    ৳{finalPrice.toLocaleString("bn-BD")}
                  </span>
                </div>

                {formData.paymentType === "advance" && (
                  <>
                    <div
                      className="summary-row"
                      style={{
                        marginTop: "6px",
                        paddingTop: "8px",
                        borderTop: "1px dashed rgba(255, 255, 255, 0.12)",
                      }}
                    >
                      <span>এখন প্রদীয় অনলাইন অগ্রিম:</span>
                      <span style={{ fontWeight: "800", color: "#10b981", fontSize: "1.05rem" }}>
                        ৳{Number(formData.advanceAmount || 0).toLocaleString("bn-BD")}
                      </span>
                    </div>

                    <div className="summary-row" style={{ color: "#94a3b8", fontSize: "12px" }}>
                      <span>মাঠে খেলার সময় অবশিষ্ট দেয়:</span>
                      <span style={{ color: "#e2e8f0", fontWeight: "600" }}>
                        ৳{Math.max(0, finalPrice - (formData.advanceAmount || 0)).toLocaleString("bn-BD")}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="modal-hold-submit-btn"
              >
                {submitting ? "বুকিং প্রসেসিং হচ্ছে..." : "বুকিং নিশ্চিত করুন"}
              </button>

              {/* Trust Badge Disclaimer */}
              <div className="modal-trust-badge">
                <ShieldCheck size={16} className="trust-icon" />
                <span>বিকাশ সুরক্ষিত পেমেন্ট গেটওয়ের মাধ্যমে তাত্ক্ষণিক নিশ্চিতকরণ</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
