export const TIME_SLOTS = [
  "05:00am to 06:00am",
  "06:00am to 07:00am",
  "07:00am to 08:00am",
  "08:00am to 09:00am",
  "09:00am to 10:00am",
  "10:00am to 11:00am",
  "11:00am to 12:00pm",
  "12:00pm to 01:00pm",
  "01:00pm to 02:00pm",
  "02:00pm to 03:00pm",
  "03:00pm to 04:00pm",
  "04:00pm to 05:00pm",
  "05:00pm to 06:00pm",
  "06:00pm to 07:00pm",
  "07:00pm to 08:00pm",
  "08:00pm to 09:00pm",
  "09:00pm to 10:00pm",
  "10:00pm to 11:00pm",
  "11:00pm to 12:00am",
  "12:00am to 01:00am",
  "01:00am to 02:00am",
  "02:00am to 03:00am",
  "03:00am to 04:00am",
  "04:00am to 05:00am"
];

// Base prices per schedule if not overridden in DB
export const SLOT_BASE_PRICES = {
  "05:00am to 06:00am": 2500,
  "06:00am to 07:00am": 2500,
  "07:00am to 08:00am": 2500,
  "08:00am to 09:00am": 2500,
  "09:00am to 10:00am": 2500,
  "10:00am to 11:00am": 2000,
  "11:00am to 12:00pm": 2000,
  "12:00pm to 01:00pm": 2000,
  "01:00pm to 02:00pm": 2000,
  "02:00pm to 03:00pm": 2000,
  "03:00pm to 04:00pm": 2000,
  "04:00pm to 05:00pm": 3000,
  "05:00pm to 06:00pm": 3000,
  "06:00pm to 07:00pm": 3000,
  "07:00pm to 08:00pm": 3000,
  "08:00pm to 09:00pm": 3000,
  "09:00pm to 10:00pm": 3000,
  "10:00pm to 11:00pm": 3000,
  "11:00pm to 12:00am": 3000,
  "12:00am to 01:00am": 3000,
  "01:00am to 02:00am": 3000,
  "02:00am to 03:00am": 2500,
  "03:00am to 04:00am": 2500,
  "04:00am to 05:00am": 2500
};

/**
 * Determine the day type from a booking date.
 * Returns: "friday" | "saturday" | "regular"
 */
export function getDayType(dateInput) {
  if (!dateInput) return "regular";

  let dayOfWeek;
  if (typeof dateInput === "string") {
    const cleanDateStr = dateInput.split("T")[0];
    const [y, m, d] = cleanDateStr.split("-").map(Number);
    dayOfWeek = new Date(y, m - 1, d).getDay();
  } else if (dateInput instanceof Date) {
    dayOfWeek = dateInput.getDay();
  }

  if (dayOfWeek === 5) return "friday";
  if (dayOfWeek === 6) return "saturday";
  return "regular";
}

/**
 * Checks if a specific date and time slot falls within the Weekend window.
 * Weekend definition: Thursday 4:00 PM to Sunday 2:00 AM
 */
export function isWeekendSlot(dateInput, timeSlot) {
  if (!dateInput) return false;

  let dateObj;
  if (typeof dateInput === 'string') {
    const cleanDateStr = dateInput.split('T')[0];
    const [y, m, d] = cleanDateStr.split('-').map(Number);
    dateObj = new Date(y, m - 1, d);
  } else {
    dateObj = new Date(dateInput);
  }

  const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 4 = Thu, 5 = Fri, 6 = Sat

  // Friday (5) & Saturday (6) are full weekend
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    return true;
  }

  // Parse start hour of timeSlot (e.g. "05:00pm to 06:30pm")
  const match = timeSlot?.match(/(\d+):(\d+)(am|pm)/i);
  let startHour = 0;
  if (match) {
    startHour = parseInt(match[1], 10);
    const period = match[3].toLowerCase();
    if (period === "pm" && startHour !== 12) startHour += 12;
    if (period === "am" && startHour === 12) startHour = 0;
  }

  // Thursday (4): Weekend starts from 4:00 PM (16:00)
  if (dayOfWeek === 4) {
    return startHour >= 16;
  }

  // Sunday (0): Weekend continues until 2:00 AM (startHour < 2, e.g. "12:30am to 02:00am")
  if (dayOfWeek === 0) {
    return startHour < 2;
  }

  // Mon (1), Tue (2), Wed (3) are regular weekdays
  return false;
}

/**
 * Calculates slot price details based on slot time, date, and DB arena pricing config.
 */
export function calculateSlotPrice(timeSlot, dateInput, arenaPricing = null) {
  const dayType = getDayType(dateInput);

  // Use local SLOT_BASE_PRICES as the default base price
  let basePrice = SLOT_BASE_PRICES[timeSlot] || 3000;

  if (arenaPricing) {
    let override = null;
    if (dayType === "friday" && Array.isArray(arenaPricing.fridayTimeSlots)) {
      override = arenaPricing.fridayTimeSlots.find((s) => s.slot === timeSlot);
    } else if (dayType === "saturday" && Array.isArray(arenaPricing.saturdayTimeSlots)) {
      override = arenaPricing.saturdayTimeSlots.find((s) => s.slot === timeSlot);
    }

    if (!override && Array.isArray(arenaPricing.timeSlots)) {
      override = arenaPricing.timeSlots.find((s) => s.slot === timeSlot);
    }

    // Only apply DB override if it is distinct and non-zero
    if (override && typeof override.price === "number" && !isNaN(override.price) && override.price > 0) {
      // If DB override value matches local final price (e.g. 1600 when base is 2000), preserve local base price
      const localBase = SLOT_BASE_PRICES[timeSlot];
      if (localBase && Math.round(localBase * 0.8) === override.price) {
        basePrice = localBase;
      } else {
        basePrice = override.price;
      }
    }
  }

  const isWeekend = isWeekendSlot(dateInput, timeSlot);
  const discountRate = 0.20; // 20% discount on all days (including Friday & Saturday)
  const weekdayDiscountAmount = Math.round(basePrice * discountRate);
  const finalPrice = Math.max(0, basePrice - weekdayDiscountAmount);

  return {
    basePrice,
    isWeekend,
    weekdayDiscountAmount,
    discountRate,
    finalPrice
  };
}

