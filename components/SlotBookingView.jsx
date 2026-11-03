"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  ChevronLeft,
  Sun,
  Sunset,
  Moon,
  Sunrise,
  ShieldCheck,
  Layers,
  Trophy,
  Zap,
  Users,
  Coffee,
  Check,
} from "lucide-react";
import {
  calculateSlotPrice,
  isMaintenanceBlockedSlot,
  formatBengaliDate,
  getBengaliSlotPeriod,
} from "@/lib/pricing";

const ARENA_NAME = "Turf Noakhali";
const MIN_ADVANCE = 500;

export default function SlotBookingView() {
  const router = useRouter();
  const { data: session } = useSession();

  // Helper for today's YYYY-MM-DD
  const getTodayStr = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const todayStr = getTodayStr();

  // Date selection state
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week starting today
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  // Slot filter and data states
  const [periodFilter, setPeriodFilter] = useState("all");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [arenaPricing, setArenaPricing] = useState(null);

  // Selected Slot for Booking
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State inside Modal
  const [formData, setFormData] = useState({
    arenaName: ARENA_NAME,
    bookingDate: todayStr,
    timeSlot: "",
    notes: "",
    teamName: "",
    paymentType: "advance",
    bookingForName: "",
    bookingForPhone: "",
    advanceAmount: MIN_ADVANCE,
    couponCode: "",
    cashAmount: "",
    agreeTerms: true,
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

  // Pre-fill user data from session
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        bookingForName: prev.bookingForName || session.user.name || "",
        bookingForPhone: prev.bookingForPhone || session.user.phone || "",
      }));
    }
  }, [session]);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const clientIdRef = useRef(
    typeof window !== "undefined"
      ? Math.random().toString(36).substring(2) + Date.now().toString(36)
      : "client"
  );

  useEffect(() => {
    fetchSlots(selectedDate);
    // If selected slot is on a different date, reset it
    setSelectedSlot(null);
  }, [selectedDate]);

  // Release hold if window unloads
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

  // Generate 7 consecutive days starting from today + weekOffset
  const generate7Days = (offset) => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + offset + i);
      const ymd = d.toISOString().split("T")[0];
      const isToday = ymd === todayStr;
      const isTomorrow =
        ymd ===
        new Date(base.getTime() + 86400000).toISOString().split("T")[0];

      const dayName = isToday
        ? "Today"
        : isTomorrow
        ? "Tomorrow"
        : d.toLocaleDateString("en-US", { weekday: "short" });

      const dayNum = String(d.getDate()).padStart(2, "0");
      const monthShort = d.toLocaleDateString("en-US", { month: "short" });

      list.push({
        ymd,
        dayName,
        dayNum,
        monthShort,
        fullDate: d,
        isToday,
      });
    }
    return list;
  };

  const current7Days = generate7Days(weekOffset);

  // Month & Year display for current viewing week
  const weekMonthYearText = (() => {
    const firstDate = current7Days[0]?.fullDate || new Date();
    return firstDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  })();

  // Handle custom date pick from calendar input
  const handleCustomDateSelect = (e) => {
    const chosen = e.target.value;
    if (!chosen) return;

    const chosenDate = new Date(chosen + "T00:00:00");
    const todayDate = new Date(todayStr + "T00:00:00");
    const diffDays = Math.floor((chosenDate - todayDate) / 86400000);

    if (diffDays >= 0) {
      setWeekOffset(Math.floor(diffDays / 7) * 7);
      setSelectedDate(chosen);
      setShowDatePicker(false);
    } else {
      toast.error("পূর্ববর্তী তারিখ নির্বাচন করা যাবে না।");
    }
  };

  // Helper to parse slot times: e.g. "06:00pm to 07:00pm"
  const parseSlotTimeDisplay = (slotStr) => {
    if (!slotStr) return { start: "", end: "", display: "" };
    const parts = slotStr.split(/\s*to\s*/i);
    if (parts.length === 2) {
      const fmt = (s) => {
        const m = s.trim().match(/(\d+):(\d+)\s*(am|pm)/i);
        if (!m) return s;
        return `${m[1]}:${m[2]} ${m[3].toUpperCase()}`;
      };
      const start = fmt(parts[0]);
      const end = fmt(parts[1]);
      return { start, end, display: `${start} – ${end}` };
    }
    return { start: slotStr, end: "", display: slotStr };
  };

  // Check if slot has already passed for today
  const isSlotPastToday = (slotStr, dateStr) => {
    if (dateStr !== todayStr) return false;
    const match = slotStr.match(/(\d+):(\d+)\s*(am|pm)/i);
    if (!match) return false;

    let hour = parseInt(match[1], 10);
    const min = parseInt(match[2], 10);
    const period = match[3].toLowerCase();
    if (period === "pm" && hour !== 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const slotEndMinutes = hour * 60 + min + 60; // 60-minute duration
    return currentMinutes >= slotEndMinutes;
  };

  // Price helper for a slot
  const getSlotPriceDetails = (slotTime, date = selectedDate) => {
    return calculateSlotPrice(slotTime, date, arenaPricing);
  };

  // Shift filters definition
  const SHIFT_FILTERS = [
    { id: "all", label: "All Slots", labelBn: "সকল স্লট", emoji: "" },
    { id: "morning", label: "Morning", labelBn: "সকাল", emoji: "🌅" },
    { id: "midday", label: "Midday", labelBn: "দুপুর", emoji: "☀️" },
    { id: "afternoon", label: "Afternoon", labelBn: "বিকাল", emoji: "⛅" },
    { id: "night", label: "Night", labelBn: "রাত", emoji: "🌙" },
  ];

  // Filter slots by shift
  const filteredSlots = slots.filter((item) => {
    if (periodFilter === "all") return true;
    const p = getBengaliSlotPeriod(item.slot).type;
    if (periodFilter === "morning") return p === "bhor" || p === "sokal";
    if (periodFilter === "midday") return p === "dupur";
    if (periodFilter === "afternoon") return p === "bikel" || p === "sonda";
    if (periodFilter === "night") return p === "raat";
    return true;
  });

  // Calculate available slots count
  const availableCount = slots.filter((item) => {
    const isBlocked =
      item.status === "blocked" || isMaintenanceBlockedSlot(selectedDate, item.slot);
    const isPast = isSlotPastToday(item.slot, selectedDate);
    return item.status === "available" && !isBlocked && !isPast;
  }).length;

  // Handle selecting an available slot card
  const handleSelectSlot = (item) => {
    const isBlocked =
      item.status === "blocked" || isMaintenanceBlockedSlot(selectedDate, item.slot);
    const isPast = isSlotPastToday(item.slot, selectedDate);

    if (isBlocked) {
      toast.error("১ অক্টোবর রাত ১০:০০ টা পর্যন্ত স্লট বুকিং সাময়িকভাবে বন্ধ আছে।");
      return;
    }
    if (item.status === "booked") {
      toast.error("এই স্লটটি ইতিমধ্যে বুক করা হয়ে গেছে।");
      return;
    }
    if (item.status === "holding") {
      toast.error("অন্য একজন ব্যবহারকারী বর্তমানে এই স্লটটি বুকিং করছেন।");
      return;
    }
    if (isPast) {
      toast.error("এই স্লটের খেলার সময় অতিক্রান্ত হয়ে গেছে।");
      return;
    }

    // Toggle or set selected slot
    if (selectedSlot?.slot === item.slot) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot(item);
      setFormData((prev) => ({
        ...prev,
        bookingDate: selectedDate,
        timeSlot: item.slot,
      }));

      // On mobile screens (< 1024px), smooth scroll to booking summary card
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setTimeout(() => {
          const el = document.getElementById("booking-summary-section");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 120);
      }
    }
  };

  // Proceed to modal and acquire temporary hold
  const handleProceedToBookingModal = async () => {
    if (!selectedSlot) {
      toast.error("অনুগ্রহ করে প্রথমে একটি খালি স্লট সিলেক্ট করুন।");
      return;
    }

    try {
      const res = await fetch("/api/bookings/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arenaName: ARENA_NAME,
          date: selectedDate,
          slot: selectedSlot.slot,
          action: "hold",
          clientId: clientIdRef.current,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(
          data.error ||
            "এই স্লটটি বর্তমানে অন্য একজন ব্যবহারকারী বুকিং প্রসেস করছেন।"
        );
        fetchSlots(selectedDate);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        bookingDate: selectedDate,
        timeSlot: selectedSlot.slot,
        paymentType: "advance",
        advanceAmount: MIN_ADVANCE,
      }));
      setCouponData(null);
      setErrors({});
      setIsModalOpen(true);
      fetchSlots(selectedDate);
    } catch (err) {
      console.error("Error setting hold:", err);
      toast.error("স্লট চেক করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  // Close modal and release hold
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
    fetchSlots(selectedDate);
  };

  // Form input handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Price calculations for selected slot
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
    toast.success("কুপন সরানো হয়েছে");
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.bookingDate) newErrors.bookingDate = "তারিখ নির্বাচন করুন";
    if (!formData.timeSlot) newErrors.timeSlot = "সময় স্লট নির্বাচন করুন";
    if (!formData.paymentType) newErrors.paymentType = "পেমেন্ট মাধ্যম নির্বাচন করুন";

    if (isStaff || isGuest) {
      if (!formData.bookingForName?.trim())
        newErrors.bookingForName = "ক্যাপ্টেনের পুরো নাম লিখুন";
      if (!formData.bookingForPhone?.trim()) {
        newErrors.bookingForPhone = "ক্যাপ্টেনের মোবাইল নম্বর লিখুন";
      } else if (!/^01[3-9]\d{8}$/.test(formData.bookingForPhone.trim())) {
        newErrors.bookingForPhone = "১১ ডিজিটের সঠিক মোবাইল নম্বর দিন";
      }
    }

    if (formData.paymentType === "advance" && formData.advanceAmount < MIN_ADVANCE) {
      newErrors.advanceAmount = `সর্বনিম্ন অগ্রিম পেমেন্ট ৳${MIN_ADVANCE}`;
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "টার্ফের নিয়মাবলী ও শর্তাবলীর সাথে সম্মতি প্রদান করুন";
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
          <p style="margin: 6px 0;"><strong>তারিখ:</strong> ${formatBengaliDate(formData.bookingDate)}</p>
          <p style="margin: 6px 0;"><strong>সময় স্লট:</strong> ${formData.timeSlot}</p>
          <p style="margin: 6px 0;"><strong>পেমেন্ট মাধ্যম:</strong> ${
            formData.paymentType === "cod" ? "ক্যাশ অন গ্রাউন্ড" : "বিকাশ অনলাইন অগ্রিম"
          }</p>
          <p style="margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            <strong>এখন প্রদীয় পরিমাণ:</strong> 
            <span style="color: #000000; font-size: 1.25rem; font-weight: bold;">
              ৳${
                formData.paymentType === "cod"
                  ? Number(formData.cashAmount || 0).toLocaleString()
                  : Number(formData.advanceAmount || 0).toLocaleString()
              }
            </span>
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, বুকিং কনফার্ম করুন",
      cancelButtonText: "বাতিল",
      confirmButtonColor: "#000000",
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
        teamName: formData.teamName,
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
        ...(!isStaff &&
          !isGuest && {
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

  const selectedSlotTimeDisplay = selectedSlot
    ? parseSlotTimeDisplay(selectedSlot.slot)
    : null;
  const selectedSlotPeriod = selectedSlot
    ? getBengaliSlotPeriod(selectedSlot.slot)
    : null;

  return (
    <div className="modern-booking-wrapper">
      {/* 12-Column Responsive Layout Matching Amishapara */}
      <div className="modern-booking-grid">
        {/* Left Column: 8 Columns */}
        <div className="booking-main-col">
          {/* STEP 1: SELECT DATE */}
          <div className="booking-step-box">
            <div className="step-box-header">
              <div className="step-title-group">
                <span className="step-number-badge">1</span>
                <div>
                  <h2 className="step-title-text">Select Date</h2>
                  <p className="step-subtitle-text">
                    Choose a date to see available match slots
                  </p>
                </div>
              </div>

              {/* View Calendar Button */}
              <div className="calendar-popover-wrapper" ref={datePickerRef}>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="btn-view-calendar"
                >
                  <Calendar size={15} className="text-emerald" />
                  <span>View Calendar</span>
                </button>

                {showDatePicker && (
                  <div className="calendar-dropdown-card">
                    <span className="dropdown-label">যেকোনো তারিখ বেছে নিন:</span>
                    <input
                      type="date"
                      min={todayStr}
                      value={selectedDate}
                      onChange={handleCustomDateSelect}
                      className="custom-calendar-input"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 7-Day Navigation Bar with < and > */}
            <div className="week-nav-row">
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => Math.max(0, prev - 7))}
                disabled={weekOffset <= 0}
                className="week-arrow-btn"
                aria-label="Previous 7 days"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="week-month-display">{weekMonthYearText}</span>

              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev + 7)}
                className="week-arrow-btn"
                aria-label="Next 7 days"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* 7 Days Strip */}
            <div className="days-strip-container">
              {current7Days.map((day) => {
                const isSelected = selectedDate === day.ymd;
                return (
                  <button
                    key={day.ymd}
                    type="button"
                    onClick={() => setSelectedDate(day.ymd)}
                    className={`day-strip-card ${isSelected ? "selected" : ""}`}
                  >
                    <span className="day-card-name">{day.dayName}</span>
                    <span className="day-card-num">{day.dayNum}</span>
                    <span className="day-card-month">{day.monthShort}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: SELECT TIME SLOT */}
          <div className="booking-step-box">
            <div className="step-box-header flex-between">
              <div className="step-title-group">
                <span className="step-number-badge">2</span>
                <div>
                  <h2 className="step-title-text">
                    Select Time Slot ({formatBengaliDate(selectedDate)})
                  </h2>
                  <p className="step-subtitle-text">
                    {availableCount}টি স্লট খালি আছে
                  </p>
                </div>
              </div>

              {/* Status Legend Pills */}
              <div className="slot-legend-group">
                <span className="legend-item">
                  <span className="legend-dot dot-available"></span>
                  <span>Available</span>
                </span>
                <span className="legend-item">
                  <span className="legend-dot dot-booked"></span>
                  <span>Booked / Passed</span>
                </span>
              </div>
            </div>

            {/* Shift Filter Tabs */}
            <div className="shift-filter-pill-bar">
              {SHIFT_FILTERS.map((filter) => {
                const isActive = periodFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setPeriodFilter(filter.id)}
                    className={`shift-pill-btn ${isActive ? "active" : ""}`}
                  >
                    {filter.emoji && (
                      <span className="filter-emoji">{filter.emoji}</span>
                    )}
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Slots Grid */}
            <div className="slots-cards-grid">
              {loadingSlots ? (
                // Pulse Shimmer Loading Placeholders
                Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="slot-shimmer-card">
                    <div className="shimmer-top">
                      <div className="shimmer-pill"></div>
                      <div className="shimmer-badge"></div>
                    </div>
                    <div className="shimmer-mid">
                      <div className="shimmer-line wide"></div>
                      <div className="shimmer-line narrow"></div>
                    </div>
                    <div className="shimmer-bot">
                      <div className="shimmer-price"></div>
                      <div className="shimmer-tag"></div>
                    </div>
                  </div>
                ))
              ) : filteredSlots.length === 0 ? (
                <div className="slots-empty-notice">
                  <AlertCircle size={32} className="text-amber" />
                  <p>এই সময়ে কোনো স্লট পাওয়া যায়নি। অনুগ্রহ করে অন্য শিফট ফিল্টার নির্বাচন করুন।</p>
                </div>
              ) : (
                filteredSlots.map((item) => {
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
                    item.status === "blocked" ||
                    isMaintenanceBlockedSlot(selectedDate, item.slot);
                  const isBooked = !isBlocked && item.status === "booked";
                  const isHolding = !isBlocked && item.status === "holding";
                  const isPast =
                    !isBlocked && !isBooked && isSlotPastToday(item.slot, selectedDate);
                  const isAvailable =
                    !isBlocked && !isBooked && !isHolding && !isPast && item.status === "available";
                  const isSelected = selectedSlot?.slot === item.slot;

                  const timeDisplay = parseSlotTimeDisplay(item.slot);

                  // Badge color theme based on shift
                  const shiftTheme =
                    periodInfo.type === "raat"
                      ? "shift-night"
                      : periodInfo.type === "bikel" || periodInfo.type === "sonda"
                      ? "shift-afternoon"
                      : periodInfo.type === "dupur"
                      ? "shift-midday"
                      : "shift-morning";

                  return (
                    <button
                      key={item.slot}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => handleSelectSlot(item)}
                      className={`slot-card-item ${
                        isSelected
                          ? "state-selected"
                          : isAvailable
                          ? "state-available"
                          : isBooked
                          ? "state-booked"
                          : isHolding
                          ? "state-holding"
                          : "state-past"
                      }`}
                    >
                      {/* Top Row: Shift Pill & Status / Checkmark */}
                      <div className="slot-card-meta">
                        <span className={`slot-shift-tag ${shiftTheme}`}>
                          <PeriodIcon size={11} className="shift-icon-svg" />
                          <span>{periodInfo.label.toUpperCase()}</span>
                        </span>

                        {isSelected ? (
                          <div className="selected-circle-check">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        ) : isBooked ? (
                          <span className="status-pill pill-booked">Booked</span>
                        ) : isHolding ? (
                          <span className="status-pill pill-holding">Holding</span>
                        ) : isPast ? (
                          <span className="status-pill pill-passed">Passed</span>
                        ) : null}
                      </div>

                      {/* Middle: Slot Time with Stylish Arrow */}
                      <div className="slot-card-time">
                        <div className="time-range-display">
                          <span>{timeDisplay.start}</span>
                          <span className="time-arrow">→</span>
                          <span>{timeDisplay.end}</span>
                        </div>
                        <div className="time-period-label">
                          {periodInfo.label} শিফট • ম্যাচ
                        </div>
                      </div>

                      {/* Bottom Row: Price & 60M Duration */}
                      <div className="slot-card-footer">
                        <div className="slot-price-section">
                          {priceInfo.weekdayDiscountAmount > 0 ? (
                            <div className="price-strike-combo">
                              <span className="base-strikethrough">
                                ৳{priceInfo.basePrice.toLocaleString()}
                              </span>
                              <span className="final-price-text">
                                ৳{priceInfo.finalPrice.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="final-price-text">
                              ৳{priceInfo.finalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <span className="slot-duration-pill">
                          <Clock size={10} />
                          <span>60M</span>
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: 4 Columns (Sticky Sidebar) */}
        <div className="booking-sidebar-col">
          {/* BOOKING SUMMARY CARD */}
          <div id="booking-summary-section" className="summary-card-box">
            <div className="summary-header">
              <div className="summary-icon-wrapper">
                <Calendar size={18} />
              </div>
              <div>
                <h3 className="summary-title">Booking Summary</h3>
                <p className="summary-subtitle">বুকিং সারসংক্ষেপ</p>
              </div>
            </div>

            <div className="summary-fields-list">
              {/* Date */}
              <div className="summary-row">
                <span className="row-label">
                  <Calendar size={14} className="row-icon" />
                  <span>Date (তারিখ)</span>
                </span>
                <span className="row-value font-bold">
                  {formatBengaliDate(selectedDate)}
                </span>
              </div>

              {/* Time */}
              <div className="summary-row">
                <span className="row-label">
                  <Clock size={14} className="row-icon" />
                  <span>Time (সময়)</span>
                </span>
                <div className="row-value text-right">
                  {selectedSlot ? (
                    <>
                      <span className="slot-name-highlight">
                        {selectedSlotTimeDisplay.display}
                      </span>
                      <span className="slot-sub-info">
                        60 Mins ({selectedSlotPeriod.label})
                      </span>
                    </>
                  ) : (
                    <span className="text-placeholder">No Slot Selected</span>
                  )}
                </div>
              </div>

              {/* Players */}
              <div className="summary-row">
                <span className="row-label">
                  <Users size={14} className="row-icon" />
                  <span>Players (খেলোয়াড়)</span>
                </span>
                <span className="row-value">9-A Side</span>
              </div>

              {/* Slot Rate */}
              <div className="summary-row">
                <span className="row-label">
                  <Tag size={14} className="row-icon" />
                  <span>Slot Rate (টার্ফ ফি)</span>
                </span>
                <span className="row-value font-bold">
                  {selectedSlot
                    ? `৳${selectedSlotPriceInfo.finalPrice.toLocaleString()}`
                    : "৳০"}
                </span>
              </div>

              {/* Coupon Applied (if any) */}
              {couponData && (
                <div className="summary-coupon-badge-row">
                  <span className="coupon-badge-label">
                    <Tag size={12} />
                    <span>Coupon ({couponData.code})</span>
                  </span>
                  <span className="coupon-badge-val">
                    -৳{couponData.discountAmount}
                  </span>
                </div>
              )}
            </div>

            {/* Total Divider */}
            <div className="summary-total-bar">
              <div>
                <span className="total-title">Total Amount</span>
                {couponData && (
                  <span className="discount-saved-note">
                    ৳{couponData.discountAmount} discount saved
                  </span>
                )}
              </div>
              <div className="text-right">
                {couponData && (
                  <span className="total-strikethrough-num">
                    ৳{selectedSlotPriceInfo.finalPrice.toLocaleString()}
                  </span>
                )}
                <span className="total-grand-num">
                  ৳{finalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Main Action CTA */}
            <button
              type="button"
              disabled={!selectedSlot}
              onClick={handleProceedToBookingModal}
              className={`btn-proceed-cta ${selectedSlot ? "active" : "disabled"}`}
            >
              <span>
                {selectedSlot
                  ? "Proceed to Booking (বুকিং এগিয়ে নিন)"
                  : "Select an Available Slot"}
              </span>
              <ChevronRight size={18} />
            </button>

            {/* Slot Shift Note */}
            {selectedSlot && (
              <div className="slot-detail-note">
                <div className="note-icon-box">
                  <Clock size={14} />
                </div>
                <div className="note-content">
                  <span className="note-heading">
                    {selectedSlotPeriod.label} Shift Slot
                  </span>
                  <span className="note-desc">
                    Standard 60-minute match under official The Turf Noakhali scheduling.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* FACILITIES CARD */}
          <div className="facilities-sidebar-card">
            <h3 className="facilities-sidebar-title">Our Facilities • সুবিধাসমূহ</h3>
            <div className="facilities-sidebar-list">
              <div className="facility-sidebar-item">
                <div className="facility-icon-wrap">
                  <Trophy size={16} />
                </div>
                <div>
                  <h4 className="facility-item-title">Premium Turf</h4>
                  <p className="facility-item-desc">High quality FIFA playing surface</p>
                </div>
              </div>

              <div className="facility-sidebar-item">
                <div className="facility-icon-wrap">
                  <Zap size={16} />
                </div>
                <div>
                  <h4 className="facility-item-title">Bright Lighting</h4>
                  <p className="facility-item-desc">Play day &amp; night with daylight floodlights</p>
                </div>
              </div>

              <div className="facility-sidebar-item">
                <div className="facility-icon-wrap">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="facility-item-title">Safe &amp; Secure</h4>
                  <p className="facility-item-desc">24/7 CCTV &amp; secure ground perimeter</p>
                </div>
              </div>

              <div className="facility-sidebar-item">
                <div className="facility-icon-wrap">
                  <Layers size={16} />
                </div>
                <div>
                  <h4 className="facility-item-title">Changing Room</h4>
                  <p className="facility-item-desc">Clean and comfortable dressing area</p>
                </div>
              </div>

              <div className="facility-sidebar-item">
                <div className="facility-icon-wrap">
                  <Users size={16} />
                </div>
                <div>
                  <h4 className="facility-item-title">Parking Space</h4>
                  <p className="facility-item-desc">Dedicated parking for players &amp; visitors</p>
                </div>
              </div>

              <div className="facility-sidebar-item">
                <div className="facility-icon-wrap">
                  <Coffee size={16} />
                </div>
                <div>
                  <h4 className="facility-item-title">Refreshment Area</h4>
                  <p className="facility-item-desc">Chilled energy drinks &amp; snacks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM HIGHLIGHTS BANNER (4 Cards) */}
      <div className="booking-highlights-row">
        <div className="highlight-feature-card">
          <div className="highlight-icon-box">
            <Users size={22} />
          </div>
          <div>
            <h4>9-A-Side Pitch</h4>
            <p>Ideal for 9-a-side competitive matches.</p>
          </div>
        </div>

        <div className="highlight-feature-card">
          <div className="highlight-icon-box">
            <Zap size={22} />
          </div>
          <div>
            <h4>Instant Confirmation</h4>
            <p>Real-time slot lock upon reservation.</p>
          </div>
        </div>

        <div className="highlight-feature-card">
          <div className="highlight-icon-box">
            <Sun size={22} />
          </div>
          <div>
            <h4>Daylight Floodlights</h4>
            <p>Play round the clock with high lumen lights.</p>
          </div>
        </div>

        <div className="highlight-feature-card">
          <div className="highlight-icon-box">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4>৳500 Advance Lock</h4>
            <p>Lock your slot with only ৳500 advance via bKash.</p>
          </div>
        </div>
      </div>

      {/* COMPLETE YOUR RESERVATION MODAL */}
      {isModalOpen && selectedSlot && (
        <div className="modal-backdrop-overlay" onClick={handleCloseModal}>
          <div
            className="checkout-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className="modal-x-close-btn"
              onClick={handleCloseModal}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="modal-top-header">
              <h3 className="modal-title-text">Complete Your Reservation</h3>
              <p className="modal-sub-info">
                {formatBengaliDate(selectedDate)} •{" "}
                <strong>{selectedSlotTimeDisplay?.display}</strong> (60 Mins)
              </p>
            </div>

            {/* Scrollable Form Body */}
            <div className="modal-form-scrollable">
              <form onSubmit={handleSubmitBooking} className="checkout-form">
                {/* User Info Bar if Logged In */}
                {session?.user && (
                  <div className="logged-user-banner">
                    <div className="user-info-flex">
                      <div className="user-avatar-badge">
                        {(session.user.name || "U").slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <span className="user-name-text">
                          {session.user.name || "Member"}
                        </span>
                        <span className="user-phone-text">
                          {session.user.phone || session.user.email}
                        </span>
                      </div>
                    </div>
                    <div className="user-badge-flex">
                      <span className="verified-account-badge">
                        <Check size={11} strokeWidth={3} />
                        Verified Account
                      </span>
                      <button
                        type="button"
                        onClick={() => signOut()}
                        className="btn-logout-link"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                )}

                {/* 2-Column Inputs Grid */}
                <div className="checkout-grid-two-cols">
                  {/* Left Column: Captain & Team */}
                  <div className="checkout-inputs-col">
                    {(isStaff || isGuest) && (
                      <>
                        <div className="form-field-group">
                          <label className="field-label-text">
                            Captain Name (ক্যাপ্টেনের নাম) <span className="req">*</span>
                          </label>
                          <div className="input-with-icon">
                            <User size={16} className="field-icon" />
                            <input
                              type="text"
                              name="bookingForName"
                              required
                              placeholder="e.g. Rafiq Chowdhury"
                              value={formData.bookingForName}
                              onChange={handleChange}
                              className="field-input-box"
                            />
                          </div>
                          {errors.bookingForName && (
                            <span className="error-note">
                              {errors.bookingForName}
                            </span>
                          )}
                        </div>

                        <div className="form-field-group">
                          <label className="field-label-text">
                            Captain Phone Number (মোবাইল নম্বর) <span className="req">*</span>
                          </label>
                          <div className="input-with-icon">
                            <Phone size={16} className="field-icon" />
                            <input
                              type="tel"
                              name="bookingForPhone"
                              required
                              maxLength={11}
                              placeholder="01XXXXXXXXX"
                              value={formData.bookingForPhone}
                              onChange={handleChange}
                              className="field-input-box font-mono"
                            />
                          </div>
                          {errors.bookingForPhone && (
                            <span className="error-note">
                              {errors.bookingForPhone}
                            </span>
                          )}
                        </div>
                      </>
                    )}

                    <div className="form-field-group">
                      <label className="field-label-text">
                        Team Name (দলের নাম - ঐচ্ছিক)
                      </label>
                      <div className="input-with-icon">
                        <Users size={16} className="field-icon" />
                        <input
                          type="text"
                          name="teamName"
                          placeholder="e.g. Noakhali Kings"
                          value={formData.teamName}
                          onChange={handleChange}
                          className="field-input-box"
                        />
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label className="field-label-text">
                        Special Notes (বিশেষ নোট - ঐচ্ছিক)
                      </label>
                      <div className="input-with-icon">
                        <FileText size={16} className="field-icon" />
                        <input
                          type="text"
                          name="notes"
                          placeholder="যেকোনো বিশেষ নির্দেশনা"
                          value={formData.notes}
                          onChange={handleChange}
                          className="field-input-box"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Coupon & Payment */}
                  <div className="checkout-inputs-col">
                    {/* Promo / Coupon Box */}
                    <div className="coupon-promo-box">
                      <div className="coupon-header-row">
                        <label className="coupon-label">
                          <Tag size={14} className="text-emerald" />
                          <span>Promo / Coupon Code</span>
                        </label>
                        {couponData && (
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="btn-remove-coupon"
                          >
                            Remove Coupon
                          </button>
                        )}
                      </div>

                      {couponData ? (
                        <div className="coupon-applied-alert">
                          <div className="coupon-badge-applied">
                            <CheckCircle2 size={16} className="text-emerald" />
                            <div>
                              <span className="coupon-code-text">
                                {couponData.code}
                              </span>
                              <span className="coupon-sub-text">
                                ৳{couponData.discountAmount} Discount Applied
                              </span>
                            </div>
                          </div>
                          <span className="coupon-discount-tag">
                            -৳{couponData.discountAmount}
                          </span>
                        </div>
                      ) : (
                        <div className="coupon-input-action-row">
                          <input
                            type="text"
                            placeholder="e.g. TURF100"
                            value={formData.couponCode}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                couponCode: e.target.value.toUpperCase(),
                              }))
                            }
                            className="coupon-input-field"
                          />
                          <button
                            type="button"
                            disabled={verifyingCoupon || !formData.couponCode.trim()}
                            onClick={handleApplyCoupon}
                            className="btn-apply-coupon"
                          >
                            {verifyingCoupon ? "Verifying..." : "Apply"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Payment Method Selection */}
                    <div className="payment-options-card">
                      <label className="payment-card-heading">
                        Payment Method (পেমেন্ট মাধ্যম)
                      </label>

                      <div className="payment-choices-list">
                        {/* bKash Online Option */}
                        <label
                          className={`payment-choice-item ${
                            formData.paymentType === "advance" ? "active" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentType"
                            value="advance"
                            checked={formData.paymentType === "advance"}
                            onChange={handleChange}
                            className="choice-radio"
                          />
                          <div className="choice-info">
                            <span className="choice-name">
                              Pay ৳500 Advance via bKash
                            </span>
                            <span className="choice-desc">
                              বিকাশে সর্বনিম্ন ৳৫০০ অগ্রিম জমা দিয়ে তাৎক্ষণিক স্লট কনফার্ম করুন
                            </span>
                          </div>
                          <Image
                            src={bkashLogo}
                            alt="bKash"
                            width={32}
                            height={32}
                            className="choice-logo"
                          />
                        </label>

                        {/* COD Cash Option for allowed roles */}
                        {canUseCOD && (
                          <label
                            className={`payment-choice-item ${
                              formData.paymentType === "cod" ? "active" : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentType"
                              value="cod"
                              checked={formData.paymentType === "cod"}
                              onChange={handleChange}
                              className="choice-radio"
                            />
                            <div className="choice-info">
                              <span className="choice-name">Cash on Ground (COD)</span>
                              <span className="choice-desc">
                                অ্যাডমিন / স্টাফ অনুমোদিত ক্যাশ অন গ্রাউন্ড বুকিং
                              </span>
                            </div>
                          </label>
                        )}
                      </div>

                      {/* Advance Amount Customization */}
                      {formData.paymentType === "advance" && (
                        <div className="advance-custom-group">
                          <label className="advance-label">
                            অনলাইন অগ্রিম জমার পরিমাণ (৳):
                          </label>
                          <div className="input-with-icon">
                            <span className="taka-symbol">৳</span>
                            <input
                              type="number"
                              min={MIN_ADVANCE}
                              name="advanceAmount"
                              value={formData.advanceAmount}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setFormData((prev) => ({
                                  ...prev,
                                  advanceAmount: val,
                                }));
                                if (val < MIN_ADVANCE) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    advanceAmount: `ন্যূনতম অগ্রিম ৳${MIN_ADVANCE} হতে হবে`,
                                  }));
                                } else {
                                  setErrors((prev) => ({
                                    ...prev,
                                    advanceAmount: "",
                                  }));
                                }
                              }}
                              className="field-input-box"
                            />
                          </div>
                          {errors.advanceAmount && (
                            <span className="error-note">
                              {errors.advanceAmount}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Cash Amount Input for COD */}
                      {formData.paymentType === "cod" && canEnterCashAmount && (
                        <div className="advance-custom-group">
                          <label className="advance-label">
                            ক্যাশ জমার পরিমাণ (৳):
                          </label>
                          <div className="input-with-icon">
                            <span className="taka-symbol">৳</span>
                            <input
                              type="number"
                              name="cashAmount"
                              placeholder="ক্যাশ পরিমাণ লিখুন"
                              value={formData.cashAmount}
                              onChange={handleChange}
                              className="field-input-box"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing Breakdown Card */}
                <div className="modal-summary-breakdown">
                  <div className="breakdown-row">
                    <span>স্লটের মূল ফি:</span>
                    <span
                      className={
                        weekdayDiscountAmount > 0 ? "line-through opacity-70" : ""
                      }
                    >
                      ৳{slotBasePrice.toLocaleString()}
                    </span>
                  </div>

                  {weekdayDiscountAmount > 0 && (
                    <div className="breakdown-row discount-text">
                      <span>কর্মদিবস ছাড় (২০%):</span>
                      <span>-৳{weekdayDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  {couponData && (
                    <div className="breakdown-row discount-text">
                      <span>কুপন ছাড় ({couponData.code}):</span>
                      <span>-৳{couponDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="breakdown-row total-highlight">
                    <span>মোট প্রদেয় ম্যাচ ফি:</span>
                    <span className="total-highlight-val">
                      ৳{finalPrice.toLocaleString()}
                    </span>
                  </div>

                  {formData.paymentType === "advance" && (
                    <>
                      <div className="breakdown-row advance-highlight">
                        <span>এখন প্রদীয় অনলাইন অগ্রিম:</span>
                        <span className="advance-highlight-val">
                          ৳{Number(formData.advanceAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="breakdown-row due-ground-text">
                        <span>মাঠে খেলার সময় অবশিষ্ট দেয়:</span>
                        <span>
                          ৳{Math.max(
                            0,
                            finalPrice - (formData.advanceAmount || 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="terms-checkbox-wrap">
                  <label className="checkbox-flex-label">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="terms-checkbox-input"
                    />
                    <span className="terms-text">
                      আমি The Turf Noakhali-এর মাঠের নিয়মাবলী, বাতিলকরণ ও রিফান্ড পলিসির
                      সাথে একমত পোষণ করছি।
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <span className="error-note">{errors.agreeTerms}</span>
                  )}
                </div>

                {/* Modal Action Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-modal-submit"
                >
                  {submitting ? (
                    "বুকিং প্রসেসিং হচ্ছে..."
                  ) : formData.paymentType === "cod" ? (
                    "ক্যাশ অন বুকিং নিশ্চিত করুন"
                  ) : (
                    `বুকিং নিশ্চিত করুন এবং বিকাশ দিয়ে অগ্রিম প্রদান করুন (৳${Number(
                      formData.advanceAmount || MIN_ADVANCE
                    ).toLocaleString()})`
                  )}
                </button>

                {/* Security Trust Badges */}
                <div className="modal-trust-footer">
                  <ShieldCheck size={16} className="text-emerald" />
                  <span>
                    তাত্ক্ষণিক নিশ্চিতকরণ • বিকাশ পেমেন্ট গেটওয়ের মাধ্যমে ১০০% নিরাপদ
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
