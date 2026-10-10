import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { getActiveHolds } from "@/lib/holdStore";
import { TIME_SLOTS, isMaintenanceBlockedSlot } from "@/lib/pricing";

function parseTimeSlot(timeStr) {
  const match = timeStr.match(/(\d+):(\d+)(am|pm)/i);
  if (!match) return null;

  let hour = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toLowerCase();

  if (period === "pm" && hour !== 12) {
    hour += 12;
  } else if (period === "am" && hour === 12) {
    hour = 0;
  }

  return { hour, minutes };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const arenaName = searchParams.get("arena");
    const dateParam = searchParams.get("date");

    if (!arenaName || !dateParam) {
      return NextResponse.json({ error: "Missing arena or date" }, { status: 400 });
    }

    await connectDB();

    // Cleanup abandoned pending bookings (older than 15 minutes)
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    await Booking.deleteMany({
      status: "pending",
      createdAt: { $lt: fifteenMinsAgo }
    });

    
    const selectedDate = new Date(dateParam);
    selectedDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    console.log("Fetching bookings for:", {
      arenaName,
      dateParam,
      selectedDate: selectedDate.toISOString(),
      nextDay: nextDay.toISOString()
    });

    const bookings = await Booking.find({
      arenaName,
      bookingDate: {
        $gte: selectedDate,
        $lt: nextDay
      },
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("user", "name")
      .select("timeSlot status bookingDate bookingForName userName user");

    const bookedMap = new Map();
    bookings.forEach(b => {
      const name = b.bookingForName || b.userName || b.user?.name || "";
      bookedMap.set(b.timeSlot, {
        status: b.status,
        bookedForName: name
      });
    });

    console.log("Found bookings:", bookings.length, bookings.map(b => ({
      slot: b.timeSlot,
      status: b.status,
      date: b.bookingDate,
      name: b.bookingForName || b.userName || b.user?.name
    })));

    // Convert current time to Bangladesh timezone (Asia/Dhaka)
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    const isToday = selectedDate.toDateString() === now.toDateString();

    const activeHolds = getActiveHolds();

    const slots = TIME_SLOTS.map(slot => {
      let status = "available";
      let bookedForName = null;

      const holdKey = `${arenaName}_${dateParam}_${slot}`;
      const isBlocked = isMaintenanceBlockedSlot(dateParam, slot);

      if (isBlocked) {
        status = "blocked";
      } else if (bookedMap.has(slot)) {
        const info = bookedMap.get(slot);
        status = "booked";
        bookedForName = info.bookedForName;
      } else if (activeHolds.has(holdKey)) {
        status = "holding";
      }

      if (!isBlocked && isToday && status !== "booked" && status !== "holding") {
        const [startTime] = slot.split(" to ");
        const parsed = parseTimeSlot(startTime);

        if (parsed) {
          const slotStart = new Date(now);
          slotStart.setHours(parsed.hour, parsed.minutes, 0, 0);

          if (slotStart <= now) {
            status = "past";
          }
        }
      }

      return { slot, status, bookedForName };
    });

    console.log("Final slots response:", {
      total: slots.length,
      available: slots.filter(s => s.status === "available").length,
      booked: slots.filter(s => s.status === "booked").length,
      past: slots.filter(s => s.status === "past").length
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}