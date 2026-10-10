import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createBkashPayment } from "@/lib/bkash";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    const session = await auth();
    // Allow guest checkout, so we don't return 401 if !session

    await connectDB();

    const { amount, bookingData } = await request.json();

    if (!amount || !bookingData) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    // Check if slot is already booked
    const existingBooking = await Booking.findOne({
      arenaName: bookingData.arenaName,
      bookingDate: new Date(bookingData.bookingDate),
      timeSlot: bookingData.timeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "This slot is already booked" },
        { status: 400 }
      );
    }

    let userId = null;
    if (session?.user?.email) {
      const dbUser = await User.findOne({ email: session.user.email });
      if (dbUser) {
        userId = dbUser._id;
      }
    }

    // Amount to be paid NOW via bKash
    const paymentAmount = amount; 

    // Create a pending booking
    let pendingBooking = null;
    try {
      pendingBooking = await Booking.create({
        ...bookingData,
        user: userId,
        bookingDate: new Date(bookingData.bookingDate),
        status: "pending",
        paymentStatus: "unpaid",
        totalAmount: bookingData.finalPrice, // The full discounted price
        paidAmount: 0, 
        remainingAmount: bookingData.finalPrice,
        transactionId: "BKASH_PENDING",
      });

      const callbackURL = `${process.env.NEXTAUTH_URL}/api/bkash/callback`;

      const paymentData = await createBkashPayment(paymentAmount, pendingBooking._id.toString(), callbackURL, bookingData.bookingForPhone);

      if (paymentData.statusCode !== "0000") {
        // If bKash fails, delete the pending booking
        if (pendingBooking) {
          await Booking.findByIdAndDelete(pendingBooking._id);
        }
        return NextResponse.json({ error: paymentData.statusMessage }, { status: 400 });
      }

      // Save bKash Payment ID for later cleanup/tracking
      pendingBooking.bkashPaymentID = paymentData.paymentID;
      await pendingBooking.save();

      return NextResponse.json({ bkashURL: paymentData.bkashURL });
    } catch (createErr) {
      if (pendingBooking?._id) {
        await Booking.findByIdAndDelete(pendingBooking._id).catch(() => {});
      }
      throw createErr;
    }
  } catch (error) {
    console.error("BKASH CREATE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