/**
 * Checks if a slot falls within the temporary blocked period:
 * From today until October 1st night 9:00pm - 10:00pm slot.
 * Starting from October 1st 10:00pm - 11:00pm slot onwards, slots are open.
 */
export function isMaintenanceBlockedSlot(dateInput, timeSlot) {
  if (!dateInput) return false;

  let dateStr = "";
  if (typeof dateInput === "string") {
    dateStr = dateInput.split("T")[0];
  } else if (dateInput instanceof Date) {
    const y = dateInput.getFullYear();
    const m = String(dateInput.getMonth() + 1).padStart(2, "0");
    const d = String(dateInput.getDate()).padStart(2, "0");
    dateStr = `${y}-${m}-${d}`;
  }

  const currentYear = new Date().getFullYear();
  const oct1Str = `${currentYear}-10-01`;

  // Any date before October 1st is blocked
  if (dateStr < oct1Str) {
    return true;
  }

  // On October 1st, slots up to and including 09:00pm to 10:00pm are blocked
  if (dateStr === oct1Str) {
    if (!timeSlot) return true;
    const slotIndex = TIME_SLOTS.indexOf(timeSlot);
    const cutoffIndex = TIME_SLOTS.indexOf("09:00pm to 10:00pm");
    if (slotIndex !== -1 && cutoffIndex !== -1) {
      return slotIndex <= cutoffIndex;
    }
    const blockedOct1 = [
      "05:00am to 06:00am",
      "06:00am to 07:00am",
      "07:00am to 08:00am",
      "08:00am to 09:00am",
      "09:00am to 10:00am",
      "10:00am to 11:00am",
      "11:00am to 12:00pm",
      "12:00pm to 01:00pm",
      "01:00pm to 02:00pm",
      "02:00pm to 03:00pm",
      "03:00pm to 04:00pm",
      "04:00pm to 05:00pm",
      "05:00pm to 06:00pm",
      "06:00pm to 07:00pm",
      "07:00pm to 08:00pm",
      "08:00pm to 09:00pm",
      "09:00pm to 10:00pm"
    ];
    return blockedOct1.includes(timeSlot);
  }

  // After October 1st, booking is open
  return false;
}

export const convertToBengaliDigits = (numStr) => {
  if (numStr === null || numStr === undefined) return "";
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(numStr).replace(/\d/g, (d) => banglaDigits[d]);
};

export const BANGLA_MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

export function formatBengaliDate(dateInput) {
  if (!dateInput) return "";
  const cleanDateStr = typeof dateInput === "string" ? dateInput.split("T")[0] : "";
  if (!cleanDateStr || !cleanDateStr.includes("-")) return "";

  const [year, month, day] = cleanDateStr.split("-").map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return "";

  const banglaDay = convertToBengaliDigits(day);
  const banglaMonth = BANGLA_MONTHS[month - 1] || "";
  const banglaYear = convertToBengaliDigits(year);

  return `${banglaDay} ${banglaMonth}, ${banglaYear}`;
}

export function getBengaliSlotPeriod(timeSlot) {
  if (!timeSlot) return { type: "sokal", label: "সকাল", period: "সকাল" };

  const match = timeSlot.match(/(\d+):(\d+)(am|pm)/i);
  if (!match) return { type: "sokal", label: "সকাল", period: "সকাল" };

  let hour = parseInt(match[1], 10);
  const periodStr = match[3].toLowerCase();

  if (periodStr === "pm" && hour !== 12) hour += 12;
  if (periodStr === "am" && hour === 12) hour = 0;

  // 05:00 am to 07:00 am -> ভোর
  if (hour >= 5 && hour < 7) {
    return { type: "bhor", label: "ভোর", period: "ভোর" };
  }
  // 07:00 am to 11:00 am -> সকাল
  else if (hour >= 7 && hour < 11) {
    return { type: "sokal", label: "সকাল", period: "সকাল" };
  }
  // 11:00 am to 03:00 pm -> দুপুর
  else if (hour >= 11 && hour < 15) {
    return { type: "dupur", label: "দুপুর", period: "দুপুর" };
  }
  // 03:00 pm to 05:00 pm -> বিকাল
  else if (hour >= 15 && hour < 17) {
    return { type: "bikel", label: "বিকাল", period: "বিকাল" };
  }
  // 05:00 pm to 07:00 pm -> সন্ধ্যা
  else if (hour >= 17 && hour < 19) {
    return { type: "sonda", label: "সন্ধ্যা", period: "সন্ধ্যা" };
  }
  // 07:00 pm to 05:00 am -> রাত
  else {
    return { type: "raat", label: "রাত", period: "রাত" };
  }
}


